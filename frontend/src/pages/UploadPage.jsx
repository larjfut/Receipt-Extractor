import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ReceiptContext } from "../context/ReceiptContext.jsx";
import FileUpload from "../components/FileUpload.jsx";
import { QUALITY_MESSAGES } from "../utils/qualityMessages";
import { normalizeKeys } from "../utils/normalizeKeys";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export default function UploadPage() {
  const { receipt, setReceipt, contentTypes, setContentTypes } = useContext(ReceiptContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { type, message }
  const [inputKey, setInputKey] = useState(0);

  const [readyAttachments, setReadyAttachments] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedContentType, setSelectedContentType] = useState(null);
  const [rejectedFiles, setRejectedFiles] = useState([]);

  // Build object URLs for previews and clean up on change/unmount
  useEffect(() => {
    const urls = readyAttachments.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [readyAttachments]);

  const handleFileUpload = async (files) => {
    setError(null);
    setRejectedFiles([]);

    const accepted = [];
    const rejected = [];

    for (const { file, quality } of files) {
      let reason = null;
      if (file.type === "application/pdf") {
        // PDFs skip image quality checks
      } else if (quality?.error) reason = quality.error;
      else if (!quality?.hasFourEdges) reason = QUALITY_MESSAGES.edges;
      else if (quality.blurVariance < 100) reason = QUALITY_MESSAGES.blur;
      else if (quality.ocrConfidence < 60) reason = QUALITY_MESSAGES.ocr;

      if (reason) rejected.push({ name: file.name, reason });
      else accepted.push(file);
    }

    if (rejected.length) setRejectedFiles(rejected);
    if (accepted.length) setReadyAttachments((prev) => [...prev, ...accepted]);
  };

  const clearReadyAttachments = () => {
    setReadyAttachments([]);
    setPreviewUrls((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return [];
    });
  };

  const uploadReadyAttachments = async () => {
    if (readyAttachments.length === 0) {
      setError({ type: "validation", message: "Please add files before submitting." });
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      readyAttachments.forEach((file) => formData.append("files", file));

      const resp = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const rawFields = Array.isArray(resp.data)
        ? resp.data.reduce((acc, cur) => ({ ...acc, ...(cur.data || {}) }), {})
        : resp.data?.data || {};

      const fields = normalizeKeys(rawFields);

      setReceipt((prev) => ({
        ...prev,
        fields,
        attachments: [...(prev.attachments || []), ...readyAttachments],
      }));

      clearReadyAttachments();

      if (!contentTypes.length) {
        const ctRes = await axios.get(`${API_BASE_URL}/content-types`);
        setContentTypes(ctRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError({
        type: "backend",
        message: err.response?.data?.error || err.message || "Upload failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentTypeChange = (e) => {
    const id = e.target.value;
    const ct = contentTypes.find((c) => (c.Id?.StringValue || c.Id) === id);
    setSelectedContentType(ct || null);
    setReceipt((prev) => ({
      ...prev,
      contentTypeId: id,
      contentTypeName: ct?.Name || "",
    }));
  };

  const handleContinue = () => {
    if (!selectedContentType) {
      setError({ type: "validation", message: "Select a content type to continue." });
      return;
    }
    if (!receipt.attachments?.length) {
      setError({ type: "validation", message: "Upload and process files first." });
      return;
    }
    navigate("/review");
  };

  const handleRetake = () => {
    setError(null);
    setRejectedFiles([]);
    setInputKey((k) => k + 1); // reset FileUpload input
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-readable-white mb-2">
          Upload Your Documents
        </h1>
        <p className="text-readable-white-light text-lg">
          Add images or PDFs. We’ll extract the data for you.
        </p>
      </header>

      <section className="modern-card animate-fade-in mb-8" aria-label="File upload">
        <FileUpload key={inputKey} onFileSelected={handleFileUpload} />
      </section>

      {readyAttachments.length > 0 && (
        <section className="modern-card animate-fade-in mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-readable flex items-center">
              <span className="text-3xl mr-3">📎</span>
              Files Ready for Processing ({readyAttachments.length})
            </h2>
            <button
              type="button"
              onClick={clearReadyAttachments}
              className="btn-secondary hover:scale-105"
              aria-label="Clear all selected files"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {readyAttachments.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="p-3 rounded-xl border border-white/10 bg-white/5 hoverable"
                title={file.name}
              >
                {file.type === "application/pdf" ? (
                  <div className="w-full aspect-square rounded-lg flex items-center justify-center gradient-orange">
                    <span className="text-3xl">📄</span>
                  </div>
                ) : (
                  <img
                    src={previewUrls[idx]}
                    alt={`ready-${idx}`}
                    className="w-full aspect-square object-cover rounded-lg"
                    loading="lazy"
                  />
                )}
                <div className="mt-2 text-xs font-semibold text-readable truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={uploadReadyAttachments}
            disabled={loading}
            className="btn-modern w-full mt-6 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "Processing files..." : "Process Files"}
          </button>
        </section>
      )}

      {receipt.attachments?.length > 0 && (
        <section className="modern-card animate-fade-in mb-8">
          <div className="flex items-start">
            <span className="text-4xl mr-4">✅</span>
            <div>
              <p className="text-xl font-bold text-readable">
                Successfully processed {receipt.attachments.length} file
                {receipt.attachments.length > 1 ? "s" : ""}
              </p>
              <p className="text-readable-light">
                Extracted {Object.keys(receipt.fields || {}).length} data fields.
              </p>
            </div>
          </div>
        </section>
      )}

      {contentTypes.length > 0 && (
        <section className="modern-card animate-fade-in mb-8" aria-label="Content type">
          <label className="block text-lg font-bold text-readable mb-2">
            <span className="text-2xl mr-2">📋</span>
            Content Type
          </label>
          <select
            value={
              selectedContentType
                ? selectedContentType.Id?.StringValue || selectedContentType.Id
                : ""
            }
            onChange={handleContentTypeChange}
            className="form-input-modern mb-4"
            aria-describedby="content-type-help"
          >
            <option value="" disabled>
              Select a content type
            </option>
            {contentTypes.map((ct) => (
              <option key={ct.Id?.StringValue || ct.Id} value={ct.Id?.StringValue || ct.Id}>
                {ct.Name}
              </option>
            ))}
          </select>
          <p id="content-type-help" className="text-sm text-readable-white-light mb-6">
            Choose where these documents will be filed.
          </p>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedContentType || !receipt.attachments?.length}
            className="btn-modern w-full disabled:opacity-60 disabled:pointer-events-none"
          >
            Continue to Review
          </button>
        </section>
      )}

      {rejectedFiles.length > 0 && (
        <section
          className="modern-card gradient-cream animate-fade-in mb-8"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start">
            <span className="text-3xl mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-readable mb-1">Some files were rejected</h3>
              <ul className="text-sm text-readable-light list-disc list-inside">
                {rejectedFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`}>
                    <span className="font-semibold text-readable">{f.name}</span>: {f.reason}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleRetake}
                className="btn-secondary mt-4 hover:scale-105"
              >
                Retake
              </button>
            </div>
          </div>
        </section>
      )}

      {error && (
        <section className="modern-card gradient-pink text-white animate-fade-in" role="alert">
          <div className="flex items-start">
            <span className="text-3xl mr-3">❌</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">There was a problem</h3>
              <p className="text-sm opacity-90">{error.message}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
