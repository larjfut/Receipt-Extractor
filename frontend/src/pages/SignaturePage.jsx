import React, { useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { ReceiptContext } from '../context/ReceiptContext.jsx';

export default function SignaturePage() {
  const sigCanvas = useRef(null);
  const { receipt, setReceipt } = useContext(ReceiptContext);
  const navigate = useNavigate();

  const handleClear = () => {
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  const handleNext = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      setReceipt((prev) => ({ ...prev, signature: dataUrl }));
    }
    navigate('/submit');
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Signature</h1>
      <SignatureCanvas
        ref={sigCanvas}
        canvasProps={{ width: 600, height: 200, className: 'border border-gray-300 rounded-md bg-white' }}
      />
      <div className="mt-2 space-x-2">
        <button onClick={handleClear} className="px-3 py-2 bg-gray-200 rounded-md">
          Clear
        </button>
        <button onClick={handleNext} className="px-3 py-2 bg-blue-600 text-white rounded-md">
          Continue to Submit
        </button>
      </div>
    </div>
  );
}