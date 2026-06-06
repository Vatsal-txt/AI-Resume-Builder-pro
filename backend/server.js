// ─────────────────────────────────────────────────────────────
// AI Resume Builder - Backend Server
// ─────────────────────────────────────────────────────────────

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "AI Resume Builder API is running ✅" });
});

// ── POST /enhance ─────────────────────────────────────────────
// Receives job description text, returns ATS-friendly bullet points
app.post("/enhance", async (req, res) => {
  const { text } = req.body;

  // Validate input
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Input text cannot be empty." });
  }

  // Check API key is configured
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "OpenRouter API key is not configured in .env" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",   // Required by OpenRouter
        "X-Title": "AI Resume Builder",             // Optional but recommended
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",  // Cost-effective model on OpenRouter
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume writer and career coach. Your job is to transform raw job descriptions into powerful, ATS-friendly resume bullet points. Always use strong action verbs, quantify achievements where possible, and keep bullets concise and impactful.",
          },
          {
            role: "user",
            content: `Rewrite this job role description into 4-5 professional, ATS-friendly resume bullet points:\n\n${text}\n\nReturn ONLY the bullet points as a numbered list (1. 2. 3. etc), no extra text.`,
          },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    // Handle non-OK HTTP responses from OpenRouter
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `OpenRouter returned status ${response.status}`;
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(500).json({ error: "No response generated. Please try again." });
    }

    // Parse numbered list into array of bullet strings
    const bullets = result
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0);

    res.json({ result, bullets });
  } catch (err) {
    console.error("OpenRouter API Error:", err.message);

    // User-friendly error messages
    if (err.message.includes("401")) {
      return res.status(401).json({ error: "Invalid API key. Check your OPENROUTER_API_KEY in .env" });
    }
    if (err.message.includes("429")) {
      return res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again." });
    }
    res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
});

// ── POST /enhance-resume ──────────────────────────────────────
// Receives full resume text, returns a fully rewritten enhanced version
app.post("/enhance-resume", async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || resumeText.trim().length === 0) {
    return res.status(400).json({ error: "Resume text cannot be empty." });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "OpenRouter API key is not configured in .env" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Resume Builder",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume writer and career coach. Your job is to take an existing resume and enhance it: use stronger action verbs, quantify achievements where possible, improve clarity and conciseness, ensure ATS-friendliness, and preserve all factual information. Do NOT invent new jobs, degrees, or skills. Return the full enhanced resume as plain text, preserving the original structure and sections.",
          },
          {
            role: "user",
            content: `Please enhance the following resume. Keep all the same sections and factual content, but improve the language, impact, and ATS compatibility:\n\n${resumeText}\n\nReturn the full enhanced resume as plain text only, no extra commentary.`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `OpenRouter returned status ${response.status}`;
      return res.status(response.status).json({ error: message });
    }

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content;

    if (!enhanced) {
      return res.status(500).json({ error: "No response generated. Please try again." });
    }

    res.json({ enhanced });
  } catch (err) {
    console.error("OpenRouter API Error:", err.message);
    if (err.message.includes("401")) {
      return res.status(401).json({ error: "Invalid API key. Check your OPENROUTER_API_KEY in .env" });
    }
    if (err.message.includes("429")) {
      return res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again." });
    }
    res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`   OpenRouter Key: ${process.env.OPENROUTER_API_KEY ? "✔ Found" : "✗ Missing — add to .env"}`);
});
