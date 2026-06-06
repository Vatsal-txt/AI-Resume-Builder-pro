// ─────────────────────────────────────────────────────────────
// AIButton.js — AI Enhance Button Component
// Handles calling backend /enhance, shows spinner, error states
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";

// Fallback bullet points when API is unavailable
const FALLBACK_BULLETS = [
  "Led development of core product features, improving user engagement by 35%",
  "Collaborated cross-functionally with design, product, and QA teams to ship on schedule",
  "Optimized system performance reducing average response time by 40%",
  "Mentored junior team members through code reviews and technical guidance",
  "Maintained 99.9% uptime by implementing robust monitoring and alerting systems",
];

export default function AIButton({ description, jobTitle, onResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEnhance = async () => {
    // ── Validation ─────────────────────────────────────────
    const text = (description || jobTitle || "").trim();
    if (!text) {
      setError("Please enter a job description before enhancing.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:5000/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Server returned an error
        throw new Error(data.error || "AI service unavailable, please try again.");
      }

      // Pass bullets up to parent
      onResult(data.bullets || []);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Enhance error:", err.message);

      // If network error (server not running), use fallback
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        onResult(FALLBACK_BULLETS);
        setError("Backend offline — showing sample bullets. Start the server for AI results.");
      } else {
        setError(err.message || "AI service unavailable, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleEnhance}
        disabled={loading}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm
          transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
          ${success
            ? "bg-emerald-500 text-white"
            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5"
          }
        `}
      >
        {loading ? (
          <>
            {/* Spinner */}
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Enhancing…
          </>
        ) : success ? (
          <>✓ Enhanced!</>
        ) : (
          <>✦ AI Enhance</>
        )}
      </button>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2 max-w-sm">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
