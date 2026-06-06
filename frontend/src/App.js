// ─────────────────────────────────────────────────────────────
// AI Resume Builder — App.js
// Main application shell: routing between Form and Preview
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import ResumeUploadEnhancer from "./components/ResumeUploadEnhancer";

// ── Initial resume state ──────────────────────────────────────
const INITIAL_RESUME = {
  personal: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  experience: [
    {
      id: Date.now(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      bullets: [],
    },
  ],
  education: [
    {
      id: Date.now() + 1,
      degree: "",
      school: "",
      year: "",
      gpa: "",
    },
  ],
  skills: [],
};

export default function App() {
  const [resume, setResume] = useState(INITIAL_RESUME);
  const [activeView, setActiveView] = useState("form"); // "form" | "preview" | "enhance"

  const updatePersonal = (field, value) => {
    setResume((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const updateExperience = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now(),
          jobTitle: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          bullets: [],
        },
      ],
    }));
  };

  const removeExperience = (id) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const updateEducation = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now(), degree: "", school: "", year: "", gpa: "" },
      ],
    }));
  };

  const removeEducation = (id) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const updateSkills = (skills) => {
    setResume((prev) => ({ ...prev, skills }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Top Nav ─────────────────────────────────────────── */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-black text-slate-950 text-sm">
              AI
            </div>
            <span className="font-bold text-lg tracking-tight">Resume Builder</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">

            </span>
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-900 rounded-lg p-1 gap-1">
            <button
              onClick={() => setActiveView("form")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeView === "form"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ✎ Edit
            </button>
            <button
              onClick={() => setActiveView("preview")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeView === "preview"
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ◉ Preview
            </button>
            <button
              onClick={() => setActiveView("enhance")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeView === "enhance"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ✦ Enhance Existing
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeView === "form" ? (
          <ResumeForm
            resume={resume}
            onUpdatePersonal={updatePersonal}
            onUpdateExperience={updateExperience}
            onAddExperience={addExperience}
            onRemoveExperience={removeExperience}
            onUpdateEducation={updateEducation}
            onAddEducation={addEducation}
            onRemoveEducation={removeEducation}
            onUpdateSkills={updateSkills}
            onPreview={() => setActiveView("preview")}
          />
        ) : activeView === "preview" ? (
          <ResumePreview resume={resume} onBack={() => setActiveView("form")} />
        ) : (
          <ResumeUploadEnhancer />
        )}
      </main>
    </div>
  );
}
