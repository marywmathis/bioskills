// logging.js — sends usage events to the Netlify function
const STUDENT_CODE_KEY = "bioskills_student_code";
const DEVICE_KEY = "bioskills_device_id";

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

export function isValidCode(code) {
  return ALLOWED_CODES.has(normalize(code));
}

let cachedCode = null;

export function getStudentCode() {
  if (cachedCode) return cachedCode;
  const stored = normalize(localStorage.getItem(STUDENT_CODE_KEY));
  if (stored && isValidCode(stored)) {
    cachedCode = stored;
    return cachedCode;
  }
  if (stored) localStorage.removeItem(STUDENT_CODE_KEY);
  return "";
}

export function setStudentCode(code) {
  const c = normalize(code);
  if (!isValidCode(c)) return "";
  localStorage.setItem(STUDENT_CODE_KEY, c);
  cachedCode = c;
  return c;
}

export function clearStudentCode() {
  localStorage.removeItem(STUDENT_CODE_KEY);
  cachedCode = null;
}

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : "d-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export async function logEvent(module, event, detail = {}) {
  const code = getStudentCode();
  if (!code) return;
  try {
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, deviceId: getDeviceId(), module, event, detail })
    });
  } catch (e) {
    console.warn("log failed", e);
  }
}
