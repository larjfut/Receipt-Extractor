const waitForOpenCV = () =>
  new Promise(resolve => {
    if (window.cv && window.cv.Mat) resolve(window.cv)
    else setTimeout(() => waitForOpenCV().then(resolve), 100)
  })

export const checkImageQuality = async imageElement => {
  const cv = await waitForOpenCV()
  try {
    const mat = cv.imread(imageElement)
    const gray = new cv.Mat()
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY)
    const laplacian = new cv.Mat()
    cv.Laplacian(gray, laplacian, cv.CV_64F)
    const mean = new cv.Mat()
    const stddev = new cv.Mat()
    cv.meanStdDev(laplacian, mean, stddev)
    const variance = stddev.data64F[0] ** 2
    const isBlurry = variance < 100
    mat.delete(); gray.delete(); laplacian.delete(); mean.delete(); stddev.delete()
    return {
      isBlurry,
      variance,
      quality: variance > 500 ? 'high' : variance > 100 ? 'medium' : 'low'
    }
  } catch (error) {
    console.error('Error checking image quality:', error)
    return { error: 'Failed to analyze image quality' }
  }
}
