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

const runOcr = imageElement =>
  new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./ocrWorker.js', import.meta.url),
      { type: 'module' }
    )
    worker.onmessage = ({ data }) => {
      worker.terminate()
      if (data.error) reject(new Error(data.error))
      else resolve(data.confidence)
    }
    worker.onerror = err => {
      worker.terminate()
      reject(err)
    }
    worker.postMessage({ image: imageElement })
  })

export const checkImageQuality = async imageElement => {
  let mat, gray, laplacian, mean, stddev, edges, contours, hierarchy
  try {
    const cv = await waitForOpenCV()
    mat = cv.imread(imageElement)
    gray = new cv.Mat()
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY)

    laplacian = new cv.Mat()
    cv.Laplacian(gray, laplacian, cv.CV_64F)
    mean = new cv.Mat()
    stddev = new cv.Mat()
    cv.meanStdDev(laplacian, mean, stddev)
    const variance = stddev.data64F[0] ** 2

    cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0)
    edges = new cv.Mat()
    cv.Canny(gray, edges, 75, 200)
    contours = new cv.MatVector()
    hierarchy = new cv.Mat()
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    let hasFourEdges = false
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i)
      let approx
      try {
        const peri = cv.arcLength(cnt, true)
        approx = new cv.Mat()
        cv.approxPolyDP(cnt, approx, 0.02 * peri, true)
        if (approx.rows === 4) {
          hasFourEdges = true
          break
        }
      } finally {
        if (approx) approx.delete()
        cnt.delete()
      }
    }

    const confidence = await runOcr(imageElement)

    return {
      blurVariance: variance,
      hasFourEdges,
      ocrConfidence: confidence
    }
  } catch (error) {
    console.error('Error checking image quality:', error)
    return { error: error.message || 'Failed to analyze image quality' }
  } finally {
    if (mat) mat.delete()
    if (gray) gray.delete()
    if (laplacian) laplacian.delete()
    if (mean) mean.delete()
    if (stddev) stddev.delete()
    if (edges) edges.delete()
    if (contours) contours.delete()
    if (hierarchy) hierarchy.delete()
  }
}
