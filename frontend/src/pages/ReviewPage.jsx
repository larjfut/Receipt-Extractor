import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ReceiptContext } from "../context/ReceiptContext.jsx";
import { parseFieldValidation } from "../utils/parseFieldValidation";

const options = parseFieldValidation(field.validation);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export default function ReviewPage() {
  const { receipt, setReceipt } = useContext(ReceiptContext);
  const [mapping, setMapping] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const navigate = useNavigate();

  const resolveKey = (key, idx = 0) => key.replace("[i]", `[${idx}]`);

  useEffect(() => {
    async function loadMapping() {
      setLoading(true);
      setFetchError("");
      setMapping([]);
      setErrors({});
      try {
        const res = await axios.get(`${API_BASE_URL}/fields`, {
          params: { contentType: receipt.contentTypeName },
        });
        const mapping = res.data.fields || res.data;
        setMapping(mapping);
      } catch (e) {
        console.error("Failed to load field mapping", e);
        setFetchError("Failed to load field mapping.");
      } finally {
        setLoading(false);
      }
    }
    if (receipt.contentTypeName) loadMapping();
  }, [receipt.contentTypeName]);

  const handleChange = (key, value) => {
    setReceipt((prev) => ({
      ...prev,
      fields: { ...prev.fields, [key]: value },
    }));
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    mapping.forEach((field) => {
      if (["file[]", "dataURL"].includes(field.dataType)) return;
      const resolvedKey = resolveKey(field.stateKey);
      const value = receipt.fields[resolvedKey];
      if (field.required && (value === undefined || value === "" || value === null)) {
        newErrors[resolvedKey] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) navigate("/signature");
  };

  const renderInput = (field) => {
    const resolvedKey = resolveKey(field.stateKey);
    const value = receipt.fields[resolvedKey] || "";
    const baseProps = {
      className: "form-input-modern",
      value,
      required: field.required,
      onChange: (e) => handleChange(resolvedKey, e.target.value),
    };

    if (field.dataType === "date") return <input type="date" {...baseProps} />;
    if (field.dataType === "number") return <input type="number" {...baseProps} />;
    if (field.dataType === "text")
      return <textarea rows={3} {...baseProps} />;
    if (field.dataType === "dropdown" || field.dataType === "lookup") {
      let options = [];
      if (field.validation && field.validation.trim().startsWith("[")) {
        try {
          options = JSON.parse(field.validation.replace(/'/g, '"'));
        } catch {}
      }
      return (
        <select {...baseProps}>
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    return <input type="text" {...baseProps} />;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-readable-white mb-2">
          Review Extracted Data
        </h1>
        <p className="text-readable-white-light text-lg">
          Confirm and edit the extracted fields before signing.
        </p>
      </header>

      {fetchError && (
        <div
          className="modern-card gradient-pink text-white mb-6 animate-fade-in"
          role="alert"
        >
          <div className="flex items-start">
            <span className="text-3xl mr-3">❌</span>
            <div>
              <h3 className="text-lg font-bold mb-1">Error Loading Fields</h3>
              <p className="text-sm opacity-90">{fetchError}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="modern-card animate-fade-in text-center text-readable-white-light">
          Loading field mapping…
        </div>
      ) : (
        mapping.length > 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="modern-card animate-fade-in"
          >
            {mapping
              .filter((f) => !["file[]", "dataURL"].includes(f.dataType))
              .map((field) => {
                const resolvedKey = resolveKey(field.stateKey);
                return (
                  <div key={field.stateKey} className="mb-5">
                    <label className="block text-sm font-medium text-readable mb-1">
                      {field.label}
                      {field.required && <span className="text-red-400"> *</span>}
                    </label>
                    {renderInput(field)}
                    {errors[resolvedKey] && (
                      <p className="mt-1 text-xs text-red-400">
                        {errors[resolvedKey]}
                      </p>
                    )}
                  </div>
                );
              })}

            <button
              type="submit"
              className="btn-modern w-full hover:scale-105 mt-6"
            >
              Continue to Signature
            </button>
          </form>
        )
      )}
    </div>
  );
}
