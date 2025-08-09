require('dotenv').config()

const { AZURE_DOC_INTELLIGENCE_ENDPOINT, AZURE_DOC_INTELLIGENCE_KEY } =
  process.env

if (!AZURE_DOC_INTELLIGENCE_ENDPOINT || !AZURE_DOC_INTELLIGENCE_KEY) {
  console.error('Missing Azure Document Intelligence configuration')
  process.exit(1)
}

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const { analyzeDocument } = require('./docIntelligenceClient')
const { getDocumentModel } = require('./getDocumentModel')
const {
  createItemWithContentType,
  listActiveUsers,
  listContentTypes,
} = require('./sharepointClient')
const fieldMapping = require('./fieldMapping.json')
const fs = require('fs').promises
const path = require('path')
const { applyTransformations, extractLineItems } = require('./transformUtils')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = header.split(' ')[1]
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

let fieldMappingsCache

async function loadFieldMappings() {
  if (fieldMappingsCache) return fieldMappingsCache
  fieldMappingsCache = {}
  const dir = path.join(__dirname, 'fieldMappings')
  try {
    const files = await fs.readdir(dir)
    await Promise.all(
      files.map(async (file) => {
        const json = JSON.parse(await fs.readFile(path.join(dir, file), 'utf8'))
        if (json.contentType) fieldMappingsCache[json.contentType] = json
      }),
    )
  } catch (err) {
    console.error('Failed to load field mappings', err)
  }
  return fieldMappingsCache
}

async function loadFieldMapping(name) {
  if (!name) return null
  const mappings = await loadFieldMappings()
  return mappings[name] || null
}

function validate(value, rule) {
  if (!rule) return true
  if (value == null) return false
  switch (rule) {
    case 'non-empty':
      return String(value).trim() !== ''
    case 'YYYY-MM-DD':
      return /\d{4}-\d{2}-\d{2}/.test(String(value))
    case 'currency':
      return (
        typeof value === 'number' || /^(?:\d+)(?:\.\d+)?$/.test(String(value))
      )
    default:
      return true
  }
}

// Initialize Express
const app = express()
const MAX_FILES = 5
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
      'application/pdf',
    ]
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Invalid file type'))
  },
})

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : []

if (!allowedOrigins.length)
  console.warn('No ALLOWED_ORIGINS specified; requests from unknown origins will be blocked')

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true)
      else callback(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(express.json({ limit: '50mb' }))

/**
 * GET /api/fields
 *
 * Returns the array of field definitions used by the frontend to render the
 * review form.  The definitions are loaded from fieldMapping.json.
 *
 * If a `contentType` query parameter is provided, a matching mapping is loaded
 * from the `fieldMappings` directory.
 */
app.get('/api/fields', async (req, res) => {
  const { contentType } = req.query
  if (contentType) {
    const mapping = await loadFieldMapping(contentType)
    if (mapping) return res.json(mapping)
    return res.status(404).json({ error: 'Field mapping not found' })
  }
  res.json(fieldMapping)
})

/**
 * POST /api/upload
 *
 * Accepts multiple files and runs them through Azure Document Intelligence.
 * Returns an array of objects containing extracted data and confidences.
 */
app.post('/api/upload', authMiddleware, (req, res) => {
  upload.array('files')(req, res, async (err) => {
    if (err) {
      console.error(err)
      const message =
        err.code === 'LIMIT_FILE_COUNT'
          ? 'Too many files uploaded'
          : err.message
      return res.status(400).json({ success: false, error: message })
    }
    try {
      if (!req.files || !req.files.length) {
        return res
          .status(400)
          .json({ success: false, error: 'No files uploaded' })
      }
      if (req.files.length > MAX_FILES) {
        return res
          .status(400)
          .json({ success: false, error: 'Too many files uploaded' })
      }
      const ctRaw = req.body.selectedContentType
      let selectedContentType = ctRaw
      if (typeof ctRaw === 'string') {
        try {
          selectedContentType = JSON.parse(ctRaw)
        } catch (parseErr) {
          return res.status(400).json({ error: 'Invalid contentType payload' })
        }
      }
      const mapping = await loadFieldMapping(selectedContentType?.Name)
      const model =
        mapping?.model ||
        getDocumentModel(selectedContentType ? selectedContentType.Name : '')
      const confidenceThreshold = mapping?.confidenceThreshold ?? 0.75
      const results = await Promise.all(
        req.files.map(async (f) => {
          const result = await analyzeDocument(f.buffer, model, f.mimetype)
          const doc = result.documents && result.documents[0]
          const data = {}
          const confidence = {}
          if (doc && doc.fields && mapping?.fields) {
            mapping.fields.forEach((field) => {
              const v = doc.fields[field.diField]
              if (!v) return
              const threshold = field.confidence ?? confidenceThreshold
              if (v.confidence < threshold) return
              const val = v.valueString ?? v.valueNumber ?? v.content
              if (val == null) return
              const key = field.stateKey || field.diField
              data[key] = val
              confidence[key] = v.confidence
            })
            applyTransformations(mapping.fields, data)
            mapping.fields.forEach((field) => {
              const key = field.stateKey || field.diField
              if (data[key] == null) return
              if (!validate(data[key], field.validation)) {
                delete data[key]
                delete confidence[key]
              }
            })
          }
          let lineItems = extractLineItems(result.tables, mapping?.lineItems)
          if (lineItems.length && mapping?.lineItems?.columns) {
            lineItems = lineItems
              .map((item) => {
                const cleaned = {}
                mapping.lineItems.columns.forEach((col) => {
                  const val = item[col.name]
                  if (val == null) return
                  if (!validate(val, col.validation)) return
                  cleaned[col.name] = val
                })
                return cleaned
              })
              .filter((item) => Object.keys(item).length)
          }
          return { data, confidence, lineItems }
        }),
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
app.post('/api/submit', authMiddleware, async (req, res) => {
  try {
    const { fields, attachments, signature, contentTypeId } = req.body
    const normalized = (attachments || []).map((f) => ({
      name: f.name,
      type: f.type,
      content: f.content,
    }))
    if (signature) {
      const base64 = signature.split(',')[1]
      normalized.push({
        name: 'signature.png',
        type: 'image/png',
        content: base64,
      })
    }
    const item = await createItemWithContentType(
      fields,
      normalized,
      contentTypeId,
    )
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
app.get('/api/users', authMiddleware, async (req, res) => {
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
app.get('/api/content-types', authMiddleware, async (req, res) => {
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
