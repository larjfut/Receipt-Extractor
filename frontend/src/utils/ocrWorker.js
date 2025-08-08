import Tesseract from 'tesseract.js'

self.onmessage = async e => {
  try {
    const {
      data: { confidence }
    } = await Tesseract.recognize(e.data.image, 'eng')
    self.postMessage({ confidence })
  } catch (error) {
    self.postMessage({ error: error.message || 'OCR failed' })
  }
}

