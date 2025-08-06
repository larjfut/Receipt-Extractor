const waitForOpenCV = (timeout = 5000) =>
  new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      if (window.cv && window.cv.Mat) resolve(window.cv)
      else if (Date.now() - start >= timeout)
        reject(new Error('OpenCV load timed out'))
      else setTimeout(check, 100)
    }
    check()
  })

export const checkImageQuality = async imageElement => {
  try {
    const cv = await waitForOpenCV()
    const mat = cv.imread(imageElement)
    const gray = new cv.Mat()
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY)

    const laplacian = new cv.Mat()
    cv.Laplacian(gray, laplacian, cv.CV_64F)
    const mean = new cv.Mat()
    const stddev = new cv.Mat()
    cv.meanStdDev(laplacian, mean, stddev)
    const variance = stddev.data64F[0] ** 2

    cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0)
    const edges = new cv.Mat()
    cv.Canny(gray, edges, 75, 200)
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    let hasFourEdges = false
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i)
      const peri = cv.arcLength(cnt, true)
      const approx = new cv.Mat()
      cv.approxPolyDP(cnt, approx, 0.02 * peri, true)
      if (approx.rows === 4) {
        hasFourEdges = true
        approx.delete()
        cnt.delete()
        break
      }
      approx.delete()
      cnt.delete()
    }
    edges.delete()
    contours.delete()
    hierarchy.delete()

    const { default: Tesseract } = await import('tesseract.js')
    const {
      data: { confidence }
    } = await Tesseract.recognize(imageElement, 'eng')

    mat.delete()
    gray.delete()
    laplacian.delete()
    mean.delete()
    stddev.delete()

    return {
      blurVariance: variance,
      hasFourEdges,
      ocrConfidence: confidence
    }
  } catch (error) {
    console.error('Error checking image quality:', error)
    return { error: error.message || 'Failed to analyze image quality' }
  }
}
