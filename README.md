# Receipt‑Extractor

This repository contains the **Receipt‑Extractor** application. It is a full‑stack tool to help Finance staff capture receipt and invoice data for purchase requisitions and reimbursement requests. Users can upload images or PDF receipts, have the contents automatically parsed into a structured form using Azure Document Intelligence, make corrections or add missing information, sign the requisition digitally, and finally submit the record to the TCFV SharePoint list (`PR Master List`).

The app is split into two parts:

- A **frontend** written with React, Tailwind CSS and React Router. It guides the user through a multi‑step workflow (upload, review, signature and submit) and displays extracted OCR data next to editable fields.
- A **backend** built with Node.js and Express. It provides endpoints to perform OCR using Azure Document Intelligence, parse the output into the form structure defined in `backend/fieldMapping.json`, and interface with the Microsoft Graph/SharePoint API to create list items and upload attachments.

## Quick start

This repo only contains source code; dependencies are not vendored. To get up and running locally you will need [Node 16 or later](https://nodejs.org/) and npm or yarn. The commands below assume you are working from the `receipt‑extractor` directory.

1. Install dependencies for both the frontend and backend:

   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```

2. Start the backend API server:

   ```bash
   cd backend
   # Ensure AZURE_DOC_INTELLIGENCE_ENDPOINT and AZURE_DOC_INTELLIGENCE_KEY are set
   # See `.env.example` for other required variables
   node server.js
   ```

   The backend will run on port 5000 by default. You can change the port by setting `PORT` in your environment.

3. In a separate terminal, start the frontend development server:

   ```bash
   cd frontend
   # Copy `.env.example` to `.env` and update values as needed
   npm run dev
   ```

   This will start Vite on port 5173 (or the next available port) and open the app in your default browser.

## Modes

The application supports demo and production modes controlled by environment variables. See `.env.example` for details.

| Mode | DEMO_MODE | AUTH_PROVIDER |
| ---- | --------- | ------------- |
| Demo (no cloud) | true | msal |
| Local auth | false | local |
| MSAL | false | msal |

Run the corresponding development scripts:

```bash
npm run dev:demo
npm run dev:local
npm run dev:msal
```

## Image Quality Requirements

To ensure receipts are read accurately, uploads must meet basic quality checks:

- **Visible edges** – show the entire receipt so all four borders are detected. Otherwise you'll see: “Receipt edges not detected. Ensure entire receipt is visible and retry.”
- **Sharp focus** – avoid blur by holding the camera steady and using good lighting. Blurry images trigger: “Image is too blurry. Please retake.”
- **Clear text** – the OCR must reach at least 60% confidence. Low‑contrast or dim photos will display: “Text is not clear enough. Retake in better lighting.”

Uploads that fail these checks are rejected with the guidance messages above.

## Configuration

### Field mapping

The file `backend/fieldMapping.json` contains an array of objects describing each column in the SharePoint list. Each record has the following properties:

- **spInternalName** – the internal column name in SharePoint.
- **label** – human‑friendly label shown to the user.
- **stateKey** – the key used by the frontend and backend to store the value in the requisition state.
- **required** – boolean indicating whether a value is required.
- **dataType** – type of data (e.g. `string`, `number`, `date`, `lookup`).
- **validation** – optional validation rule or description.

The mapping was generated from the comprehensive spreadsheet provided by the Finance team and can be extended by appending new objects to the JSON array.

### Azure Document Intelligence

The backend uses [Azure Document Intelligence](https://learn.microsoft.com/azure/ai-services/document-intelligence/) for OCR. Set the following environment variables so the service can authenticate:

```
AZURE_DOC_INTELLIGENCE_ENDPOINT=https://<your-resource-name>.cognitiveservices.azure.com
AZURE_DOC_INTELLIGENCE_KEY=your-doc-intelligence-key
```

These variables are required for document analysis requests.

### SharePoint/Graph API

To submit a requisition to the TCFV SharePoint list you will need an Azure AD application with permissions to create list items and upload attachments. Create a `.env` file in the `backend` folder based on the example below:

```
TENANT_ID=your‑tenant‑id
CLIENT_ID=your‑client‑id
CLIENT_SECRET=your‑client‑secret
SITE_ID=your‑site‑id
LIST_ID=your‑list‑id
```

At runtime the backend uses these values to obtain an access token via the client credentials grant and to talk to the Microsoft Graph API. See `backend/sharepointClient.js` for the implementation details. When deploying to production you should store secrets securely (e.g. Azure Key Vault) rather than committing them to source control.

### Verify environment configuration

To check that the required variables are present without printing their values, run:

```bash
cd backend
node test-env.js
```

The script reports whether each variable is loaded. To print the actual values (except the client secret, which stays redacted) set an explicit debug flag:

```bash
cd backend
DEBUG_ENV=true node test-env.js
```

### API base URL

The frontend looks for `VITE_API_BASE_URL` to know where the backend is running. Copy `frontend/.env.example` to `frontend/.env` and set the value as needed. When the variable is not set it defaults to `/api`.

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Authentication

Redirect URIs for the Azure AD app must include both your deployed origin (e.g. Vercel) and `http://localhost` for local development. Authentication uses the Authorization Code flow with PKCE via MSAL; no implicit grant is required.

## Running in production

For production builds run `npm run build` in the `frontend` directory to generate a static build in `frontend/dist`. You can then serve this folder through your preferred HTTP server (Nginx, Express, etc.). The backend can be deployed to any Node‑capable environment; just remember to set the environment variables described above.

## Contributing

This project is a work in progress. Issues and pull requests are welcome. When adding new fields or altering the form structure, update both `backend/fieldMapping.json` and the corresponding frontend components to ensure data flows correctly from OCR through to SharePoint.
