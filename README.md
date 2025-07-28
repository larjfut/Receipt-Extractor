# Receipt-Extractor

---

## Field Definitions

Refer to the comprehensive mapping of form fields to SharePoint columns (internal names & types) before coding your front end or API calls: :contentReference[oaicite:3]{index=3}

---

## Tech Stack & Libraries

- **Framework**: React (Create React App or Next.js)  
- **UI**: Tailwind CSS + shadcn/ui components  
- **OCR**: Tesseract.js (browser proof-of-concept)  
- **Signature**: react-signature-canvas  
- **HTTP**: axios or Fetch for Graph/SharePoint REST  
- **State**: React Context or Zustand  
- **Routing**: React Router (for step URLs)  

---

## Prerequisites

- Node.js ≥ 16 and npm or Yarn  
- Access to a Microsoft 365 tenant with SharePoint Online & permission to the Finance Hub site  
- A SharePoint list named `PR Master List` with attachments enabled  
- (Optional) Azure Form Recognizer credentials if you swap Tesseract for a cloud OCR service  

---

## Getting Started

1. Fork or clone this repo:  
   ```bash
   git clone https://github.com/<your-org>/bullet-invoice-translator.git
   cd bullet-invoice-translator
