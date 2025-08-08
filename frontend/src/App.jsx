import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import logoUrl from './assets/logo.png';

// === CONTEXTS ===
const ReceiptContext = createContext(null);
const UserContext = createContext(null);

function ReceiptProvider({ children }) {
  const [receipt, setReceipt] = useState({
    fields: {},
    attachments: [],
    signature: null,
    contentTypeId: null,
    contentTypeName: '',
  });
  const [contentTypes, setContentTypes] = useState([]);

  const resetReceipt = () => {
    setReceipt({
      fields: {},
      attachments: [],
      signature: null,
      contentTypeId: null,
      contentTypeName: '',
    });
  };

  return (
    <ReceiptContext.Provider
      value={{ receipt, setReceipt, contentTypes, setContentTypes, resetReceipt }}
    >
      {children}
    </ReceiptContext.Provider>
  );
}

function UserProvider({ children }) {
  const [user, setUser] = useState({ name: 'Demo User', email: 'demo@company.com' });
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

// === UTILITY FUNCTIONS & CONSTANTS ===
const QUALITY_MESSAGES = {
  edges: 'Receipt edges not detected. Ensure entire receipt is visible and retry.',
  blur: 'Image too blurry for OCR. Retake with better focus.',
  ocr: 'Text too blurry for OCR. Retake in better lighting.',
};

const WORKFLOW_STEPS = [
  { key: '/upload', label: 'Upload', icon: '📤' },
  { key: '/review', label: 'Review', icon: '📝' },
  { key: '/signature', label: 'Sign', icon: '✍️' },
  { key: '/submit', label: 'Submit', icon: '🚀' },
];

const normalizeKeys = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.replaceAll('[i]', '[0]'), v]));

// === MOCK API ===
const mockAPI = {
  async upload(shouldFail = false) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (shouldFail) throw new Error('Network error: Unable to process files');
    return {
      data: {
        'vendorName[0]': 'Demo Vendor Inc.',
        'amount[0]': '125.50',
        'date[0]': '2025-08-08',
        'description[0]': 'Office supplies and equipment',
      },
    };
  },
  async getContentTypes() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: [
        { Id: 'expense', Name: 'Expense Report' },
        { Id: 'purchase', Name: 'Purchase Order' },
        { Id: 'invoice', Name: 'Invoice' },
        { Id: 'travel', Name: 'Travel Expense' },
      ],
    };
  },
  async getFields(contentType) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      data: {
        fields: [
          { stateKey: 'vendorName[i]', label: 'Vendor Name', dataType: 'string', required: true },
          { stateKey: 'amount[i]', label: 'Amount ($)', dataType: 'number', required: true },
          { stateKey: 'date[i]', label: 'Date', dataType: 'date', required: true },
          { stateKey: 'description[i]', label: 'Description', dataType: 'text', required: false },
        ],
      },
    };
  },
  async submit(shouldFail = false) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (shouldFail) throw new Error('Submission failed: Server timeout');
    return { data: { id: Math.random().toString(36).substr(2, 9) } };
  },
};

const checkImageQuality = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    hasFourEdges: Math.random() > 0.2,
    blurVariance: Math.random() * 200,
    ocrConfidence: Math.random() * 100,
  };
};

// === HEADER WITH LOGO ===
function UserHeader() {
  const { user } = useContext(UserContext);
  return (
    <div className="gradient-purple-dark text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src={logoUrl}
            alt="TCFV Logo"
            className="w-14 h-14 rounded-2xl shadow-lg hoverable"
          />
          <div>
            <h1 className="text-3xl font-bold text-readable-white tracking-tight">
              Receipt Extractor
            </h1>
            <p className="text-readable-white-light">
              TCFV’s Custom Automated Document Processor
            </p>
          </div>
        </div>
        <div className="text-right bg-white/10 rounded-2xl px-6 py-4 border border-white/15 shadow-lg">
          <p className="font-bold text-readable-white">{user?.name || 'Demo User'}</p>
          <p className="text-readable-white-light">{user?.email || 'demo@company.com'}</p>
        </div>
      </div>
    </div>
  );
}

// === MAIN APP ===
export default function App() {
  const [currentPage, setCurrentPage] = useState('/upload');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const { resetReceipt } = useContext(ReceiptContext); // FIXED: moved hook out of handler

  const navigate = (path) => setCurrentPage(path);
  const handleExit = () => setShowExitConfirm(true);
  const confirmExit = () => window.close() || (window.location.href = 'about:blank');

  const renderPage = () => {
    if (currentPage === '/submit') {
      return (
        <div className="max-w-4xl mx-auto py-8 px-6 text-center">
          <div className="modern-card animate-fade-in">
            <div className="text-8xl mb-8 animate-float">🎉</div>
            <h1 className="text-4xl font-bold text-readable mb-6">Submission Complete!</h1>
            <p className="text-xl text-readable-light mb-10 font-medium">
              Your document has been processed and submitted successfully.
            </p>
            <button
              onClick={() => {
                resetReceipt();
                navigate('/upload');
              }}
              className="btn-modern hover:scale-105 transition-transform"
            >
              <span className="text-xl mr-2">📤</span>
              <span className="font-bold">Submit Another Document</span>
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto py-8 px-6 text-center">
        <p className="text-readable-white">Other pages go here…</p>
      </div>
    );
  };

  return (
    <UserProvider>
      <ReceiptProvider>
        <div className="min-h-screen gradient-purple">
          <UserHeader />
          <div className="py-10">{renderPage()}</div>
          {showExitConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
              <div className="dialog-modern max-w-md w-full animate-fade-in">
                <div className="p-8 border-l-4 border-red-400 bg-gradient-to-r from-red-50/95 to-pink-50/95">
                  <div className="flex items-start">
                    <div className="text-4xl mr-4">⚠️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-readable mb-3">Exit Application?</h3>
                      <p className="text-readable-light font-medium">
                        Any unsaved progress will be lost permanently.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-6 bg-gray-50/95 flex justify-end space-x-4 rounded-b-3xl">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="btn-secondary hover:scale-105"
                  >
                    Stay
                  </button>
                  <button onClick={confirmExit} className="btn-danger hover:scale-105">
                    Exit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ReceiptProvider>
    </UserProvider>
  );
}
