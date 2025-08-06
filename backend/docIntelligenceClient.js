const fetch = require('node-fetch')

const endpoint = process.env.AZURE_DOC_INTELLIGENCE_ENDPOINT
const key = process.env.AZURE_DOC_INTELLIGENCE_KEY

async function analyzeDocument (file, model) {
  const url = `${endpoint}/formrecognizer/documentModels/${model}:analyze?api-version=2023-07-31`
  console.log(`Analyzing document with model ${model}`)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': key
      },
      body: file
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('Document Intelligence API error', res.status, errText)
      throw new Error(errText || 'Request failed')
    }
    return await res.json()
  } catch (err) {
    console.error('Document Intelligence request failed', err.message)
    throw err
  }
}

module.exports = { analyzeDocument }
