import { normalizeKeys } from "../pages/UploadPage.jsx"

describe("normalizeKeys", () => {
  test("replaces multiple [i] segments within a single key", () => {
    const result = normalizeKeys({ "items[i].details[i].value": "x" })
    expect(result).toEqual({ "items[0].details[0].value": "x" })
  })

  test("replaces multiple [i] segments across keys", () => {
    const result = normalizeKeys({
      "items[i].details[i].value": "x",
      "items[i].details[i].name[i]": "y",
    })
    expect(result).toEqual({
      "items[0].details[0].value": "x",
      "items[0].details[0].name[0]": "y",
    })
  })
})
