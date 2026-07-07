import { useState, useMemo } from 'react'
import { C, s, Section, Concept, Quiz } from './utils'

// ── Shared slider ──
function Slider({ label, value, min, max, step, onChange, fmt }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: C.teal, cursor: 'pointer' }} />
    </div>
  )
}

// ── Complement ──
function ComplementSim() {
  const [pA, setPA] = useState(0.30)
  const pNot = +(1 - pA).toFixed(2)
  const examples = [
    { a: 'has hypertension', nota: 'does not have hypertension' },
    { a: 'vaccine fails', nota: 'vaccine works' },
    { a: 'tests positive', nota: 'tests negative' },
  ]
  const [ex, setEx] = useState(0)
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {examples.map((e, i) => (
          <button key={i} onClick={() => setEx(i)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
            background: ex === i ? C.tealSoft : C.surface,
            border: `1px solid ${ex === i ? C.teal : C.border}`,
            color: ex === i ? C.teal : C.dim, fontWeight: ex === i ? 600 : 400,
          }}>Example {i + 1}</button>
        ))}
      </div>
      <Slider label={`P(patient ${examples[ex].a})`} value={pA} min={0} max={1} step={0.01} onChange={setPA} fmt={v => v.toFixed(2)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
        <div style={{ padding: '12px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>P(patient {examples[ex].a})</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}>{pA.toFixed(2)}</div>
        </div>
        <div style={{ padding: '12px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>P(patient {examples[ex].nota})</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.coral, fontFamily: "'JetBrains Mono', monospace" }}>{pNot.toFixed(2)}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, padding: '8px 12px', background: C.alt, borderRadius: 7, border: `1px solid ${C.border}`, fontSize: 13, color: C.dim, textAlign: 'center' }}>
        {pA.toFixed(2)} + {pNot.toFixed(2)} = <strong style={{ color: C.text }}>1.00</strong> — probabilities of all possible outcomes always sum to 1.
      </div>
    </div>
  )
}

// ── Venn Diagram SVG ──
function VennDiagram({ pA, pB, pAB, mutExcl }) {
  const W = 340, H = 190
  const cy = H / 2 - 8
  const PAD = 16

  const rA = 30 + pA * 42
  const rB = 30 + pB * 42
  const minTouchDist = rA + rB
  const maxOverlapDist = Math.abs(rA - rB) + 4

  let dist
  if (mutExcl) {
    dist = rA + rB + 18
  } else {
    const overlapFraction = Math.min(pAB / Math.max(Math.min(pA, pB), 0.01), 1)
    dist = minTouchDist - overlapFraction * (minTouchDist - maxOverlapDist - 8)
    dist = Math.max(maxOverlapDist + 4, Math.min(minTouchDist - 1, dist))
  }

  const cx1 = W / 2 - dist / 2
  const cx2 = W / 2 + dist / 2
  const union = +(pA + pB - (mutExcl ? 0 : pAB)).toFixed(2)

  // Clip paths for intersection shading
  const clipId1 = "venn-clip-a"
  const clipId2 = "venn-clip-b"

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center', marginBottom: 4 }}>
        Conceptual Venn Diagram
      </div>
      <svg width={W} height={H} style={{ display: 'block', margin: '0 auto', transition: 'all 0.4s ease' }}>
        {/* Sample space rectangle */}
        <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2 - 24} fill={C.alt} rx={8} stroke={C.border} strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={W - PAD - 6} y={PAD + 13} textAnchor="end" fontSize={9} fill={C.muted} fontWeight="600">Sample Space (all patients)</text>

        {/* Clip path for B — used to shade intersection */}
        <defs>
          <clipPath id={clipId1}>
            <circle cx={cx1} cy={cy} r={rA} />
          </clipPath>
          <clipPath id={clipId2}>
            <circle cx={cx2} cy={cy} r={rB} />
          </clipPath>
        </defs>

        {/* Circle A fill */}
        <circle cx={cx1} cy={cy} r={rA} fill={C.teal} fillOpacity={0.18} stroke={C.teal} strokeWidth={2}
          style={{ transition: 'cx 0.4s ease, r 0.4s ease' }} />
        {/* Circle B fill */}
        <circle cx={cx2} cy={cy} r={rB} fill={C.purple} fillOpacity={0.18} stroke={C.purple} strokeWidth={2}
          style={{ transition: 'cx 0.4s ease, r 0.4s ease' }} />

        {/* Intersection — circle B clipped to circle A's region = darker overlap */}
        {!mutExcl && pAB > 0.01 && (
          <circle cx={cx2} cy={cy} r={rB} fill={C.teal} fillOpacity={0.35}
            clipPath={`url(#${clipId1})`}
            style={{ transition: 'cx 0.4s ease' }} />
        )}

        {/* Labels */}
        <text x={Math.max(PAD + 14, cx1 - rA * 0.5)} y={cy + 4} textAnchor="middle" fontSize={14} fill={C.teal} fontWeight="700">A</text>
        <text x={Math.min(W - PAD - 14, cx2 + rB * 0.5)} y={cy + 4} textAnchor="middle" fontSize={14} fill={C.purple} fontWeight="700">B</text>

        {!mutExcl && pAB > 0.03 && (
          <text x={(cx1 + cx2) / 2} y={cy + 4} textAnchor="middle" fontSize={9} fill={C.dim} fontWeight="600">A∩B</text>
        )}

        {/* Result */}
        <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={12} fill={C.amber} fontWeight="700">
          P(A∪B) = {union}
        </text>
      </svg>
    </div>
  )
}

// ── Addition Rule ──
function AdditionSim() {
  const [pA, setPA] = useState(0.40)
  const [pB, setPB] = useState(0.30)
  const [pAB, setPAB] = useState(0.10)
  const [mutExcl, setMutExcl] = useState(false)

  const overlap = mutExcl ? 0 : Math.min(pAB, pA, pB)
  const union = +(pA + pB - overlap).toFixed(2)
  const maxOverlap = +Math.min(pA, pB).toFixed(2)
  const unionInvalid = union > 1
  const overlapInvalid = !mutExcl && pAB > Math.min(pA, pB) + 0.001

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => setMutExcl(m => !m)} style={{
          padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
          background: mutExcl ? C.coralSoft : C.surface,
          border: `1px solid ${mutExcl ? C.coral : C.border}`,
          color: mutExcl ? C.coral : C.dim, fontWeight: 600,
          transition: 'all 0.2s',
        }}>
          Mutually Exclusive: {mutExcl ? 'ON' : 'OFF'}
        </button>
      </div>

      <VennDiagram pA={pA} pB={pB} pAB={pAB} mutExcl={mutExcl} />

      <div style={{ margin: '14px 0 10px', padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.amber, textAlign: 'center', transition: 'all 0.3s' }}>
        {mutExcl
          ? `P(A ∪ B) = P(A) + P(B) = ${pA.toFixed(2)} + ${pB.toFixed(2)} = ${(pA + pB).toFixed(2)}`
          : `P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = ${pA.toFixed(2)} + ${pB.toFixed(2)} − ${overlap.toFixed(2)} = ${union}`
        }
      </div>

      {mutExcl && (
        <div style={{ padding: '8px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 7, fontSize: 12, color: C.coral, marginBottom: 10 }}>
          When events are mutually exclusive, they cannot both occur — the circles separate completely. No overlap means no double-counting, so we don't subtract anything.
        </div>
      )}

      {overlapInvalid && (
        <div style={{ padding: '8px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 7, fontSize: 12, color: C.coral, marginBottom: 10 }}>
          ⚠ P(A ∩ B) cannot exceed either P(A) or P(B). The overlap is being capped at {maxOverlap.toFixed(2)}.
        </div>
      )}

      {unionInvalid && (
        <div style={{ padding: '8px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 7, fontSize: 12, color: C.coral, marginBottom: 10 }}>
          ⚠ P(A ∪ B) = {union} exceeds 1.0 — an impossible probability. Reduce P(A), P(B), or increase P(A ∩ B).
        </div>
      )}

      <Slider label="P(A) — e.g., probability of hypertension" value={pA} min={0.01} max={0.99} step={0.01} onChange={v => { setPA(v); if (!mutExcl && pAB > Math.min(v, pB)) setPAB(+Math.min(v, pB).toFixed(2)) }} fmt={v => v.toFixed(2)} />
      <Slider label="P(B) — e.g., probability of diabetes" value={pB} min={0.01} max={0.99} step={0.01} onChange={v => { setPB(v); if (!mutExcl && pAB > Math.min(pA, v)) setPAB(+Math.min(pA, v).toFixed(2)) }} fmt={v => v.toFixed(2)} />
      {!mutExcl && (
        <Slider label="P(A ∩ B) — probability of both" value={pAB} min={0} max={maxOverlap} step={0.01} onChange={setPAB} fmt={v => v.toFixed(2)} />
      )}

      <div style={{ ...s.example, marginTop: 12 }}>
        <div style={s.exampleLabel}>Public health reading</div>
        In this screened population, {(pA * 100).toFixed(0)}% of patients have hypertension, {(pB * 100).toFixed(0)}% have diabetes
        {!mutExcl ? `, and ${(overlap * 100).toFixed(0)}% have both — so those patients would be counted twice if we simply added the percentages` : ', and these conditions cannot occur in the same patient (mutually exclusive)'}. Therefore, the probability that a randomly selected patient has hypertension or diabetes is <strong style={{ color: C.text }}>{(union * 100).toFixed(0)}%</strong>.
      </div>

      {!unionInvalid && !overlapInvalid && (
        <div style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ ...s.exampleLabel, padding: '10px 12px 2px', marginBottom: 0 }}>Reading each region</div>
          {[
            { dot: C.teal, name: 'Hypertension only', note: 'has hypertension, not diabetes', val: pA - overlap },
            { dot: C.purple, name: 'Diabetes only', note: 'has diabetes, not hypertension', val: pB - overlap },
            { dot: C.amber, name: 'Both', note: 'has hypertension and diabetes', val: overlap },
            { dot: C.muted, name: 'Neither', note: 'has neither condition', val: 1 - union },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderTop: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: r.dot, flexShrink: 0 }} />
              <span style={{ color: C.text, fontWeight: 600, minWidth: 128 }}>{r.name}</span>
              <span style={{ color: C.dim, flex: 1 }}>{r.note}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.text, fontWeight: 600 }}>{(r.val * 100).toFixed(0)}%</span>
            </div>
          ))}
          <div style={{ padding: '8px 12px', borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            Of every 100 patients: {((pA - overlap) * 100).toFixed(0)} have hypertension only, {((pB - overlap) * 100).toFixed(0)} diabetes only, {(overlap * 100).toFixed(0)} both, and {((1 - union) * 100).toFixed(0)} neither. These four groups don't overlap and cover everyone — they add to 100%.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Multiplication Rule ──
function MultiplicationSim() {
  const [tab, setTab] = useState('independent')
  const [p1, setP1] = useState(0.20)
  const [p2, setP2] = useState(0.20)
  const [N, setN] = useState(20)
  const [drawn, setDrawn] = useState(4)

  const jointIndep = +(p1 * p2).toFixed(4)
  // Dependent: drawing without replacement from small group
  const diseased = drawn
  const healthy = N - drawn
  const p1dep = +(drawn / N).toFixed(3)
  const p2dep = drawn > 1 ? +((drawn - 1) / (N - 1)).toFixed(3) : 0
  const jointDep = +(p1dep * p2dep).toFixed(4)

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {[{ id: 'independent', label: 'Independent Events' }, { id: 'dependent', label: 'Dependent Events' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            background: tab === t.id ? C.teal : C.surface,
            color: tab === t.id ? '#fff' : C.dim,
            borderRight: t.id === 'independent' ? `1px solid ${C.border}` : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'independent' && (
        <div>
          <div style={{ padding: '12px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 6 }}>Independent events</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              Two events are independent when knowing one occurred tells you nothing about whether the other occurred. For independent events: <strong style={{ color: C.text }}>P(A and B) = P(A) × P(B)</strong>.
            </div>
          </div>
          <Slider label="P(Patient 1 responds to treatment)" value={p1} min={0.01} max={0.99} step={0.01} onChange={setP1} fmt={v => v.toFixed(2)} />
          <Slider label="P(Patient 2 responds to treatment)" value={p2} min={0.01} max={0.99} step={0.01} onChange={setP2} fmt={v => v.toFixed(2)} />
          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.amber, marginTop: 8 }}>
            P(both respond) = {p1.toFixed(2)} × {p2.toFixed(2)} = {jointIndep}
          </div>
          <div style={{ ...s.example, marginTop: 10 }}>
            <div style={s.exampleLabel}>Why multiply?</div>
            Think of it as sequential filtering. Out of all patients, {(p1 * 100).toFixed(0)}% respond. Of those, {(p2 * 100).toFixed(0)}% would be paired with another responder. Multiplying gives you the fraction of all possible pairs where both respond: {(jointIndep * 100).toFixed(1)}%.
          </div>
        </div>
      )}

      {tab === 'dependent' && (
        <div>
          <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 6 }}>Dependent events</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              Events are dependent when one outcome affects the probability of the other. The classic example: selecting people from a small group <em>without replacement</em>. Once someone is selected, the group changes.
            </div>
          </div>
          <Slider label="Total patients in clinic" value={N} min={5} max={50} step={1} onChange={v => { setN(v); if (drawn >= v) setDrawn(v - 1) }} fmt={v => v} />
          <Slider label="Patients with disease" value={drawn} min={1} max={N - 1} step={1} onChange={setDrawn} fmt={v => v} />
          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.amber, marginTop: 8, lineHeight: 1.8 }}>
            {`P(1st patient has disease) = ${drawn}/${N} = ${p1dep}`}{'\n'}
            {`P(2nd patient has disease | 1st did) = ${drawn - 1}/${N - 1} = ${p2dep}`}{'\n'}
            {`P(both have disease) = ${p1dep} × ${p2dep} = ${jointDep}`}
          </div>
          <div style={{ ...s.example, marginTop: 10 }}>
            <div style={s.exampleLabel}>Why it changes</div>
            After selecting one diseased patient, there are only {drawn - 1} diseased patients left in a group of {N - 1}. The denominator changed — which is why the second probability is different from the first. You cannot simply square P(disease) here.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Conditional Probability dot grid ──
const GRID_COLS = 40
const GRID_ROWS = 25
const TOTAL = 1000
const N_DISEASE = 100
const N_HEALTHY = 900
const N_TP = 80
const N_FP = 60
const N_TOTAL_POS = N_TP + N_FP  // 140

function buildPatients() {
  const pts = []
  for (let i = 0; i < TOTAL; i++) {
    const disease = i < N_DISEASE
    const positive = disease ? i < N_TP : (i >= N_DISEASE && i < N_DISEASE + N_FP)
    pts.push({ id: i, disease, positive })
  }
  const shuffled = [...pts]
  let seed = 42
  function rand() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff }
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const PATIENTS = buildPatients()
const POS_PATIENTS = PATIENTS.filter(p => p.positive)

function ConditionalSim() {
  const [stage, setStage] = useState(0)
  const [rearranged, setRearranged] = useState(false)
  const [reflectPick, setReflectPick] = useState(null)

  const DOT = 7, GAP = 2
  const fullW = GRID_COLS * (DOT + GAP)
  const fullH = GRID_ROWS * (DOT + GAP)
  const R_COLS = 14, R_ROWS = 10
  const rW = R_COLS * (DOT + GAP)
  const rH = R_ROWS * (DOT + GAP)

  // Auto-compress when reaching stage 3
  const handleStage = (i) => {
    setStage(i)
    setRearranged(false)
    setReflectPick(null)
    if (i === 3) {
      setTimeout(() => setRearranged(true), 1000)
    }
  }

  function dotFill(p) {
    // red = disease, gray = healthy
    return p.disease ? '#e8452a' : '#94a3b8'
  }

  function dotOpacity(p) {
    if (stage >= 3 && !p.positive) return 0.10
    if (stage === 1) return p.disease ? 1 : 0.25
    if (stage === 2) return p.positive ? 1 : 0.25
    return 1
  }

  function dotStroke(p) {
    // blue ring = positive test
    if (stage >= 2 && p.positive) return { stroke: '#3b82f6', strokeWidth: 1.8 }
    return {}
  }

  const stages = [
    { id: 0, label: '1. All 1,000 patients', short: 'All patients' },
    { id: 1, label: '2. Show disease status', short: 'Disease status' },
    { id: 2, label: '3. Show test results', short: 'Test results' },
    { id: 3, label: '4. Among Patients Who Tested Positive', short: 'Focus on positives' },
    { id: 4, label: '5. Conditional probability', short: 'P(Disease | Positive)' },
  ]

  return (
    <div>
      {/* Stage buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {stages.map((st) => (
          <button key={st.id} onClick={() => handleStage(st.id)}
            style={{
              padding: '5px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
              background: stage === st.id ? C.teal : C.surface,
              border: `1px solid ${stage === st.id ? C.teal : C.border}`,
              color: stage === st.id ? '#fff' : C.dim, fontWeight: stage === st.id ? 600 : 400,
            }}>
            {st.short}
          </button>
        ))}
      </div>

      {/* Stage heading */}
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: C.teal, marginBottom: 8 }}>
        {stages[stage].label}
        {stage === 3 && <span style={{ display: 'block', fontSize: 12, color: C.dim, fontWeight: 400, fontFamily: 'inherit', marginTop: 2 }}>Conditional probability — restricting to a subgroup</span>}
      </div>

      {/* Question banner */}
      {stage === 1 && (
        <div style={{ padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, marginBottom: 12, fontSize: 14, color: C.amber, fontWeight: 600 }}>
          What is P(Disease)?
          <span style={{ marginLeft: 12, color: C.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>→ {N_DISEASE}/{TOTAL} = 0.10</span>
        </div>
      )}
      {stage === 2 && (
        <div style={{ padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, marginBottom: 12, fontSize: 14, color: C.amber, fontWeight: 600 }}>
          What is P(Positive Test)?
          <span style={{ marginLeft: 12, color: C.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>→ {N_TOTAL_POS}/{TOTAL} = 0.14</span>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10, fontSize: 12, color: C.dim, flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#e8452a', marginRight: 4, verticalAlign: 'middle' }} />Disease</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#94a3b8', marginRight: 4, verticalAlign: 'middle' }} />Healthy</span>
        {stage >= 2 && <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'transparent', border: '2px solid #3b82f6', marginRight: 4, verticalAlign: 'middle' }} />Positive test (blue ring)</span>}
      </div>

      {/* Dot grid */}
      <div style={{ background: C.alt, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, overflowX: 'auto', marginBottom: 12, transition: 'all 0.4s' }}>
        {!rearranged ? (
          <svg width={fullW} height={fullH} style={{ display: 'block' }}>
            {PATIENTS.map((p, i) => {
              const col = i % GRID_COLS
              const row = Math.floor(i / GRID_COLS)
              const x = col * (DOT + GAP) + DOT / 2
              const y = row * (DOT + GAP) + DOT / 2
              const stroke = dotStroke(p)
              return (
                <circle key={p.id} cx={x} cy={y} r={DOT / 2}
                  fill={dotFill(p)} fillOpacity={dotOpacity(p)}
                  stroke={stroke.stroke || 'none'} strokeWidth={stroke.strokeWidth || 0}
                />
              )
            })}
          </svg>
        ) : (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.teal, marginBottom: 8 }}>
              140 patients who tested positive — {N_TP} with disease (red), {N_FP} healthy (gray)
            </div>
            <svg width={rW} height={rH} style={{ display: 'block' }}>
              {POS_PATIENTS.map((p, i) => {
                const col = i % R_COLS
                const row = Math.floor(i / R_COLS)
                const x = col * (DOT + GAP) + DOT / 2
                const y = row * (DOT + GAP) + DOT / 2
                return (
                  <circle key={p.id} cx={x} cy={y} r={DOT / 2}
                    fill={stage >= 4 && p.disease ? '#e8452a' : p.disease ? '#e8452a' : '#94a3b8'}
                    stroke="#3b82f6" strokeWidth={1.5}
                  />
                )
              })}
            </svg>
            <div style={{ marginTop: 10, padding: '10px 12px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.65, fontStyle: 'italic' }}>
              We are no longer asking about all 1,000 patients. We are now asking about only the <strong style={{ color: C.purple }}>140 patients who tested positive</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Rearrange button */}
      {stage >= 3 && (
        <button onClick={() => setRearranged(r => !r)} style={{
          padding: '8px 18px', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          background: rearranged ? C.tealSoft : C.surface,
          border: `1px solid ${rearranged ? C.teal : C.border}`,
          color: rearranged ? C.teal : C.dim, fontWeight: 600, marginBottom: 14,
        }}>
          {rearranged ? '← Show full population' : 'Compress to positive tests only →'}
        </button>
      )}

      {/* Stage 4: formula reveal */}
      {stage >= 4 && (
        <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>What just happened?</div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7, marginBottom: 10 }}>
            Among the <strong>140 patients</strong> with positive tests, <strong style={{ color: '#e8452a' }}>80 truly have disease</strong>.
            <br />Probability = 80 ÷ 140 = <strong style={{ color: C.purple }}>57.1%</strong>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.purple, background: 'rgba(255,255,255,0.6)', padding: '8px 12px', borderRadius: 6, marginBottom: 10 }}>
            P(Disease | Positive) = P(Disease ∩ Positive) / P(Positive){'\n'}
            = (80/1000) / (140/1000) = 80/140 = 0.571
          </div>
          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.text }}>You didn't change the numerator — you changed the denominator.</strong> Instead of dividing by 1,000 (all patients), you divided by 140 (only positive tests). That's what conditional probability does: it restricts the reference group.
          </div>
        </div>
      )}

      {/* Summary table */}
      <div style={{ marginTop: 14, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: C.alt, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span></span><span style={{ color: '#e8452a' }}>Disease +</span><span style={{ color: '#94a3b8' }}>Disease −</span><span>Total</span>
        </div>
        {[
          { label: 'Test +', d: N_TP, h: N_FP, t: N_TOTAL_POS, highlight: stage >= 3 },
          { label: 'Test −', d: N_DISEASE - N_TP, h: N_HEALTHY - N_FP, t: TOTAL - N_TOTAL_POS, highlight: false },
          { label: 'Total', d: N_DISEASE, h: N_HEALTHY, t: TOTAL, bold: true, highlight: false },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
            padding: '8px 12px', borderTop: `1px solid ${C.border}`,
            fontSize: 13, fontWeight: row.bold ? 700 : 400,
            background: row.highlight ? 'rgba(107,63,204,0.08)' : (i % 2 === 0 ? C.surface : C.alt),
            borderLeft: row.highlight ? `3px solid ${C.purple}` : 'none',
          }}>
            <span style={{ color: C.dim }}>{row.label}{row.highlight && <span style={{ marginLeft: 6, fontSize: 10, color: C.purple, fontWeight: 700 }}>← denominator</span>}</span>
            <span style={{ color: '#e8452a' }}>{row.d}</span>
            <span style={{ color: '#94a3b8' }}>{row.h}</span>
            <span style={{ color: C.text }}>{row.t}</span>
          </div>
        ))}
      </div>

      {/* Reflection question */}
      {stage >= 4 && (
        <div style={{ marginTop: 20, padding: '16px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Reflection</div>
          <div style={{ fontSize: 14, color: C.text, marginBottom: 12, lineHeight: 1.6 }}>
            When we calculated P(Disease | Positive Test) instead of P(Disease), what changed?
          </div>
          {[
            { label: 'The numerator changed.', val: 0 },
            { label: 'The denominator changed.', val: 1 },
            { label: 'Both changed.', val: 2 },
            { label: 'Nothing changed.', val: 3 },
          ].map(opt => {
            const isCorrect = opt.val === 1
            let bg = C.surface, border = C.border, color = C.dim
            if (reflectPick !== null) {
              if (isCorrect) { bg = C.greenSoft; border = C.green; color = C.green }
              else if (opt.val === reflectPick) { bg = C.coralSoft; border = C.coral; color = C.coral }
            }
            return (
              <button key={opt.val} onClick={() => reflectPick === null && setReflectPick(opt.val)}
                disabled={reflectPick !== null}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 13px', marginBottom: 6, background: bg, border: `1px solid ${border}`, borderRadius: 7, color, fontSize: 13, cursor: reflectPick !== null ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {opt.label}
                {reflectPick !== null && isCorrect && <span style={{ float: 'right', fontSize: 11, fontWeight: 700, background: C.greenSoft, color: C.green, padding: '1px 7px', borderRadius: 4 }}>✓ correct</span>}
                {reflectPick !== null && opt.val === reflectPick && !isCorrect && <span style={{ float: 'right', fontSize: 11, fontWeight: 700, background: C.coralSoft, color: C.coral, padding: '1px 7px', borderRadius: 4 }}>✗</span>}
              </button>
            )
          })}
          {reflectPick !== null && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: reflectPick === 1 ? C.tealSoft : C.coralSoft, borderRadius: 7, border: `1px solid ${reflectPick === 1 ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              {reflectPick === 1
                ? <><strong style={{ color: C.teal }}>Correct.</strong> The numerator stayed 80 (patients with disease who tested positive). The denominator changed from 1,000 (all patients) to 140 (only positive tests). Restricting the denominator to a subgroup is the essence of conditional probability.</>
                : reflectPick === 0
                ? <><strong style={{ color: C.coral }}>Not quite.</strong> The numerator — 80 patients with disease who tested positive — didn't change. What changed was the denominator: from 1,000 patients total to 140 patients who tested positive.</>
                : reflectPick === 2
                ? <><strong style={{ color: C.coral }}>Not quite.</strong> The numerator stayed 80. Only the denominator changed — from 1,000 (all patients) to 140 (positive tests only). That's the key move in conditional probability.</>
                : <><strong style={{ color: C.coral }}>Not quite.</strong> Something did change — the denominator. When we condition on a positive test, we restrict our reference group from all 1,000 patients to only the 140 who tested positive.</>
              }
            </div>
          )}
          {reflectPick !== null && (
            <button onClick={() => setReflectPick(null)} style={{ marginTop: 8, width: '100%', padding: '7px 0', background: 'none', border: `1px solid rgba(0,153,168,0.3)`, borderRadius: 7, color: C.teal, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Try again</button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Rule Selector Challenge ──
const RULE_SCENARIOS = [
  {
    q: "What is the probability a patient has asthma OR COPD?",
    options: ['Addition Rule', 'Multiplication Rule', 'Complement Rule', 'Conditional Probability'],
    answer: 0,
    explain: "You're combining two events with 'or.' That signals the Addition Rule: P(Asthma ∪ COPD) = P(Asthma) + P(COPD) − P(both).",
    wrong: {
      1: "Multiplication applies to 'and' — both events occurring together. 'Or' means at least one occurs → Addition Rule.",
      2: "The complement gives you the probability something does NOT happen. Here you want the probability of one thing or another → Addition Rule.",
      3: "Conditional probability restricts to a subgroup ('given that...'). No subgroup restriction here → Addition Rule.",
    }
  },
  {
    q: "A patient tests positive for HIV. What is the probability they actually have HIV?",
    options: ['Addition Rule', 'Multiplication Rule', 'Complement Rule', 'Conditional Probability'],
    answer: 3,
    explain: "You're told something already happened (positive test) and want the probability of disease given that fact. That's the defining structure of conditional probability: P(Disease | Positive Test).",
    wrong: {
      0: "Addition combines 'A or B.' Here you're restricting to a subgroup (positive tests only) and asking about disease within that group → Conditional Probability.",
      1: "Multiplication gives joint probability — both events occurring. Here you're told the test result is already known and want to find disease probability within that group → Conditional Probability.",
      2: "Complement gives the probability of the opposite event. You're not looking for the opposite — you're conditioning on a known result → Conditional Probability.",
    }
  },
  {
    q: "If P(adverse reaction) = 0.05, what is the probability a patient does NOT have an adverse reaction?",
    options: ['Addition Rule', 'Multiplication Rule', 'Complement Rule', 'Conditional Probability'],
    answer: 2,
    explain: "You want the probability of the opposite event. Complement Rule: P(no reaction) = 1 − P(reaction) = 1 − 0.05 = 0.95.",
    wrong: {
      0: "Addition combines two events with 'or.' You only have one event here and want its opposite → Complement Rule.",
      1: "Multiplication combines two events occurring together. You only have one event and want its opposite → Complement Rule.",
      3: "Conditional probability requires a known condition ('given that...'). No condition is stated here → Complement Rule.",
    }
  },
  {
    q: "Two patients are independently selected. What is the probability both are vaccinated, if 70% of the population is vaccinated?",
    options: ['Addition Rule', 'Multiplication Rule', 'Complement Rule', 'Conditional Probability'],
    answer: 1,
    explain: "You want both events to occur, and they're independent (one selection doesn't affect the other). Multiplication Rule: P(both vaccinated) = 0.70 × 0.70 = 0.49.",
    wrong: {
      0: "Addition handles 'or' — at least one event. You want both events → Multiplication Rule.",
      2: "Complement gives the opposite of one event. You want two events both occurring → Multiplication Rule.",
      3: "No condition is stated ('given that...'). You're calculating a joint probability for two independent events → Multiplication Rule.",
    }
  },
  {
    q: "In a population, 30% have high cholesterol. What is the probability a randomly selected patient does NOT have high cholesterol?",
    options: ['Addition Rule', 'Multiplication Rule', 'Complement Rule', 'Conditional Probability'],
    answer: 2,
    explain: "You want the opposite of a single event: 1 − 0.30 = 0.70. That's the Complement Rule.",
    wrong: {
      0: "Addition combines 'A or B.' You only have one event and want its opposite → Complement Rule.",
      1: "Multiplication combines two joint events. You have one event and want its opposite → Complement Rule.",
      3: "No condition ('given that...') is stated. You want the opposite of one probability → Complement Rule.",
    }
  },
]

function RuleSelector() {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const sc = RULE_SCENARIOS[idx]
  const answered = picked !== null
  const correct = picked === sc?.answer

  function handlePick(i) {
    if (answered) return
    setPicked(i)
    if (i === sc.answer) setScore(s => s + 1)
  }

  function handleNext() {
    if (idx < RULE_SCENARIOS.length - 1) { setIdx(i => i + 1); setPicked(null) }
    else setDone(true)
  }

  if (done) {
    const pct = Math.round((score / RULE_SCENARIOS.length) * 100)
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: pct >= 80 ? C.green : pct >= 60 ? C.amber : C.coral, fontFamily: "'Space Grotesk', sans-serif" }}>{score}/{RULE_SCENARIOS.length}</div>
        <div style={{ fontSize: 15, color: C.dim, marginTop: 6, marginBottom: 20 }}>
          {pct >= 80 ? 'Rule recognition is solid.' : pct >= 60 ? 'Almost there. Review the ones you missed.' : 'Focus on identifying "or," "and," "not," and "given that" in scenario wording.'}
        </div>
        <button onClick={() => { setIdx(0); setPicked(null); setScore(0); setDone(false) }}
          style={{ padding: '10px 24px', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 8 }}>
        <span>Scenario {idx + 1} of {RULE_SCENARIOS.length}</span>
        <span>Score: <strong style={{ color: C.text }}>{score}</strong></span>
      </div>
      <div style={{ height: 4, background: C.alt, borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: '100%', width: `${(idx / RULE_SCENARIOS.length) * 100}%`, background: C.teal, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      <div style={{ background: C.alt, borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Which probability rule applies?</div>
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.6 }}>{sc.q}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {sc.options.map((opt, i) => {
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (i === sc.answer) { bg = C.greenSoft; border = C.green; color = C.green }
            else if (i === picked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={i} onClick={() => handlePick(i)} disabled={answered}
              style={{ padding: '10px 12px', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
              {opt}
              {answered && i === sc.answer && ' ✓'}
              {answered && i === picked && i !== sc.answer && ' ✗'}
            </button>
          )
        })}
      </div>
      {answered && (
        <div>
          <div style={{ padding: '12px 14px', background: correct ? C.tealSoft : C.coralSoft, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
            {correct
              ? <><strong style={{ color: C.teal }}>Correct.</strong> {sc.explain}</>
              : <><strong style={{ color: C.coral }}>Not quite.</strong> {sc.wrong[picked]}</>
            }
          </div>
          <button onClick={handleNext}
            style={{ width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {idx < RULE_SCENARIOS.length - 1 ? 'Next scenario →' : 'See results'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Putting it together ──
const COMBO_Q = [
  {
    scenario: "A clinic reports: 20% of patients have hypertension, 15% have diabetes, 8% have both.",
    q: "What is the probability a randomly selected patient has hypertension OR diabetes?",
    rule: "Addition Rule",
    answer: "P(H ∪ D) = 0.20 + 0.15 − 0.08 = 0.27 (27%)",
    color: C.teal,
  },
  {
    scenario: "Same clinic.",
    q: "What is the probability a patient does NOT have hypertension?",
    rule: "Complement Rule",
    answer: "P(H') = 1 − 0.20 = 0.80 (80%)",
    color: C.coral,
  },
  {
    scenario: "Same clinic.",
    q: "What is the probability a patient has hypertension GIVEN they have diabetes?",
    rule: "Conditional Probability",
    answer: "P(H|D) = P(H ∩ D) / P(D) = 0.08 / 0.15 = 0.533 (53.3%)",
    color: C.purple,
  },
  {
    scenario: "40% of vaccinated patients experience a mild sore arm. Two vaccinated patients are selected independently.",
    q: "What is the probability BOTH experience a sore arm?",
    rule: "Multiplication Rule (independent)",
    answer: "P(both) = 0.40 × 0.40 = 0.16 (16%)",
    color: C.amber,
  },
]

function PuttingItTogether() {
  const [revealed, setRevealed] = useState({})
  return (
    <div>
      <p style={s.prose}>The first step in any probability problem is identifying which rule applies. Read each question and decide — then reveal the answer.</p>
      {COMBO_Q.map((item, i) => (
        <div key={i} style={{ marginBottom: 12, padding: '14px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.rule}</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontStyle: 'italic' }}>{item.scenario}</div>
          <div style={{ fontSize: 14, color: C.text, marginBottom: 10, lineHeight: 1.6 }}>{item.q}</div>
          {revealed[i]
            ? <div style={{ padding: '8px 12px', background: item.color === C.teal ? C.tealSoft : item.color === C.coral ? C.coralSoft : item.color === C.purple ? C.purpleSoft : C.amberSoft, borderRadius: 7, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: item.color }}>{item.answer}</div>
            : <button onClick={() => setRevealed(r => ({ ...r, [i]: true }))} style={{ padding: '7px 16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, color: C.dim, cursor: 'pointer', fontFamily: 'inherit' }}>Reveal answer</button>
          }
        </div>
      ))}
    </div>
  )
}

// ── Main export ──
export default function ProbabilityRules() {
  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Probability Rules</div>
      <div style={s.pageSub}>
        Probability is the language of uncertainty — and uncertainty is at the heart of every statistical conclusion you will make.
      </div>

      {/* Why it matters */}
      <Section icon="?" iconBg={C.tealSoft} title="Why Probability Matters in Biostatistics" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>You already understand the idea of chance. Probability gives it a number. Here's why it shows up everywhere in biostatistics:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
            {[
              { q: 'How likely is a disease?', note: 'Prevalence and incidence are probabilities.' },
              { q: 'How likely is a positive test result?', note: 'Sensitivity, specificity, and predictive values are all conditional probabilities.' },
              { q: 'How likely is it that our results happened by chance?', note: 'The p-value is a probability.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 14px', background: C.alt, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <span style={{ color: C.teal, fontWeight: 700, flexShrink: 0 }}>→</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{item.q}</div>
                  <div style={{ fontSize: 12, color: C.dim }}>{item.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6, marginTop: 12 }}>
            <strong style={{ color: C.teal }}>Key definition:</strong> Probability ranges from 0 to 1. Zero means impossible. One means certain. A probability of 0.30 means "this happens 30% of the time in the long run." Percentages are simply probabilities × 100.
          </div>
        </div>
      </Section>

      {/* Complement */}
      <Section icon="1−" iconBg={C.coralSoft} title="The Complement Rule">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>The complement of an event is everything that is <em>not</em> that event. Because all probabilities must sum to 1, the complement is always simple to find:</p>
          <div style={{ padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.amber, textAlign: 'center', marginBottom: 16 }}>
            P(not A) = 1 − P(A)
          </div>
          <ComplementSim />
        </div>
      </Section>

      {/* Addition */}
      <Section icon="∪" iconBg={C.tealSoft} title="The Addition Rule">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>When you want the probability that <em>at least one</em> of two events occurs, use the addition rule. When events overlap, simply adding P(A) and P(B) counts the shared patients twice. Subtract the overlap once to count each patient only once.</p>
          <div style={{ padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.amber, textAlign: 'center', marginBottom: 16 }}>
            P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
          </div>
          <p style={s.prose}>Toggle "Mutually Exclusive" to see what happens when events cannot both occur — the formula simplifies because there's no overlap to subtract.</p>
          <AdditionSim />
        </div>
      </Section>

      {/* Multiplication */}
      <Section icon="×" iconBg={C.purpleSoft} title="The Multiplication Rule">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>When you want the probability that <em>both</em> events occur, use the multiplication rule. The formula depends on whether the events are independent.</p>
          <MultiplicationSim />
        </div>
      </Section>

      {/* Conditional */}
      <Section icon="|" iconBg={C.purpleSoft} title="Conditional Probability" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            Conditional probability asks: given that we already know something, how does that change our probability estimate? The notation P(A|B) is read "probability of A <em>given</em> B."
          </p>
          <p style={s.prose}>
            Work through the stages below. The key insight is not the formula — it's understanding what changes when you condition on a known fact.
          </p>
          <ConditionalSim />
        </div>
      </Section>

      {/* Putting it together */}
      <Section icon="⊕" iconBg={C.amberSoft} title="Putting It Together">
        <div style={{ paddingTop: 20 }}>
          <PuttingItTogether />
        </div>
      </Section>

      {/* Rule selector */}
      <Section icon="▶" iconBg={C.coralSoft} title="Rule Selector Challenge" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            The hardest part of probability isn't the arithmetic — it's recognizing which rule to use. These scenarios test that skill. Look for signal words: <strong style={{ color: C.teal }}>"or"</strong> → addition, <strong style={{ color: C.purple }}>"and/both"</strong> → multiplication, <strong style={{ color: C.coral }}>"not"</strong> → complement, <strong style={{ color: C.amber }}>"given that"</strong> → conditional.
          </p>
          <RuleSelector />
        </div>
      </Section>

      {/* Foreshadow */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.25)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 4 }}>You just learned the mathematics behind diagnostic testing.</div>
          <div style={{ fontSize: 13, color: C.dim }}>Sensitivity, specificity, PPV, and NPV are all applications of conditional probability.</div>
        </div>
        <button style={{ padding: '9px 18px', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          Continue to Diagnostic Test Interpreter →
        </button>
      </div>
    </div>
  )
}
