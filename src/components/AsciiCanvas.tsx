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
const SHARK_DENSITY_DESKTOP = 0.00035
const SHARK_DENSITY_TABLET = 0.0006
const SHARK_DENSITY_MOBILE = 0.0009
const FONT_STRING = `${FONT_SIZE}px "JetBrains Mono", "Courier New", monospace`

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

export default function AsciiCanvas({ svgSource }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    const noise2D = createNoise2D(42)

    let animId: number
    let worldGrid: Int8Array | null = null
    let worldCols = 0
    let worldRows = 0
    let totalCols = 0
    let totalRows = 0
    let charWidth = 0
    let charHeight = FONT_SIZE
    let currentDpr = window.devicePixelRatio || 1
    let bgColor = '#0a0a0f'

    const filledSvg = svgSource
      .replace(/fill="none"/g, '')
      .replace(/stroke="black"/g, 'fill="black"')
      .replace(/stroke-width="\d+"/g, '')

    async function setup() {
      // Fix 1: Wait for fonts to load before measuring
      await document.fonts.ready

      const dpr = window.devicePixelRatio || 1
      currentDpr = dpr

      const w = window.innerWidth
      const h = window.innerHeight

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      canvas!.width = Math.round(w * dpr)
      canvas!.height = Math.round(h * dpr)
      canvas!.style.width = `${w}px`
      canvas!.style.height = `${h}px`
      ctx.scale(dpr, dpr)

      // Fix 4: Measure on the actual rendering context (same font, same state)
      ctx.font = FONT_STRING
      charWidth = ctx.measureText('@').width || FONT_SIZE * 0.6
      charHeight = FONT_SIZE * 1.2

      totalCols = Math.ceil(w / charWidth) + 2
      totalRows = Math.ceil(h / charHeight) + 2

      // Read bg color for canvas fill
      bgColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg')
        .trim() || '#0a0a0f'

      // Bigger sharks on smaller screens so the logo shape is recognizable
      const tileDivisor = w < 768 ? 3 : w < 1200 ? 6 : 9
      const tileCols = Math.max(12, Math.floor(totalCols / tileDivisor))
      const tileRows = Math.floor(tileCols * (162 / 174))

      const grayscale = await rasterizeSvgToGrayscale(filledSvg, tileCols, tileRows)
      const tileChars = floydSteinbergDither(grayscale, tileCols, tileRows, 0.8)

      worldCols = totalCols * 3
      worldRows = totalRows * 3

      worldGrid = new Int8Array(worldCols * worldRows).fill(-1)

      const rand = mulberry32(42)
      const density = w < 768 ? SHARK_DENSITY_MOBILE : w < 1200 ? SHARK_DENSITY_TABLET : SHARK_DENSITY_DESKTOP
      const sharkCount = Math.floor(worldCols * worldRows * density)
      const margin = 4

      const placed: { x: number; y: number; w: number; h: number }[] = []

      for (let attempt = 0; attempt < sharkCount * 20; attempt++) {
        if (placed.length >= sharkCount) break

        const px = Math.floor(rand() * (worldCols - tileCols))
        const py = Math.floor(rand() * (worldRows - tileRows))

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

        for (let ty = 0; ty < tileRows; ty++) {
          for (let tx = 0; tx < tileCols; tx++) {
            const charIdx = tileChars[ty * tileCols + tx]
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

      // Detect DPR change (window moved to different monitor)
      const dpr = window.devicePixelRatio || 1
      if (Math.abs(dpr - currentDpr) > 0.01) {
        setup()
        return
      }

      const elapsed = (performance.now() - startTime) / 1000
      const offsetX = Math.floor(elapsed * DRIFT_X)
      const offsetY = Math.floor(elapsed * DRIFT_Y)

      const asciiColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--ascii-color')
        .trim()

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Fill with bg color first so edges never show through as bright
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, window.innerWidth + 10, window.innerHeight + 10)

      ctx.font = FONT_STRING
      ctx.fillStyle = asciiColor || 'rgba(200, 200, 210, 0.5)'
      ctx.textBaseline = 'top'

      const noiseTime = elapsed * NOISE_SPEED

      for (let row = 0; row < totalRows; row++) {
        let rowStr = ''
        for (let col = 0; col < totalCols; col++) {
          const wx = ((col + offsetX) % worldCols + worldCols) % worldCols
          const wy = ((row + offsetY) % worldRows + worldRows) % worldRows
          const worldVal = worldGrid[wy * worldCols + wx]

          if (worldVal >= 0) {
            const nx = col / NOISE_SCALE
            const ny = row / NOISE_SCALE
            const noiseVal = noise2D(nx, ny)
            const offset = Math.round(noiseVal * 0.1 * 4)
            const finalIndex = Math.max(0, Math.min(CHARS.length - 1, worldVal + offset))
            rowStr += CHARS[finalIndex]
          } else {
            const nx = (col + noiseTime) / NOISE_SCALE
            const ny = row / NOISE_SCALE
            const noiseVal = noise2D(nx, ny)
            const mapped = (noiseVal + 1) / 2
            const charIndex = Math.round(mapped * PARTICLE_STRENGTH * (CHARS.length - 1))
            const finalIndex = Math.max(0, Math.min(CHARS.length - 1, CHARS.length - 1 - charIndex))
            rowStr += CHARS[finalIndex]
          }
        }
        ctx.fillText(rowStr, 0, row * charHeight)
      }

      animId = requestAnimationFrame(render)
    }

    let setupId = 0 // increments on each setup call; stale setups bail out

    setup().then(() => {
      animId = requestAnimationFrame(render)
    })

    let resizeTimer: number
    function onResize() {
      // Debounce: wait 150ms after last resize event before re-setup
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        const id = ++setupId
        setup().then(() => {
          // Only start rendering if this is still the latest setup
          if (id === setupId) {
            animId = requestAnimationFrame(render)
          }
        })
      }, 150)
    }

    window.addEventListener('resize', onResize)

    const dprMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    dprMedia.addEventListener('change', onResize)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      dprMedia.removeEventListener('change', onResize)
    }
  }, [svgSource])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}
