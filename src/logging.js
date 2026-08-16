// logging.js — sends usage events to the Netlify function
const STUDENT_CODE_KEY = "bioskills_student_code";

// ---------------------------------------------------------------------------
// Allowed course codes. Only these are accepted; anything else is rejected.
// To add a student, add their code as a new line inside this list.
// Codes are compared case-insensitively and with surrounding spaces trimmed.
// ---------------------------------------------------------------------------
const ALLOWED_CODES = new Set([
  "TEST-001",
  "BS-2026-001", "BS-2026-002", "BS-2026-003", "BS-2026-004", "BS-2026-005",
  "BS-2026-006", "BS-2026-007", "BS-2026-008", "BS-2026-009", "BS-2026-010",
  "BS-2026-011", "BS-2026-012", "BS-2026-013", "BS-2026-014", "BS-2026-015",
  "BS-2026-016", "BS-2026-017", "BS-2026-018", "BS-2026-019", "BS-2026-020",
  "BS-2026-021", "BS-2026-022", "BS-2026-023", "BS-2026-024", "BS-2026-025",
  "BS-2026-026", "BS-2026-027", "BS-2026-028", "BS-2026-029", "BS-2026-030",
]);

function normalize(code) {
  return String(code || "").trim().toUpperCase();
}

function isValidCode(code) {
  return ALLOWED_CODES.has(normalize(code));
}

// Resolved once per page load so we never prompt repeatedly.
let cachedCode = null;

// Prompt until a valid code is entered, the user cancels, or attempts run out.
// Returns a valid, stored code, or null if none was provided.
function promptForValidCode() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const message = attempt === 0
      ? "Enter your course code (e.g., BS-2026-001):"
      : "That code was not recognized. Please check your code and try again (e.g., BS-2026-001):";
    const entered = normalize(prompt(message));
    if (!entered) return null; // cancelled or left blank
    if (isValidCode(entered)) {
      localStorage.setItem(STUDENT_CODE_KEY, entered);
      return entered;
    }
  }
  return null;
}

export function getStudentCode() {
  if (cachedCode) return cachedCode;

  const stored = normalize(localStorage.getItem(STUDENT_CODE_KEY));
  if (stored && isValidCode(stored)) {
    cachedCode = stored;
    return cachedCode;
  }

  // Option B: a stored code not on the allow-list is purged, then re-prompted.
  if (stored) localStorage.removeItem(STUDENT_CODE_KEY);

  cachedCode = promptForValidCode() || "UNKNOWN";
  return cachedCode;
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

export function changeStudentCode() {
  const result = promptForValidCode();
  if (result) {
    cachedCode = result;
    return result;
  }
  // Cancelled or invalid: keep whatever valid code was already in effect.
  return getStudentCode();
}