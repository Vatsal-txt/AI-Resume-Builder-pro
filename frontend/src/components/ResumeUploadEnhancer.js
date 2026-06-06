
// ─────────────────────────────────────────────────────────────
// ResumeUploadEnhancer.js — Upload & AI-Enhance Existing Resume
// Accepts .txt / .pdf (text layer), sends to backend /enhance-resume
// shows side-by-side original vs enhanced
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef } from "react";

// ── Load pdf.js from CDN ──────────────────────────────────────
function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.head.appendChild(script);
  });
}

// ── Extract text from PDF using pdf.js ───────────────────────
async function extractPdfText(file) {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText.trim();
}

// ── Read plain text file ──────────────────────────────────────
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

// ── Route to correct reader based on file type ────────────────
async function extractText(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "pdf") {
    return await extractPdfText(file);
  }
  return await readFileAsText(file);
}

// ── Sub-components ────────────────────────────────────────────
function UploadZone({ onFile, file }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      className={`
        relative cursor-pointer border-2 border-dashed rounded-xl p-10
        flex flex-col items-center gap-3 transition-all
        ${dragging
          ? "border-emerald-400 bg-emerald-500/10"
          : file
          ? "border-emerald-600 bg-emerald-500/5"
          : "border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800/60"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf"
        className="hidden"
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />

      {file ? (
        <>
          <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-2xl">
            📄
          </div>
          <p className="text-emerald-400 font-semibold text-sm">{file.name}</p>
          <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB · click to change</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-2xl">
            ⬆
          </div>
          <p className="text-slate-300 font-semibold text-sm">Drop your resume here</p>
          <p className="text-slate-500 text-xs">Supports .txt and .pdf · or click to browse</p>
        </>
      )}
    </div>
  );
}

function ResumePanel({ label, badge, badgeColor, content, placeholder }) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded font-mono border ${badgeColor}`}>{badge}</span>
      </div>
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-y-auto max-h-[520px]">
        {content ? (
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {content}
          </pre>
        ) : (
          <p className="text-slate-600 text-sm italic">{placeholder}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function ResumeUploadEnhancer() {
  const [file, setFile] = useState(null);
  const [originalText, setOriginalText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("idle"); // idle | ready | enhancing | done

  // ── File selection handler ──────────────────────────────────
  const handleFile = async (f) => {
    setFile(f);
    setError("");
    setEnhancedText("");
    setOriginalText("");
    setStep("ready");
    setExtracting(true);

    try {
      const text = await extractText(f);

      if (!text.trim()) {
        setError("Could not extract text from this file. Make sure your PDF has a text layer (not scanned).");
        setStep("idle");
        return;
      }

      setOriginalText(text);
    } catch (err) {
      setError("Failed to read the file: " + err.message);
      setStep("idle");
    } finally {
      setExtracting(false);
    }
  };

  // ── Enhance handler ─────────────────────────────────────────
  const handleEnhance = async () => {
    if (!originalText.trim()) return;

    setLoading(true);
    setError("");
    setStep("enhancing");

    try {
      const response = await fetch("http://localhost:5000/enhance-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: originalText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI service unavailable.");
      }

      setEnhancedText(data.enhanced);
      setStep("done");
    } catch (err) {
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setError("Backend offline — start the server (npm start in /backend) for AI results.");
      } else {
        setError(err.message);
      }
      setStep("ready");
    } finally {
      setLoading(false);
    }
  };

  // ── Copy helper ─────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Enhance Existing Resume</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload your current resume and AI will rewrite it with stronger language, better structure, and ATS-friendly formatting — your original stays untouched.
        </p>
      </div>

      {/* Upload zone */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-400 text-lg">⬆</span>
          <h2 className="text-base font-bold text-slate-100">Upload Resume</h2>
        </div>
        <UploadZone onFile={handleFile} file={file} />

        {/* Extracting indicator */}
        {extracting && (
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Extracting text from PDF…
          </p>
        )}

        {/* Enhance button */}
        {step !== "idle" && !extracting && (
          <div className="flex items-center gap-4 pt-1 flex-wrap">
            <button
              onClick={handleEnhance}
              disabled={loading || !originalText}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${step === "done"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5"
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  AI is enhancing…
                </>
              ) : step === "done" ? (
                <>✦ Re-Enhance</>
              ) : (
                <>✦ Enhance with AI</>
              )}
            </button>

            {step === "done" && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-slate-100 text-sm font-medium transition-all"
              >
                {copied ? "✓ Copied!" : "⧉ Copy Enhanced"}
              </button>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                ⚠ {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Side-by-side panels */}
      {(originalText || enhancedText) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-emerald-400 text-lg">◫</span>
            <h2 className="text-base font-bold text-slate-100">Side-by-Side Comparison</h2>
          </div>

          <div className="flex gap-5">
            <ResumePanel
              label="Original"
              badge="unchanged"
              badgeColor="text-slate-400 border-slate-700 bg-slate-800/50"
              content={originalText}
              placeholder="Your original resume will appear here after uploading."
            />

            <div className="w-px bg-slate-800 flex-shrink-0 self-stretch" />

            <ResumePanel
              label="AI Enhanced"
              badge="✦ improved"
              badgeColor="text-amber-400 border-amber-500/30 bg-amber-500/5"
              content={enhancedText}
              placeholder={
                step === "enhancing"
                  ? "AI is rewriting your resume…"
                  : "Click ✦ Enhance with AI to see the improved version here."
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}