require('dotenv').config()

const {
  AZURE_DOC_INTELLIGENCE_ENDPOINT,
  AZURE_DOC_INTELLIGENCE_KEY
} = process.env

if (!AZURE_DOC_INTELLIGENCE_ENDPOINT || !AZURE_DOC_INTELLIGENCE_KEY) {
  console.error('Missing Azure Document Intelligence configuration')
  process.exit(1)
}

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { analyzeDocument } = require('./docIntelligenceClient')
const { getDocumentModel } = require('./getDocumentModel')
const {
  createItemWithContentType,
  listActiveUsers,
  listContentTypes,
} = require('./sharepointClient')
const fieldMapping = require('./fieldMapping.json');

// Initialize Express
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
      'application/pdf'
    ]
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Invalid file type'))
  }
})

app.use(cors());
app.use(express.json({ limit: '50mb' }));

/**
 * GET /api/fields
 *
 * Returns the array of field definitions used by the frontend to render the
 * review form.  The definitions are loaded from fieldMapping.json.
 */
app.get('/api/fields', (req, res) => {
  res.json(fieldMapping);
});

/**
 * POST /api/upload
 *
 * Accepts multiple files and runs them through Azure Document Intelligence.
 * Returns an array of objects containing extracted data and confidences.
 */
app.post('/api/upload', (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) {
      console.error(err)
      return res.status(400).json({ success: false, error: err.message })
    }
    try {
      if (!req.files || !req.files.length) {
        return res
          .status(400)
          .json({ success: false, error: 'No files uploaded' })
      }
      const ctRaw = req.body.selectedContentType
      const selectedContentType = typeof ctRaw === 'string' ? JSON.parse(ctRaw) : ctRaw
      const model = getDocumentModel(selectedContentType ? selectedContentType.Name : '')
      const results = await Promise.all(
        req.files.map(async (f) => {
          const result = await analyzeDocument(f.buffer, model, f.mimetype)
          const doc = result.documents && result.documents[0]
          const data = {}
          const confidence = {}
          if (doc && doc.fields) {
            Object.entries(doc.fields).forEach(([k, v]) => {
              if (v.confidence >= 0.75) {
                const val = v.valueString ?? v.valueNumber ?? v.content
                if (val !== undefined) {
                  data[k] = val
                  confidence[k] = v.confidence
                }
              }
            })
          }
          return { data, confidence }
        })
      )
      res.json(results)
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, error: err.message })
    }
  })
})

/**
 * POST /api/submit
 *
 * Accepts a JSON payload containing `fields`, an array of `attachments`
 * (each with `name`, `type` and base64 `content`), and a `signature` data URL.
 * It passes the data to the SharePoint client abstraction which performs the
 * Graph API calls.  This implementation currently logs the data and returns a
 * stub response if no Graph credentials are configured.
 */
app.post('/api/submit', async (req, res) => {
  try {
    const { fields, attachments, signature, contentTypeId } = req.body
    const normalized = (attachments || []).map((f) => ({
      name: f.name,
      type: f.type,
      content: f.content,
    }))
    if (signature) {
      const base64 = signature.split(',')[1]
      normalized.push({ name: 'signature.png', type: 'image/png', content: base64 })
    }
    const item = await createItemWithContentType(fields, normalized, contentTypeId)
    res.json({ success: true, id: item.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * GET /api/users
 *
 * Returns the array of active Azure AD users for manual selection in the UI.
 */
app.get('/api/users', async (req, res) => {
  try {
    const users = await listActiveUsers()
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/content-types
 *
 * Returns the SharePoint content types available for the configured list.
 */
app.get('/api/content-types', async (req, res) => {
  try {
    const types = await listContentTypes()
    res.json(types)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})



module.exports = app

const PORT = process.env.PORT || 5000
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`)
  })
}
