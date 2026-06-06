// ─────────────────────────────────────────────────────────────
// ResumePreview.js — Live Resume Preview + PDF Export
// Clean, print-ready layout styled for real resumes
// ─────────────────────────────────────────────────────────────

import React from "react";

// ── Print styles injected into <head> ────────────────────────
const PRINT_STYLE = `
  @media print {
    body { background: white !important; }
    .no-print { display: none !important; }
    .resume-sheet {
      box-shadow: none !important;
      border-radius: 0 !important;
      margin: 0 !important;
      max-width: 100% !important;
    }
  }
`;

// ── Section Title ─────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <h3
      style={{
        fontFamily: "Georgia, serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "#1e3a5f",
      }}
    >
      {children}
    </h3>
    <div style={{ flex: 1, height: 1, background: "#1e3a5f", opacity: 0.3 }} />
  </div>
);

// ── Entry Row ─────────────────────────────────────────────────
const EntryHeader = ({ title, sub, right }) => (
  <div style={{ marginBottom: 4 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
      <span style={{ fontSize: 12, color: "#666" }}>{right}</span>
    </div>
    {sub && <div style={{ fontSize: 13, color: "#555", marginTop: 1 }}>{sub}</div>}
  </div>
);

// ── Bullet ────────────────────────────────────────────────────
const Bullet = ({ text }) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "flex-start" }}>
    <span style={{ color: "#1e3a5f", marginTop: 1, flexShrink: 0, fontSize: 13 }}>▸</span>
    <span style={{ fontSize: 13, lineHeight: 1.65, color: "#333" }}>{text}</span>
  </div>
);

// ── Resume Sheet ──────────────────────────────────────────────
function ResumeSheet({ resume }) {
  const { personal, experience, education, skills } = resume;

  return (
    <div
      className="resume-sheet"
      style={{
        background: "white",
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        color: "#1a1a1a",
        maxWidth: 816,
        margin: "0 auto",
        boxShadow: "0 8px 60px rgba(0,0,0,0.25)",
        borderRadius: 4,
        overflow: "hidden",
        minHeight: 1056,
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        style={{
          background: "#1e3a5f",
          color: "white",
          padding: "40px 48px 32px",
        }}
      >
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 6,
          }}
        >
          {personal.name || "Your Name"}
        </h1>
        <div style={{ fontSize: 15, color: "#93c5fd", fontWeight: 500, marginBottom: 16 }}>
          {personal.title || "Professional Title"}
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13, color: "#bfdbfe" }}>
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>✆ {personal.phone}</span>}
          {personal.location && <span>⌖ {personal.location}</span>}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div style={{ padding: "40px 48px" }}>
        {/* Summary */}
        {personal.summary && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Summary</SectionTitle>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: "#444" }}>{personal.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.filter((e) => e.jobTitle || e.company).length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Experience</SectionTitle>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 22 }}>
                <EntryHeader
                  title={exp.jobTitle || "Job Title"}
                  sub={[exp.company, exp.location].filter(Boolean).join(" · ")}
                  right={[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}
                />
                {/* AI bullets or raw description */}
                <div style={{ marginTop: 8 }}>
                  {exp.bullets.length > 0
                    ? exp.bullets.map((b, bi) => <Bullet key={bi} text={b} />)
                    : exp.description
                    ? <Bullet text={exp.description} />
                    : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.filter((e) => e.degree || e.school).length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <SectionTitle>Education</SectionTitle>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <EntryHeader
                  title={edu.degree || "Degree"}
                  sub={[edu.school, edu.gpa ? `GPA: ${edu.gpa}` : null].filter(Boolean).join(" · ")}
                  right={edu.year}
                />
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <SectionTitle>Skills</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    padding: "4px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 3,
                    fontSize: 12,
                    color: "#334155",
                    background: "#f8fafc",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ResumePreview ────────────────────────────────────────
export default function ResumePreview({ resume, onBack }) {
  const handleExportPDF = () => window.print();

  return (
    <>
      {/* Print style */}
      <style>{PRINT_STYLE}</style>

      {/* Top toolbar — hidden on print */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Resume Preview</h1>
          <p className="text-slate-500 text-sm mt-1">
            This is how your resume will look when printed or exported as PDF
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium rounded-lg transition-colors"
          >
            ← Back to Editor
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold text-sm rounded-lg transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-amber-500/25"
          >
            ↓ Export PDF
          </button>
        </div>
      </div>

      {/* Resume */}
      <ResumeSheet resume={resume} />
    </>
  );
}
