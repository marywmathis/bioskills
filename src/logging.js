// logging.js — sends usage events to the Netlify function
const STUDENT_CODE_KEY = "bioskills_student_code";

export function getStudentCode() {
  let code = localStorage.getItem(STUDENT_CODE_KEY);
  if (!code) {
    code = (prompt("Enter your course code (e.g., BS-2026-047):") || "").trim().toUpperCase();
    if (code) localStorage.setItem(STUDENT_CODE_KEY, code);
  }
  return code || "UNKNOWN";
}

export async function logEvent(module, event, detail = {}) {
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: getStudentCode(), module, event, detail })
    });
  } catch (e) {
    // Never let logging failures break the app for students.
    console.warn("log failed", e);
  }
}