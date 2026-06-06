// ─────────────────────────────────────────────────────────────
// ResumeForm.js — Resume Editor Form
// Sections: Personal Info, Experience, Education, Skills
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import AIButton from "./AIButton";

// ── Reusable field components ─────────────────────────────────
const Label = ({ children }) => (
  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
    {children}
  </label>
);

const Input = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-vertical"
  />
);

const SectionCard = ({ title, icon, children, action }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-emerald-400 text-lg">{icon}</span>
        <h2 className="text-base font-bold text-slate-100">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ── Personal Info ─────────────────────────────────────────────
function PersonalSection({ personal, onUpdate }) {
  return (
    <SectionCard title="Personal Information" icon="◯">
      <div className="grid grid-cols-2 gap-4">
        {[
          ["name", "Full Name", "Jane Smith"],
          ["title", "Job Title", "Software Engineer"],
          ["email", "Email", "jane@example.com"],
          ["phone", "Phone", "+1 555-000-0000"],
          ["location", "Location", "San Francisco, CA"],
        ].map(([field, label, ph]) => (
          <div key={field}>
            <Label>{label}</Label>
            <Input value={personal[field]} onChange={(v) => onUpdate(field, v)} placeholder={ph} />
          </div>
        ))}
      </div>
      <div>
        <Label>Professional Summary</Label>
        <Textarea
          value={personal.summary}
          onChange={(v) => onUpdate("summary", v)}
          placeholder="Briefly describe your background, key skills, and what you bring to a team..."
          rows={3}
        />
      </div>
    </SectionCard>
  );
}

// ── Experience Entry ──────────────────────────────────────────
function ExperienceEntry({ exp, onUpdate, onRemove }) {
  const handleBulletChange = (index, value) => {
    const updated = [...exp.bullets];
    updated[index] = value;
    onUpdate("bullets", updated);
  };

  const removeBullet = (index) => {
    onUpdate("bullets", exp.bullets.filter((_, i) => i !== index));
  };

  const addBullet = () => {
    onUpdate("bullets", [...exp.bullets, "New bullet point…"]);
  };

  return (
    <div className="bg-slate-950 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Work Experience</span>
        <button
          onClick={onRemove}
          className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["jobTitle", "Job Title", "Software Engineer at Hackathon Inc."],
          ["company", "Company", "Acme Corp"],
          ["location", "Location", "Remote"],
          ["startDate", "Start Date", "Jan 2022"],
          ["endDate", "End Date", "Present"],
        ].map(([field, label, ph]) => (
          <div key={field}>
            <Label>{label}</Label>
            <Input value={exp[field]} onChange={(v) => onUpdate(field, v)} placeholder={ph} />
          </div>
        ))}
      </div>

      <div>
        <Label>Job Description (used for AI enhancement)</Label>
        <Textarea
          value={exp.description}
          onChange={(v) => onUpdate("description", v)}
          placeholder="Describe your responsibilities, achievements, and technologies used…"
          rows={3}
        />
      </div>

      {/* AI Enhance Button */}
      <div className="flex items-center gap-4 flex-wrap">
        <AIButton
          description={exp.description}
          jobTitle={exp.jobTitle}
          onResult={(bullets) => onUpdate("bullets", bullets)}
        />
        <p className="text-xs text-slate-500">
          Generates ATS-friendly bullet points from your description
        </p>
      </div>

      {/* AI-generated bullets - editable */}
      {exp.bullets.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              ✦ AI-Generated Bullets (editable)
            </p>
            <button
              onClick={addBullet}
              className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
            >
              + Add bullet
            </button>
          </div>
          {exp.bullets.map((bullet, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-500 mt-2.5 text-xs flex-shrink-0">—</span>
              <textarea
                value={bullet}
                onChange={(e) => handleBulletChange(i, e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
                rows={2}
              />
              <button
                onClick={() => removeBullet(i)}
                className="text-slate-600 hover:text-red-400 transition-colors mt-1.5 text-base leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Education Entry ───────────────────────────────────────────
function EducationEntry({ edu, onUpdate, onRemove }) {
  return (
    <div className="bg-slate-950 border border-slate-700 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Education</span>
        <button onClick={onRemove} className="text-slate-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["degree", "Degree / Major", "B.S. Computer Science"],
          ["school", "Institution", "MIT"],
          ["year", "Graduation Year", "2020"],
          ["gpa", "GPA (optional)", "3.9 / 4.0"],
        ].map(([field, label, ph]) => (
          <div key={field}>
            <Label>{label}</Label>
            <Input value={edu[field]} onChange={(v) => onUpdate(field, v)} placeholder={ph} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skills Section ────────────────────────────────────────────
function SkillsSection({ skills, onUpdate }) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const s = input.trim();
    if (s && !skills.includes(s)) {
      onUpdate([...skills, s]);
      setInput("");
    }
  };

  const removeSkill = (idx) => onUpdate(skills.filter((_, i) => i !== idx));

  return (
    <SectionCard title="Skills" icon="◆">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          placeholder="Type a skill and press Enter (e.g. React, Python, AWS…)"
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
        <button
          onClick={addSkill}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200"
          >
            {skill}
            <button
              onClick={() => removeSkill(i)}
              className="text-slate-500 hover:text-red-400 transition-colors leading-none"
            >
              ×
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-sm text-slate-600">No skills added yet.</p>
        )}
      </div>
    </SectionCard>
  );
}

// ── Main ResumeForm ───────────────────────────────────────────
export default function ResumeForm({
  resume,
  onUpdatePersonal,
  onUpdateExperience,
  onAddExperience,
  onRemoveExperience,
  onUpdateEducation,
  onAddEducation,
  onRemoveEducation,
  onUpdateSkills,
  onPreview,
}) {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Build Your Resume</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fill in your details and click <strong className="text-amber-400">✦ AI Enhance</strong> on any job role for instant bullet points
          </p>
        </div>
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-emerald-500/25"
        >
          ◉ Preview Resume →
        </button>
      </div>

      {/* Personal Info */}
      <PersonalSection personal={resume.personal} onUpdate={onUpdatePersonal} />

      {/* Experience */}
      <SectionCard
        title="Work Experience"
        icon="◈"
        action={
          <button
            onClick={onAddExperience}
            className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            + Add Role
          </button>
        }
      >
        <div className="space-y-4">
          {resume.experience.map((exp) => (
            <ExperienceEntry
              key={exp.id}
              exp={exp}
              onUpdate={(field, value) => onUpdateExperience(exp.id, field, value)}
              onRemove={() => onRemoveExperience(exp.id)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard
        title="Education"
        icon="◎"
        action={
          <button
            onClick={onAddEducation}
            className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            + Add Education
          </button>
        }
      >
        <div className="space-y-4">
          {resume.education.map((edu) => (
            <EducationEntry
              key={edu.id}
              edu={edu}
              onUpdate={(field, value) => onUpdateEducation(edu.id, field, value)}
              onRemove={() => onRemoveEducation(edu.id)}
            />
          ))}
        </div>
      </SectionCard>

      {/* Skills */}
      <SkillsSection skills={resume.skills} onUpdate={onUpdateSkills} />
    </div>
  );
}
