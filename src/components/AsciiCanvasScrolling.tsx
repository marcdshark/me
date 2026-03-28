import { useRef, useEffect } from 'react'
import { createNoise2D } from '../lib/noise'
import {
  CHARS,
  rasterizeSvgToGrayscale,
  floydSteinbergDither,
} from '../lib/asciiRenderer'

interface Props {
  svgSource: string
}

const FONT_SIZE = 10
const NOISE_SCALE = 24
const NOISE_SPEED = 1
const PARTICLE_STRENGTH = 0.45
const DRIFT_X = 2
const DRIFT_Y = 0.5
const INTENSITY_OFFSET = 3
const SHARK_DENSITY = 0.00035

/** Simple seeded PRNG */
function mulberry32(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function AsciiCanvasScrolling({ svgSource }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    const noise2D = createNoise2D(42)

    let animId: number
    let worldGrid: Int8Array | null = null // -1 = empty, 0+ = char index
    let worldCols = 0
    let worldRows = 0
    let totalCols = 0
    let totalRows = 0
    let charWidth = 0
    let charHeight = FONT_SIZE

    const filledSvg = svgSource
      .replace(/fill="none"/g, '')
      .replace(/stroke="black"/g, 'fill="black"')
      .replace(/stroke-width="\d+"/g, '')

    async function setup() {
      const dpr = window.devicePixelRatio || 1
      const w = window.innerWidth
      const h = window.innerHeight

      canvas!.width = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx.scale(dpr, dpr)

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Courier New", monospace`
      charWidth = ctx.measureText('@').width || 6
      charHeight = FONT_SIZE * 1.2

      totalCols = Math.ceil(w / charWidth) + 1
      totalRows = Math.ceil(h / charHeight) + 1

      // Shark tile: medium size, ~12-15 across viewport
      const tileCols = Math.max(12, Math.floor(totalCols / 12))
      const tileRows = Math.floor(tileCols * (162 / 174))

      // Rasterize one shark
      const grayscale = await rasterizeSvgToGrayscale(filledSvg, tileCols, tileRows)
      const tileChars = floydSteinbergDither(grayscale, tileCols, tileRows, 0.8)

      // World is 3x viewport so scrolling wraps seamlessly
      worldCols = totalCols * 3
      worldRows = totalRows * 3

      // Build world grid: -1 means empty (will get noise particles)
      worldGrid = new Int8Array(worldCols * worldRows).fill(-1)

      // Scatter sharks randomly with no overlap
      const rand = mulberry32(42)
      const sharkCount = Math.floor(worldCols * worldRows * SHARK_DENSITY)
      const margin = 4 // min gap between sharks in chars

      // Track placed bounding boxes for overlap check
      const placed: { x: number; y: number; w: number; h: number }[] = []

      for (let attempt = 0; attempt < sharkCount * 20; attempt++) {
        if (placed.length >= sharkCount) break

        const px = Math.floor(rand() * (worldCols - tileCols))
        const py = Math.floor(rand() * (worldRows - tileRows))

        // Check overlap with margin
        let overlaps = false
        for (const box of placed) {
          if (
            px < box.x + box.w + margin &&
            px + tileCols + margin > box.x &&
            py < box.y + box.h + margin &&
            py + tileRows + margin > box.y
          ) {
            overlaps = true
            break
          }
        }
        if (overlaps) continue

        // Stamp shark into world grid
        for (let ty = 0; ty < tileRows; ty++) {
          for (let tx = 0; tx < tileCols; tx++) {
            const charIdx = tileChars[ty * tileCols + tx]
            // Only stamp non-empty chars (skip spaces)
            if (charIdx < CHARS.length - 1) {
              const shifted = Math.min(CHARS.length - 1, charIdx + INTENSITY_OFFSET)
              worldGrid[(py + ty) * worldCols + (px + tx)] = shifted
            }
          }
        }

        placed.push({ x: px, y: py, w: tileCols, h: tileRows })
      }
    }

    const startTime = performance.now()

    function render() {
      if (!worldGrid) {
        animId = requestAnimationFrame(render)
        return
      }

      const elapsed = (performance.now() - startTime) / 1000
      const offsetX = Math.floor(elapsed * DRIFT_X)
      const offsetY = Math.floor(elapsed * DRIFT_Y)

      const asciiColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--ascii-color')
        .trim()

      const dpr = window.devicePixelRatio || 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Courier New", monospace`
      ctx.fillStyle = asciiColor || 'rgba(200, 200, 210, 0.5)'
      ctx.textBaseline = 'top'

      const noiseTime = elapsed * NOISE_SPEED

      for (let row = 0; row < totalRows; row++) {
        let rowStr = ''
        for (let col = 0; col < totalCols; col++) {
          // Wrap into world grid with scroll offset
          const wx = ((col + offsetX) % worldCols + worldCols) % worldCols
          const wy = ((row + offsetY) % worldRows + worldRows) % worldRows
          const worldVal = worldGrid[wy * worldCols + wx]

          if (worldVal >= 0) {
            // Shark char — render it with very subtle noise
            const nx = col / NOISE_SCALE
            const ny = row / NOISE_SCALE
            const noiseVal = noise2D(nx, ny)
            const offset = Math.round(noiseVal * 0.1 * 4)
            const finalIndex = Math.max(0, Math.min(CHARS.length - 1, worldVal + offset))
            rowStr += CHARS[finalIndex]
          } else {
            // Empty space — render flowing noise particles
            const nx = (col + noiseTime) / NOISE_SCALE
            const ny = row / NOISE_SCALE
            const noiseVal = noise2D(nx, ny) // -1..1
            // Map noise to char index: mostly light chars, occasionally denser
            const mapped = (noiseVal + 1) / 2 // 0..1
            const charIndex = Math.round(mapped * PARTICLE_STRENGTH * (CHARS.length - 1))
            const finalIndex = Math.max(0, Math.min(CHARS.length - 1, CHARS.length - 1 - charIndex))
            rowStr += CHARS[finalIndex]
          }
        }
        ctx.fillText(rowStr, 0, row * charHeight)
      }

      animId = requestAnimationFrame(render)
    }

    setup().then(() => {
      animId = requestAnimationFrame(render)
    })

    function onResize() {
      setup()
    }

    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [svgSource])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}
