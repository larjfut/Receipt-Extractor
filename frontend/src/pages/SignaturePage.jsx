import React, { useRef, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { ReceiptContext } from "../context/ReceiptContext.jsx";

export default function SignaturePage() {
  const sigCanvas = useRef(null);
  const shellRef = useRef(null);
  const { setReceipt } = useContext(ReceiptContext);
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 200 });

  // Responsive canvas sizing based on container
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const resize = () => {
      const w = Math.min(800, el.clientWidth - 2); // small padding allowance
      const h = Math.max(180, Math.round(w / 3)); // keep a nice aspect
      setCanvasSize({ width: w, height: h });
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener("orientationchange", resize);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  const clear = () => {
    setError(null);
    sigCanvas.current?.clear();
  };

  const undo = () => {
    const sig = sigCanvas.current;
    if (!sig) return;
    const data = sig.toData();
    if (!data.length) return;
    data.pop();
    sig.fromData(data);
  };

  const handleNext = () => {
    const sig = sigCanvas.current;
    if (!sig) return;

    if (sig.isEmpty()) {
      setError("Please add your signature before continuing.");
      return;
    }

    const dataUrl = sig.getTrimmedCanvas().toDataURL("image/png");
    setReceipt((prev) => ({ ...prev, signature: dataUrl }));
    navigate("/submit");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-readable-white mb-2">
          Sign Your Document
        </h1>
        <p className="text-readable-white-light text-lg">
          Use your mouse or finger to sign in the box below.
        </p>
      </header>

      <section className="modern-card animate-fade-in">
        <div ref={shellRef} className="w-full">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="rgba(20,20,20,1)"
            backgroundColor="#ffffff"
            canvasProps={{
              width: canvasSize.width,
              height: canvasSize.height,
              className:
                "block w-full h-auto bg-white rounded-xl border border-black/10 shadow-lg",
              role: "img",
              "aria-label": "Signature canvas",
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={undo}
            className="btn-secondary hover:scale-105"
            aria-label="Undo last stroke"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={clear}
            className="btn-secondary hover:scale-105"
            aria-label="Clear signature"
          >
            Clear
          </button>
          <div className="ml-auto" />
          <button
            type="button"
            onClick={handleNext}
            className="btn-modern hover:scale-105"
          >
            Continue to Submit
          </button>
        </div>

        {error && (
          <div
            className="mt-4 modern-card gradient-pink text-white animate-fade-in"
            role="alert"
          >
            <div className="flex items-start">
              <span className="text-3xl mr-3">❌</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Signature Required</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-readable-white-light">
          Tip: If signing on desktop, try a trackpad. On mobile, rotate your
          device for a wider canvas.
        </p>
      </section>
    </div>
  );
}
