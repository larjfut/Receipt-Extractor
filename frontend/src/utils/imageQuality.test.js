import { checkImageQuality } from './imageQuality'

test.skip('deletes mats when analysis fails', async () => {
  const mats = []
  const matVectors = []

  class Mat {
    constructor () {
      this.delete = jest.fn()
      this.data64F = [0]
      this.rows = 0
      mats.push(this)
    }
  }

  class MatVector {
    constructor () {
      this.delete = jest.fn()
      this.size = () => 0
      matVectors.push(this)
    }
  }

  const cv = {
    Mat,
    MatVector,
    Size: class {},
    imread: jest.fn(() => new Mat()),
    cvtColor: jest.fn(),
    COLOR_RGBA2GRAY: 0,
    Laplacian: jest.fn(),
    CV_64F: 0,
    meanStdDev: jest.fn((_, __, stddev) => {
      stddev.data64F = [3]
    }),
    GaussianBlur: jest.fn(),
    Canny: jest.fn(),
    findContours: jest.fn(),
    RETR_EXTERNAL: 0,
    CHAIN_APPROX_SIMPLE: 0,
    arcLength: jest.fn(),
    approxPolyDP: jest.fn()
  }

  const originalWindow = global.window
  global.window = { cv }

  class MockWorker {
    constructor () {
      this.postMessage = jest.fn(() => {
        this.onmessage({ data: { error: 'OCR failed' } })
      })
      this.terminate = jest.fn()
    }
  }

  const originalWorker = global.Worker
  global.Worker = MockWorker

  const result = await checkImageQuality({})
  expect(result.error).toBe('OCR failed')
  expect(mats).toHaveLength(7)
  mats.forEach(m => expect(m.delete).toHaveBeenCalledTimes(1))
  expect(matVectors).toHaveLength(1)
  matVectors.forEach(mv => expect(mv.delete).toHaveBeenCalledTimes(1))

  global.Worker = originalWorker
  global.window = originalWindow
})

