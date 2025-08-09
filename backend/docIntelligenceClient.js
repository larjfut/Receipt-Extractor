const fetch = require('node-fetch')
const config = require('./src/config')

const endpoint = config.AZURE_DOC_INTELLIGENCE_ENDPOINT
const key = config.AZURE_DOC_INTELLIGENCE_KEY

async function analyzeDocument(file, model, contentType) {
  if (config.DEMO_MODE) {
    return { documents: [] }
  }
  const url = `${endpoint}/formrecognizer/documentModels/${model}:analyze?api-version=2023-07-31`
  console.log(`Analyzing document with model ${model}`)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Ocp-Apim-Subscription-Key': key
        },
        body: file
      })

      if (res.ok) return await res.json()

      if (res.status === 429 || res.status === 503) {
        if (attempt < 2) {
          const delay = 500 * 2 ** attempt
          console.warn(
            `Retrying document analysis, attempt ${attempt + 2} after ${res.status}`
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
      }

      const errText = await res.text()
      console.error('Document Intelligence API error', res.status, errText)
      throw new Error(errText || 'Request failed')
    } catch (err) {
      if (attempt < 2) {
        const delay = 500 * 2 ** attempt
        console.warn(
          `Retrying document analysis, attempt ${attempt + 2} after error: ${err.message}`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        console.error('Document Intelligence request failed', err.message)
        throw err
      }
    }
  }
}

module.exports = { analyzeDocument }
