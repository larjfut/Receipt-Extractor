const DEFAULT_THRESHOLDS = {
  blur: 100,
  ocr: 60
}

export async function checkImageQuality(file, thresholds = DEFAULT_THRESHOLDS) {
  const { default: cv } = await import('opencv.js')
  const { default: Tesseract } = await import('tesseract.js')

  const issues = []

  const img = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)

  const src = cv.imread(canvas)
  const gray = new cv.Mat()
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0)

  const edges = new cv.Mat()
  cv.Canny(gray, edges, 50, 150)
  const contours = new cv.MatVector()
  const hierarchy = new cv.Mat()
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
  let hasRect = false
  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i)
    const peri = cv.arcLength(cnt, true)
    const approx = new cv.Mat()
    cv.approxPolyDP(cnt, approx, 0.02 * peri, true)
    if (approx.rows === 4) {
      const area = cv.contourArea(cnt)
      if (area > 0.3 * src.rows * src.cols) {
        hasRect = true
      }
    }
    cnt.delete()
    approx.delete()
  }
  if (!hasRect) {
    issues.push('Receipt edges not detected')
  }

  const lap = new cv.Mat()
  cv.Laplacian(gray, lap, cv.CV_64F)
  const mean = new cv.Mat()
  const std = new cv.Mat()
  cv.meanStdDev(lap, mean, std)
  const variance = Math.pow(std.doubleAt(0, 0), 2)
  if (variance < thresholds.blur) {
    issues.push('Image is blurry')
  }

  src.delete()
  gray.delete()
  edges.delete()
  contours.delete()
  hierarchy.delete()
  lap.delete()
  mean.delete()
  std.delete()

  const { data } = await Tesseract.recognize(file)
  if (data.confidence < thresholds.ocr) {
    issues.push('Low OCR confidence')
  }

  return { ok: issues.length === 0, issues }
}
