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
const FX_STRENGTH = 0.45
const TILE_PADDING = 4 // char cells of gap between tiles

export default function AsciiCanvasTiled({ svgSource }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    const noise2D = createNoise2D(42)

    let animId: number
    let tileChars: Uint8Array | null = null
    let tileCols = 0
    let tileRows = 0
    let totalCols = 0
    let totalRows = 0
    let charWidth = 0
    let charHeight = FONT_SIZE

    ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Courier New", monospace`
    charWidth = ctx.measureText('@').width || 6
    charHeight = FONT_SIZE * 1.2

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

      // Tile size: aim for ~3-4 tiles across on desktop
      tileCols = Math.floor(totalCols / 3.5)
      tileRows = Math.floor(tileCols * (162 / 174)) // match SVG aspect ratio

      // Rasterize SVG at tile size
      const grayscale = await rasterizeSvgToGrayscale(svgSource, tileCols, tileRows)
      tileChars = floydSteinbergDither(grayscale, tileCols, tileRows, 0.8)
    }

    let startTime = performance.now()

    function render() {
      if (!tileChars) {
        animId = requestAnimationFrame(render)
        return
      }

      const time = (performance.now() - startTime) / 1000 * NOISE_SPEED

      const asciiColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--ascii-color')
        .trim()

      const dpr = window.devicePixelRatio || 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", "Courier New", monospace`
      ctx.fillStyle = asciiColor || 'rgba(200, 200, 210, 0.5)'
      ctx.textBaseline = 'top'

      const tileStepX = tileCols + TILE_PADDING
      const tileStepY = tileRows + TILE_PADDING

      for (let row = 0; row < totalRows; row++) {
        let rowStr = ''
        for (let col = 0; col < totalCols; col++) {
          // Map to tile coordinates via modulo
          const tileX = col % tileStepX
          const tileY = row % tileStepY

          let baseIndex: number
          if (tileX < tileCols && tileY < tileRows) {
            baseIndex = tileChars[tileY * tileCols + tileX]
          } else {
            // Gap between tiles — use lightest character
            baseIndex = CHARS.length - 1
          }

          // Apply noise field
          const nx = (col + time) / NOISE_SCALE
          const ny = row / NOISE_SCALE
          const noiseVal = noise2D(nx, ny)
          const offset = Math.round(noiseVal * FX_STRENGTH * 4)

          const finalIndex = Math.max(0, Math.min(CHARS.length - 1, baseIndex + offset))
          rowStr += CHARS[finalIndex]
        }
        ctx.fillText(rowStr, 0, row * charHeight)
      }

      animId = requestAnimationFrame(render)
    }

    setup().then(() => {
      startTime = performance.now()
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
