// ASCII density characters: densest → lightest
export const CHARS = ['@', '%', '#', '*', '+', '=', '-', ':', '.', ' ']

/**
 * Rasterize an SVG string to a grayscale grid using an offscreen canvas.
 * Returns Float32Array with values 0..1 (0 = transparent, 1 = opaque/stroke).
 */
export async function rasterizeSvgToGrayscale(
  svgString: string,
  cols: number,
  rows: number,
): Promise<Float32Array> {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })

  URL.revokeObjectURL(url)

  const canvas = new OffscreenCanvas(cols, rows)
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, cols, rows)

  // Scale SVG to fill the canvas while maintaining aspect ratio
  const svgAspect = img.width / img.height
  const canvasAspect = cols / rows

  let drawW: number, drawH: number, offsetX: number, offsetY: number
  if (svgAspect > canvasAspect) {
    drawW = cols
    drawH = cols / svgAspect
    offsetX = 0
    offsetY = (rows - drawH) / 2
  } else {
    drawH = rows
    drawW = rows * svgAspect
    offsetX = (cols - drawW) / 2
    offsetY = 0
  }

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH)

  const imageData = ctx.getImageData(0, 0, cols, rows)
  const pixels = imageData.data
  const result = new Float32Array(cols * rows)

  for (let i = 0; i < cols * rows; i++) {
    // Use alpha channel since SVG is stroke-only on transparent background
    result[i] = pixels[i * 4 + 3] / 255
  }

  return result
}

/**
 * Floyd-Steinberg dithering: converts grayscale values to character indices.
 * Returns Uint8Array of indices into CHARS array.
 */
export function floydSteinbergDither(
  grayscale: Float32Array,
  cols: number,
  rows: number,
  strength = 0.8,
): Uint8Array {
  const levels = CHARS.length
  const data = new Float32Array(grayscale) // copy so we don't mutate input
  const result = new Uint8Array(cols * rows)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x
      const oldVal = data[idx]

      // Quantize: map 0..1 to character index (0 = space/lightest, levels-1 = densest)
      // Invert: high alpha (stroke) → dense char (low index)
      const charIndex = Math.round((1 - oldVal) * (levels - 1))
      const clamped = Math.max(0, Math.min(levels - 1, charIndex))
      result[idx] = clamped

      // Compute quantization error
      const newVal = 1 - clamped / (levels - 1)
      const error = (oldVal - newVal) * strength

      // Distribute error to neighbors
      if (x + 1 < cols) data[idx + 1] += error * (7 / 16)
      if (y + 1 < rows) {
        if (x - 1 >= 0) data[(y + 1) * cols + (x - 1)] += error * (3 / 16)
        data[(y + 1) * cols + x] += error * (5 / 16)
        if (x + 1 < cols) data[(y + 1) * cols + (x + 1)] += error * (1 / 16)
      }
    }
  }

  return result
}
