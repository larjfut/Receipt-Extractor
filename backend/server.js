require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { parseReceiptData } = require('./parseReceipt');
const { createPurchaseRequisition } = require('./sharepointClient');
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
 * Accepts a single file upload, runs OCR on it using Tesseract.js, and
 * returns an object keyed by the stateKeys defined in fieldMapping.  This
 * endpoint does not persist anything – it simply extracts text and parses
 * basic values.
 */
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, async err => {
    if (err) {
      console.error(err)
      return res.status(400).json({ success: false, error: err.message })
    }
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: 'No file uploaded' })
      }
      const buffer = req.file.buffer
      const result = await Tesseract.recognize(buffer, 'eng', {
        logger: m => console.log(m)
      })
      const parsed = parseReceiptData(result.data, fieldMapping)
      res.json({ success: true, data: parsed, raw: result.data })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, error: err.message })
    }
  })
})

/**
 * POST /api/submit
 *
 * Accepts a JSON payload containing `fields`, an array of `attachments`, and
 * a `signature` data URL.  It passes the data to the SharePoint client
 * abstraction which performs the Graph API calls.  This implementation
 * currently logs the data and returns a stub response if no Graph
 * credentials are configured.
 */
app.post('/api/submit', async (req, res) => {
  try {
    const { fields, attachments, signature } = req.body;
    const response = await createPurchaseRequisition(fields, attachments, signature);
    res.json({ success: true, response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = app

const PORT = process.env.PORT || 5000
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`)
  })
}
