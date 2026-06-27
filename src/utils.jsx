// Shared utilities for BioSkills tools
// Import from here rather than redefining in each tool

import { useState } from 'react'

// ── Color system ──
export const C = {
  bg: "#f8f9fc",
  surface: "#ffffff",
  alt: "#f0f2f7",
  border: "#e2e6ef",
  teal: "#0099a8",
  tealSoft: "#e0f5f7",
  coral: "#e8452a",
  coralSoft: "#fdecea",
  amber: "#b87000",
  amberSoft: "#fef3e0",
  green: "#1a7a3e",
  greenSoft: "#e6f4ec",
  purple: "#6b3fcc",
  purpleSoft: "#f0ebfa",
  text: "#0f1117",
  dim: "#4a5268",
  muted: "#9aa0b4",
}

// ── Stat notation components ──
// Unicode combining diacritics (x̄, p̂) render inconsistently across browsers.
// Use these components everywhere instead.

export const XBar = ({ style }) => (
  <span style={{ display: 'inline-block', position: 'relative', ...style }}>
    <span style={{ position: 'absolute', top: '-0.45em', left: 0, right: 0, textAlign: 'center', fontSize: '0.7em', lineHeight: 1 }}>—</span>
    x
  </span>
)

export const PHat = ({ style }) => (
  <span style={{ display: 'inline-block', position: 'relative', ...style }}>
    <span style={{ position: 'absolute', top: '-0.5em', left: 0, right: 0, textAlign: 'center', fontSize: '0.75em', lineHeight: 1 }}>^</span>
    p
  </span>
)

// ── Shared style tokens ──
export const s = {
  page: { padding: '2rem 1.5rem 4rem', maxWidth: 760, margin: '0 auto' },
  pageTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 6 },
  pageSub: { fontSize: 15, color: C.dim, marginBottom: 32, lineHeight: 1.6 },
  section: { marginBottom: 12, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  sectionBtn: { width: '100%', background: 'none', border: 'none', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, textAlign: 'left', gap: 12 },
  sectionBtnLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  sectionIcon: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  chevron: { color: C.muted, fontSize: 12, transition: 'transform 0.2s', flexShrink: 0 },
  body: { padding: '0 20px 20px', borderTop: `1px solid ${C.border}` },
  concept: { marginBottom: 24, paddingTop: 20 },
  conceptTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: C.teal, marginBottom: 10 },
  prose: { fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 10 },
  formula: { background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.amber, marginBottom: 10 },
  example: { background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 },
  exampleLabel: { fontSize: 11, fontWeight: 600, color: C.teal, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 },
  quizWrap: { marginTop: 24, padding: '16px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` },
  quizTitle: { fontSize: 12, fontWeight: 600, color: C.amber, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 },
  quizQ: { fontSize: 14, color: C.text, marginBottom: 10, lineHeight: 1.6 },
  optionBtn: { display: 'block', width: '100%', textAlign: 'left', padding: '9px 13px', marginBottom: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, color: C.dim, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' },
  tag: { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, marginLeft: 8 },
}

// ── Shared components ──

export function Quiz({ q, options, answer, explain, wrongExplain }) {
  const [picked, setPicked] = useState(null)
  const done = picked !== null
  const correct = picked === answer
  const feedback = done ? (correct ? explain : (wrongExplain && wrongExplain[picked]) || explain) : null
  return (
    <div style={s.quizWrap}>
      <div style={s.quizTitle}>Quick check</div>
      <div style={s.quizQ}>{q}</div>
      {options.map((opt, i) => {
        let bg = C.surface, border = C.border, color = C.dim
        if (done) {
          if (i === answer) { bg = C.greenSoft; border = C.green; color = C.green }
          else if (i === picked) { bg = C.coralSoft; border = C.coral; color = C.coral }
        }
        return (
          <button key={i} style={{ ...s.optionBtn, background: bg, border: `1px solid ${border}`, color }}
            onClick={() => !done && setPicked(i)} disabled={done}>
            {opt}
            {done && i === answer && <span style={{ ...s.tag, background: C.greenSoft, color: C.green }}>✓ correct</span>}
            {done && i === picked && i !== answer && <span style={{ ...s.tag, background: C.coralSoft, color: C.coral }}>✗ not quite</span>}
          </button>
        )
      })}
      {done && (
        <div style={{ marginTop: 10, fontSize: 13, color: C.dim, lineHeight: 1.7, padding: '10px 12px', background: correct ? C.tealSoft : C.coralSoft, borderRadius: 7, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}` }}>
          {feedback}
        </div>
      )}
      {done && (
        <button style={{ ...s.optionBtn, marginTop: 8, marginBottom: 0, textAlign: 'center', color: C.teal, border: `1px solid rgba(0,153,168,0.3)` }}
          onClick={() => setPicked(null)}>Try again</button>
      )}
    </div>
  )
}

export function Section({ icon, iconBg, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={s.section}>
      <div
        style={{ ...s.sectionBtn, background: open ? C.alt : C.surface, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={s.sectionBtnLeft}>
          <span style={{ ...s.sectionIcon, background: iconBg }}>{icon}</span>
          {title}
        </span>
        <span style={{ ...s.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </div>
      {open && (
        <div style={s.body} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  )
}

export function Concept({ title, children }) {
  return (
    <div style={{ marginBottom: 24, paddingTop: 20 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: C.teal, marginBottom: 10 }}>◆ {title}</div>
      {children}
    </div>
  )
}
