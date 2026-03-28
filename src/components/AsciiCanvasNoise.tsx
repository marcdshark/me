import { useRef, useEffect } from 'react'
import { createNoise2D } from '../lib/noise'
import { CHARS } from '../lib/asciiRenderer'

interface Props {
  svgSource?: string // unused, kept for interface compat
}

const FONT_SIZE = 10
const NOISE_SCALE = 24
const NOISE_SPEED = 1
const FX_STRENGTH = 0.45

/**
 * Pure noise pattern — no SVG rendering.
 * Random ASCII characters animated by a flowing noise field.
 */
export default function AsciiCanvasNoise({ }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    const noise2D = createNoise2D(42)

    let animId: number
    let cols = 0
    let rows = 0
    let charWidth = 0
    let charHeight = FONT_SIZE

    function setup() {
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

      cols = Math.ceil(w / charWidth) + 1
      rows = Math.ceil(h / charHeight) + 1
    }

    const startTime = performance.now()

    function render() {
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

      for (let row = 0; row < rows; row++) {
        let rowStr = ''
        for (let col = 0; col < cols; col++) {
          const nx = (col + time) / NOISE_SCALE
          const ny = row / NOISE_SCALE
          const noiseVal = (noise2D(nx, ny) + 1) / 2 // remap to 0..1
          const charIndex = Math.floor(noiseVal * FX_STRENGTH * (CHARS.length - 1) * 2)
          const finalIndex = Math.max(0, Math.min(CHARS.length - 1, charIndex))
          rowStr += CHARS[finalIndex]
        }
        ctx.fillText(rowStr, 0, row * charHeight)
      }

      animId = requestAnimationFrame(render)
    }

    setup()
    animId = requestAnimationFrame(render)

    function onResize() {
      setup()
    }

    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}
