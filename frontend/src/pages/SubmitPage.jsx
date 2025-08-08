import React, { useContext, useState } from "react";
import axios from "axios";
import { ReceiptContext } from "../context/ReceiptContext.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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
      const attachments = await Promise.all(
        (receipt.attachments || []).map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result.split(",")[1];
                resolve({ name: file.name, type: file.type, content: base64 });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );

      const res = await axios.post(`${API_BASE_URL}/submit`, {
        fields: receipt.fields,
        attachments,
        signature: receipt.signature,
        contentTypeId: receipt.contentTypeId,
      });

      setSuccess(true);

      const itemId = res.data?.id;
      if (itemId) {
        const siteUrl = import.meta.env.VITE_SHAREPOINT_SITE_URL;
        const listId = import.meta.env.VITE_SHAREPOINT_LIST_ID;
        if (siteUrl && listId) {
          const editUrl = `${siteUrl}/_layouts/15/listform.aspx?PageType=6&ListId=${listId}&ID=${itemId}`;
          window.location.href = editUrl;
        }
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-readable-white mb-2">
          Submit Requisition
        </h1>
        <p className="text-readable-white-light text-lg">
          Review your information and click the button below to submit.
        </p>
      </header>

      <section className="modern-card animate-fade-in text-center">
        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className="btn-modern w-full hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          aria-busy={loading}
        >
          {loading
            ? "Submitting…"
            : success
            ? "Submitted"
            : "Submit to SharePoint"}
        </button>

        {error && (
          <div
            className="mt-6 modern-card gradient-pink text-white animate-fade-in"
            role="alert"
          >
            <div className="flex items-start">
              <span className="text-3xl mr-3">❌</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Submission Error</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div
            className="mt-6 modern-card gradient-cream animate-fade-in"
            role="status"
          >
            <div className="flex items-start">
              <span className="text-3xl mr-3">✅</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1 text-readable">
                  Success
                </h3>
                <p className="text-sm text-readable-light">
                  Your requisition has been submitted successfully.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
