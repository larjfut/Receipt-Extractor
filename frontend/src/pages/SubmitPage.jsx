import React, { useContext, useState } from 'react';
import axios from 'axios';
import { ReceiptContext } from '../context/ReceiptContext.jsx';

export default function SubmitPage() {
  const { receipt } = useContext(ReceiptContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await axios.post('http://localhost:5000/api/submit', {
        fields: receipt.fields,
        attachments: receipt.attachments.map((file) => ({
          name: file.name,
          type: file.type,
          // In a real implementation the file content would be uploaded separately.
        })),
        signature: receipt.signature,
      });
      setSuccess(true);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Submit Requisition</h1>
      <p>Please review your information and click the button below to submit.</p>
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md"
        disabled={loading || success}
      >
        {loading ? 'Submitting…' : success ? 'Submitted' : 'Submit to SharePoint'}
      </button>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {success && <p className="mt-2 text-green-700">Your requisition has been submitted successfully.</p>}
    </div>
  );
}