import { useState, useMemo } from 'react'
import { C, s, Section, Concept } from './utils'

// ── Constants ──
const DEFAULT_SENS = 0.90
const DEFAULT_SPEC = 0.95
const DEFAULT_PREV = 0.10
const POP = 1000

// ── Math ──
function calcCounts(sens, spec, prev, n = POP) {
  const disease = Math.round(n * prev)
  const healthy = n - disease
  const tp = Math.round(disease * sens)
  const fn = disease - tp
  const tn = Math.round(healthy * spec)
  const fp = healthy - tn
  return { tp, fp, fn, tn, disease, healthy }
}

function calcMetrics(tp, fp, fn, tn) {
  const sens = tp + fn > 0 ? tp / (tp + fn) : 0
  const spec = tn + fp > 0 ? tn / (tn + fp) : 0
  const ppv = tp + fp > 0 ? tp / (tp + fp) : 0
  const npv = tn + fn > 0 ? tn / (tn + fn) : 0
  return { sens, spec, ppv, npv }
}

// ── Slider ──
function Slider({ label, value, min, max, step, onChange, fmt, disabled }) {
  return (
    <div style={{ marginBottom: 12, opacity: disabled ? 0.45 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={e => onChange && onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: C.teal, cursor: disabled ? 'not-allowed' : 'pointer' }} />
    </div>
  )
}

// ── Dot grid ──
function DotGrid({ tp, fp, fn, tn, highlight }) {
  const COLS = 40, DOT = 7, GAP = 2
  const total = tp + fp + fn + tn
  const n = Math.min(total, POP)

  // Build patient array: tp first, then fn, then fp, then tn
  // Seeded shuffle
  const patients = useMemo(() => {
    const arr = [
      ...Array(tp).fill({ disease: true, positive: true }),
      ...Array(fn).fill({ disease: true, positive: false }),
      ...Array(fp).fill({ disease: false, positive: true }),
      ...Array(tn).fill({ disease: false, positive: false }),
    ].slice(0, n)
    let seed = 99
    function rand() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [tp, fp, fn, tn])

  const ROWS = Math.ceil(n / COLS)
  const W = COLS * (DOT + GAP)
  const H = ROWS * (DOT + GAP)

  function fill(p) { return p.disease ? '#e8452a' : '#94a3b8' }
  function opacity(p) {
    if (!highlight) return 1
    if (highlight === 'sens') return p.disease ? 1 : 0.1
    if (highlight === 'spec') return !p.disease ? 1 : 0.1
    if (highlight === 'ppv') return p.positive ? 1 : 0.1
    if (highlight === 'npv') return !p.positive ? 1 : 0.1
    return 1
  }
  function stroke(p) {
    return p.positive ? { stroke: '#3b82f6', strokeWidth: 1.8 } : {}
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {patients.map((p, i) => {
          const col = i % COLS
          const row = Math.floor(i / COLS)
          const x = col * (DOT + GAP) + DOT / 2
          const y = row * (DOT + GAP) + DOT / 2
          const st = stroke(p)
          return (
            <circle key={i} cx={x} cy={y} r={DOT / 2}
              fill={fill(p)} fillOpacity={opacity(p)}
              stroke={st.stroke || 'none'} strokeWidth={st.strokeWidth || 0}
            />
          )
        })}
      </svg>
    </div>
  )
}

// ── 2×2 table with highlighting ──
function Table2x2({ tp, fp, fn, tn, highlight }) {
  const disease = tp + fn
  const healthy = fp + tn
  const testPos = tp + fp
  const testNeg = fn + tn
  const total = tp + fp + fn + tn

  const rowHighlight = (row) => {
    if (highlight === 'sens' || highlight === 'spec') return false
    if (highlight === 'ppv') return row === 'pos'
    if (highlight === 'npv') return row === 'neg'
    return false
  }
  const colHighlight = (col) => {
    if (highlight === 'ppv' || highlight === 'npv') return false
    if (highlight === 'sens') return col === 'disease'
    if (highlight === 'spec') return col === 'healthy'
    return false
  }

  const hlStyle = { background: 'rgba(107,63,204,0.1)', borderLeft: `3px solid ${C.purple}` }
  const colHlStyle = { color: C.purple, fontWeight: 700 }

  return (
    <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', fontSize: 13 }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 60px', background: C.alt, padding: '8px 10px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <span></span>
        <span style={colHighlight('disease') ? colHlStyle : { color: '#e8452a' }}>Disease +</span>
        <span style={colHighlight('healthy') ? colHlStyle : { color: '#94a3b8' }}>Disease −</span>
        <span>Total</span>
      </div>
      {/* Test + row */}
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 60px', padding: '9px 10px', borderTop: `1px solid ${C.border}`, background: rowHighlight('pos') ? 'rgba(107,63,204,0.07)' : C.surface, borderLeft: rowHighlight('pos') ? `3px solid ${C.purple}` : 'none' }}>
        <span style={{ color: C.dim, fontWeight: 600 }}>Test +{rowHighlight('pos') && <span style={{ marginLeft: 4, fontSize: 9, color: C.purple }}>← denom</span>}</span>
        <span style={{ color: '#e8452a', fontWeight: colHighlight('disease') ? 700 : 400 }}>{tp} <span style={{ fontSize: 11, color: C.muted }}>(TP)</span></span>
        <span style={{ color: '#94a3b8', fontWeight: colHighlight('healthy') ? 700 : 400 }}>{fp} <span style={{ fontSize: 11, color: C.muted }}>(FP)</span></span>
        <span style={{ color: C.text }}>{testPos}</span>
      </div>
      {/* Test − row */}
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 60px', padding: '9px 10px', borderTop: `1px solid ${C.border}`, background: rowHighlight('neg') ? 'rgba(107,63,204,0.07)' : C.alt, borderLeft: rowHighlight('neg') ? `3px solid ${C.purple}` : 'none' }}>
        <span style={{ color: C.dim, fontWeight: 600 }}>Test −{rowHighlight('neg') && <span style={{ marginLeft: 4, fontSize: 9, color: C.purple }}>← denom</span>}</span>
        <span style={{ color: '#e8452a', fontWeight: colHighlight('disease') ? 700 : 400 }}>{fn} <span style={{ fontSize: 11, color: C.muted }}>(FN)</span></span>
        <span style={{ color: '#94a3b8', fontWeight: colHighlight('healthy') ? 700 : 400 }}>{tn} <span style={{ fontSize: 11, color: C.muted }}>(TN)</span></span>
        <span style={{ color: C.text }}>{testNeg}</span>
      </div>
      {/* Totals */}
      <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 60px', padding: '9px 10px', borderTop: `2px solid ${C.border}`, background: C.surface }}>
        <span style={{ color: C.muted, fontWeight: 700 }}>Total</span>
        <span style={{ color: '#e8452a', fontWeight: colHighlight('disease') ? 700 : 600 }}>{disease}{colHighlight('disease') && <span style={{ marginLeft: 4, fontSize: 9, color: C.purple }}>← denom</span>}</span>
        <span style={{ color: '#94a3b8', fontWeight: colHighlight('healthy') ? 700 : 600 }}>{healthy}{colHighlight('healthy') && <span style={{ marginLeft: 4, fontSize: 9, color: C.purple }}>← denom</span>}</span>
        <span style={{ color: C.text, fontWeight: 700 }}>{total}</span>
      </div>
    </div>
  )
}

// ── Measure cards ──
const MEASURES = [
  {
    id: 'sens',
    name: 'Sensitivity',
    question: 'Among patients confirmed to have disease during validation, what fraction test positive?',
    formula: 'TP / (TP + FN)',
    denomGroup: 'Disease+ column (confirmed during validation)',
    note: 'During test validation, researchers already know which patients have disease. Sensitivity is simply the percentage of those patients who receive a positive test result. As prevalence changes in clinical use, TP and FN grow proportionally — so sensitivity stays the same.',
    changesWithPrev: false,
    color: '#e8452a',
  },
  {
    id: 'spec',
    name: 'Specificity',
    question: 'Among patients confirmed to be disease-free during validation, what fraction test negative?',
    formula: 'TN / (TN + FP)',
    denomGroup: 'Disease− column (confirmed during validation)',
    note: 'During test validation, researchers already know which patients do not have disease. Specificity is the percentage of those patients who receive a negative test result. TN and FP grow proportionally with the healthy pool — so specificity stays the same.',
    changesWithPrev: false,
    color: '#94a3b8',
  },
  {
    id: 'ppv',
    name: 'Positive Predictive Value',
    question: 'Among people who TEST POSITIVE, what fraction actually have disease?',
    formula: 'TP / (TP + FP)',
    denomGroup: 'Test+ row',
    note: 'Denominator = all positive tests. As prevalence increases, TP grows faster than FP — so PPV climbs. At very low prevalence, most positives are false alarms.',
    changesWithPrev: true,
    color: C.purple,
  },
  {
    id: 'npv',
    name: 'Negative Predictive Value',
    question: 'Among people who TEST NEGATIVE, what fraction are truly disease-free?',
    formula: 'TN / (TN + FN)',
    denomGroup: 'Test− row',
    note: 'Denominator = all negative tests. As prevalence increases, more truly sick patients are missed (FN increases), so NPV declines — though usually less dramatically than PPV changes.',
    changesWithPrev: true,
    color: C.teal,
  },
]

// ── PPV vs prevalence mini chart ──
function PrevChart({ sens, spec, currentPrev }) {
  const W = 240, H = 110, PAD = { l: 28, r: 8, t: 10, b: 24 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b

  const points = []
  for (let p = 0.005; p <= 0.5; p += 0.005) {
    const { tp, fp, fn, tn } = calcCounts(sens, spec, p)
    const { ppv, npv } = calcMetrics(tp, fp, fn, tn)
    points.push({ p, ppv, npv })
  }

  const toX = p => PAD.l + (p / 0.5) * innerW
  const toY = v => PAD.t + (1 - v) * innerH

  const ppvPath = points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${toX(pt.p).toFixed(1)},${toY(pt.ppv).toFixed(1)}`).join(' ')
  const npvPath = points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${toX(pt.p).toFixed(1)},${toY(pt.npv).toFixed(1)}`).join(' ')

  const { tp, fp, fn, tn } = calcCounts(sens, spec, currentPrev)
  const { ppv, npv } = calcMetrics(tp, fp, fn, tn)

  const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5]

  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <rect x={0} y={0} width={W} height={H} fill={C.alt} rx={6} />
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke={C.border} strokeWidth={1} />
      <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke={C.border} strokeWidth={1} />
      {[0, 0.25, 0.5, 0.75, 1].map(v => (
        <g key={v}>
          <line x1={PAD.l - 3} y1={toY(v)} x2={PAD.l} y2={toY(v)} stroke={C.muted} strokeWidth={1} />
          <text x={PAD.l - 5} y={toY(v) + 3} textAnchor="end" fontSize={8} fill={C.muted}>{(v * 100).toFixed(0)}%</text>
        </g>
      ))}
      {ticks.map(v => (
        <g key={v}>
          <line x1={toX(v)} y1={H - PAD.b} x2={toX(v)} y2={H - PAD.b + 3} stroke={C.muted} strokeWidth={1} />
          <text x={toX(v)} y={H - PAD.b + 11} textAnchor="middle" fontSize={8} fill={C.muted}>{(v * 100).toFixed(0)}%</text>
        </g>
      ))}
      <path d={ppvPath} fill="none" stroke={C.purple} strokeWidth={2} />
      <path d={npvPath} fill="none" stroke={C.teal} strokeWidth={2} />
      {/* Flat sens/spec lines */}
      <line x1={PAD.l} y1={toY(sens)} x2={W - PAD.r} y2={toY(sens)} stroke="#e8452a" strokeWidth={1.5} strokeDasharray="3 2" />
      <line x1={PAD.l} y1={toY(spec)} x2={W - PAD.r} y2={toY(spec)} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 2" />
      {/* Current prevalence dot */}
      <circle cx={toX(currentPrev)} cy={toY(ppv)} r={4} fill={C.purple} />
      <circle cx={toX(currentPrev)} cy={toY(npv)} r={4} fill={C.teal} />
      <line x1={toX(currentPrev)} y1={PAD.t} x2={toX(currentPrev)} y2={H - PAD.b} stroke={C.amber} strokeWidth={1} strokeDasharray="3 2" />
      <text x={W - PAD.r - 2} y={PAD.t + 9} textAnchor="end" fontSize={8} fill={C.purple}>PPV</text>
      <text x={W - PAD.r - 2} y={PAD.t + 18} textAnchor="end" fontSize={8} fill={C.teal}>NPV</text>
      <text x={W - 4} y={toY(sens) - 3} textAnchor="end" fontSize={8} fill="#e8452a">Sens</text>
      <text x={W - 4} y={toY(spec) + 9} textAnchor="end" fontSize={8} fill="#94a3b8">Spec</text>
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={8} fill={C.muted}>Prevalence →</text>
    </svg>
  )
}

// ── Main export ──
export default function DiagnosticTest() {
  const [sens, setSens] = useState(DEFAULT_SENS)
  const [spec, setSpec] = useState(DEFAULT_SPEC)
  const [prev, setPrev] = useState(DEFAULT_PREV)
  const [highlight, setHighlight] = useState(null)
  const [advanced, setAdvanced] = useState(false)
  const [scenarioPick, setScenarioPick] = useState({})

  const { tp, fp, fn, tn } = calcCounts(sens, spec, prev)
  const metrics = calcMetrics(tp, fp, fn, tn)

  function reset() {
    setSens(DEFAULT_SENS)
    setSpec(DEFAULT_SPEC)
    setPrev(DEFAULT_PREV)
    setHighlight(null)
  }

  const prevPresets = [
    { label: 'Rare disease', value: 0.01, sub: '1%' },
    { label: 'Moderate', value: 0.10, sub: '10%' },
    { label: 'High-risk clinic', value: 0.30, sub: '30%' },
  ]

  const scenarios = [
    {
      id: 'airport',
      label: 'Airport security screening',
      context: 'Screening millions of travelers for concealed weapons. Missing a weapon is catastrophic. False alarms are inconvenient but manageable.',
      measures: ['Sensitivity', 'Specificity', 'PPV', 'NPV'],
      answer: 0,
      explain: 'Sensitivity is most critical. Missing a true threat (false negative) is the worst outcome. High sensitivity ensures very few true threats are missed, even if it generates some false alarms.',
    },
    {
      id: 'donor',
      label: 'Blood donor screening for HIV',
      context: 'Testing donated blood before transfusion. A false negative (infected blood declared safe) puts recipients at risk. False positives (safe blood discarded) waste supply but cause no direct harm.',
      measures: ['Sensitivity', 'Specificity', 'PPV', 'NPV'],
      answer: 0,
      explain: 'Sensitivity again — but for a different reason. Every false negative means infected blood reaches a patient. The cost of a false positive (discarding a unit of blood) is far lower than the cost of a false negative.',
    },
    {
      id: 'biopsy',
      label: 'Confirmatory biopsy for cancer',
      context: 'A patient has already tested positive on a screening test. Before performing major surgery, the clinician wants to confirm the diagnosis. A false positive here means unnecessary surgery.',
      measures: ['Sensitivity', 'Specificity', 'PPV', 'NPV'],
      answer: 1,
      explain: 'Specificity — and therefore PPV — matters most here. You want a test that is unlikely to be positive in a healthy person, so a positive result truly confirms disease before proceeding to invasive treatment.',
    },
    {
      id: 'pregnancy',
      label: 'Home pregnancy test',
      context: 'A person tests themselves at home and gets a negative result. They want to be confident they are not pregnant.',
      measures: ['Sensitivity', 'Specificity', 'PPV', 'NPV'],
      answer: 3,
      explain: 'NPV is most relevant. The person tested negative and wants to know: given a negative test, what is the probability of truly not being pregnant? That is the definition of NPV.',
    },
  ]

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Diagnostic Test Interpreter</div>
      <div style={s.pageSub}>
        Four measures. One idea: sensitivity and specificity describe the test. PPV and NPV describe what the test means in this population. Prevalence is the difference.
      </div>

      {/* Validation callout */}
      <div style={{ padding: '14px 18px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>How do we know who really has the disease?</div>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 8 }}>
          Before a new diagnostic test is released for clinical use, researchers compare it against the best available method for determining whether patients truly have the disease — called the <strong style={{ color: C.text }}>reference standard</strong> (or gold standard). Because researchers already know each patient's true disease status from the reference standard, they can calculate how often the new test agrees.
        </p>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 8 }}>
          That's where sensitivity and specificity come from. They are measured once during validation — and then become fixed characteristics of the test.
        </p>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
          <strong style={{ color: C.text }}>When the test is used in real patients, we no longer know who has the disease</strong> — that's exactly why we're using the test. At that point, the question shifts: not "How well does the test detect disease?" but "What does this positive (or negative) result mean for this patient?" That's where PPV and NPV come in.
        </p>
      </div>

      {/* Section 1: Four questions */}
      <Section icon="?" iconBg={C.tealSoft} title="Start With the Question, Not the Formula" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Click each measure to see which group becomes the reference group.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {MEASURES.map(m => (
              <button key={m.id} onClick={() => setHighlight(highlight === m.id ? null : m.id)}
                style={{
                  padding: '12px 14px', textAlign: 'left', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
                  background: highlight === m.id ? (m.id === 'sens' ? '#fdecea' : m.id === 'spec' ? '#f0f2f7' : m.id === 'ppv' ? C.purpleSoft : C.tealSoft) : C.surface,
                  border: `1.5px solid ${highlight === m.id ? m.color : C.border}`,
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6, marginBottom: 6 }}>{m.question}</div>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: C.amber }}>{m.formula}</div>
                {highlight === m.id && (
                  <div style={{ marginTop: 8, fontSize: 11, color: m.color, fontWeight: 600 }}>Denominator: {m.denomGroup} →</div>
                )}
              </button>
            ))}
          </div>

          {/* 2×2 table */}
          <Table2x2 tp={tp} fp={fp} fn={fn} tn={tn} highlight={highlight} />

          {/* Dot grid */}
          <div style={{ background: C.alt, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 12, color: C.dim, flexWrap: 'wrap' }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#e8452a', marginRight: 4, verticalAlign: 'middle' }} />Disease</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#94a3b8', marginRight: 4, verticalAlign: 'middle' }} />Healthy</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'transparent', border: '2px solid #3b82f6', marginRight: 4, verticalAlign: 'middle' }} />Positive test</span>
              {highlight && <span style={{ color: C.purple, fontWeight: 600 }}>Faded dots = outside the denominator group</span>}
            </div>
            <DotGrid tp={tp} fp={fp} fn={fn} tn={tn} highlight={highlight} />
          </div>

          {/* Explanation when highlighted */}
          {highlight && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              <strong style={{ color: C.purple }}>{MEASURES.find(m => m.id === highlight)?.name}:</strong>{' '}
              {MEASURES.find(m => m.id === highlight)?.note}
            </div>
          )}
        </div>
      </Section>

      {/* Section 2: Prevalence experiment */}
      <Section icon="~" iconBg={C.purpleSoft} title="The Prevalence Experiment" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          {/* Test package insert */}
          <div style={{ padding: '14px 18px', background: C.alt, border: `2px solid ${C.border}`, borderRadius: 10, marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Diagnostic Test A — Validated Performance</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, color: C.dim, marginBottom: 2 }}>Sensitivity</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#e8452a', fontFamily: "'JetBrains Mono', monospace" }}>{(sens * 100).toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: C.muted }}>Property of the test</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: C.dim, marginBottom: 2 }}>Specificity</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>{(spec * 100).toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: C.muted }}>Property of the test</div>
              </div>
            </div>
            {!advanced && (
              <div style={{ marginTop: 10, fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                These characteristics were determined during test validation and do not change.
              </div>
            )}
          </div>

          <p style={{ ...s.prose, marginBottom: 16 }}>
            <strong style={{ color: C.text }}>The question:</strong> Will this same test perform the same way in a low-risk community and a high-risk clinic?
          </p>

          {/* Prevalence presets */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {prevPresets.map(pr => (
              <button key={pr.value} onClick={() => setPrev(pr.value)}
                style={{
                  padding: '6px 14px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                  background: Math.abs(prev - pr.value) < 0.001 ? C.purpleSoft : C.surface,
                  border: `1px solid ${Math.abs(prev - pr.value) < 0.001 ? C.purple : C.border}`,
                  color: Math.abs(prev - pr.value) < 0.001 ? C.purple : C.dim, fontWeight: 600,
                }}>
                {pr.label} ({pr.sub})
              </button>
            ))}
          </div>

          <Slider label="Prevalence — adjust and watch what changes" value={prev} min={0.005} max={0.5} step={0.005} onChange={setPrev} fmt={v => (v * 100).toFixed(1) + '%'} />

          {/* Live metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Sensitivity', val: metrics.sens, color: '#e8452a', fixed: !advanced },
              { label: 'Specificity', val: metrics.spec, color: '#94a3b8', fixed: !advanced },
              { label: 'PPV', val: metrics.ppv, color: C.purple, fixed: false },
              { label: 'NPV', val: metrics.npv, color: C.teal, fixed: false },
            ].map(m => (
              <div key={m.label} style={{ padding: '10px 10px', background: m.fixed ? C.alt : C.surface, border: `1px solid ${m.fixed ? C.border : m.color + '44'}`, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{m.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>{(m.val * 100).toFixed(1)}%</div>
                {m.fixed && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>unchanged</div>}
              </div>
            ))}
          </div>

          {/* The key message */}
          {prev <= 0.05 && (
            <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              <strong style={{ color: C.amber }}>At {(prev * 100).toFixed(1)}% prevalence:</strong> PPV = {(metrics.ppv * 100).toFixed(1)}%. Most positive tests are false alarms — not because the test is poor, but because disease is rare. The test didn't fail. The population changed.
            </div>
          )}
          {prev >= 0.25 && (
            <div style={{ padding: '12px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              <strong style={{ color: C.teal }}>At {(prev * 100).toFixed(1)}% prevalence:</strong> PPV = {(metrics.ppv * 100).toFixed(1)}%. Most positive tests are true cases. The same test — better predictive value — because the population has more disease.
            </div>
          )}

          {/* Side-by-side: dot grid + chart */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 2, minWidth: 280 }}>
              <div style={{ background: C.alt, borderRadius: 10, padding: 12, border: `1px solid ${C.border}`, overflowX: 'auto' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8 }}>1,000 patients at {(prev * 100).toFixed(0)}% prevalence</div>
                <DotGrid tp={tp} fp={fp} fn={fn} tn={tn} highlight={null} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>PPV & NPV across all prevalence values</div>
              <PrevChart sens={sens} spec={spec} currentPrev={prev} />
              <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11, flexWrap: 'wrap' }}>
                <span style={{ color: C.purple }}>— PPV</span>
                <span style={{ color: C.teal }}>— NPV</span>
                <span style={{ color: '#e8452a' }}>- - Sensitivity</span>
                <span style={{ color: '#94a3b8' }}>- - Specificity</span>
              </div>
            </div>
          </div>

          {/* Advanced toggle */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <button onClick={() => setAdvanced(a => !a)} style={{ padding: '7px 16px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: advanced ? C.tealSoft : C.surface, border: `1px solid ${advanced ? C.teal : C.border}`, color: advanced ? C.teal : C.dim, fontWeight: 600 }}>
              {advanced ? 'Hide' : 'Investigate further — adjust test characteristics'}
            </button>
            <button onClick={reset} style={{ padding: '7px 16px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: C.surface, border: `1px solid ${C.border}`, color: C.dim }}>
              ↺ Reset experiment
            </button>
          </div>

          {advanced && (
            <div style={{ marginTop: 14, padding: '14px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, marginBottom: 10 }}>Try changing one setting at a time to see which outcome it affects.</div>
              <Slider label="Sensitivity" value={sens} min={0.1} max={1} step={0.01} onChange={setSens} fmt={v => (v * 100).toFixed(0) + '%'} />
              <Slider label="Specificity" value={spec} min={0.1} max={1} step={0.01} onChange={setSpec} fmt={v => (v * 100).toFixed(0) + '%'} />
            </div>
          )}
        </div>
      </Section>

      {/* Section 3: Why two stay constant */}
      <Section icon="=" iconBg={C.amberSoft} title="Why Prevalence Changes PPV and NPV — but Not Sensitivity or Specificity">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            The key difference is <strong style={{ color: C.text }}>where you start</strong>. Sensitivity and specificity start with patients whose disease status is already known. PPV and NPV start with the test result.
          </p>

          {/* Side-by-side conceptual comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '16px', background: '#fef9f0', border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e8452a', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Sensitivity & Specificity</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>
                Start with patients whose <strong style={{ color: C.text }}>disease status is already known</strong>.
                <br />Ask: How well did the test perform?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: C.dim }}>
                <div style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: 5 }}>↓ Properties of the test</div>
                <div style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: 5, color: C.green, fontWeight: 600 }}>✓ Do not change with prevalence</div>
              </div>
            </div>
            <div style={{ padding: '16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>PPV & NPV</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>
                Start with the <strong style={{ color: C.text }}>test result</strong>.
                <br />Ask: What does this result mean for this patient?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: C.dim }}>
                <div style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: 5 }}>↓ Depends on who is being tested</div>
                <div style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: 5, color: C.coral, fontWeight: 600 }}>⚠ Changes with prevalence</div>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 70px 1.3fr 90px', background: C.alt, padding: '9px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Measure</span><span>Compared against</span><span>Changes?</span><span>Why — in plain language</span><span>Reference group</span>
            </div>
            {[
              {
                name: 'Sensitivity', color: '#e8452a',
                against: 'Patients confirmed to have disease during test validation',
                changes: 'No',
                why: 'Calculated only among patients whose disease status is already known. Changing how common the disease is changes the number of diseased patients — but not how well the test detects disease in those patients.',
                tree: { root: 'Disease +', items: ['TP ← numerator', 'FN'] },
              },
              {
                name: 'Specificity', color: '#94a3b8',
                against: 'Patients confirmed to be disease-free during test validation',
                changes: 'No',
                why: 'Calculated only among patients known not to have disease. Changing prevalence changes how many healthy patients there are — but not how well the test identifies them.',
                tree: { root: 'Disease −', items: ['TN ← numerator', 'FP'] },
              },
              {
                name: 'PPV', color: C.purple,
                against: 'Everyone who tested positive',
                changes: 'Yes',
                why: 'Starts with positive test results. When disease is rare, many positive results are false alarms. When disease is common, more positive results are true cases. Same test — very different meaning.',
                tree: { root: 'Test +', items: ['TP ← numerator', 'FP'] },
              },
              {
                name: 'NPV', color: C.teal,
                against: 'Everyone who tested negative',
                changes: 'Yes',
                why: 'Starts with negative test results. As disease becomes more common, negative results are more likely to be missed cases rather than truly disease-free patients.',
                tree: { root: 'Test −', items: ['TN ← numerator', 'FN'] },
              },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 70px 1.3fr 90px', padding: '12px 12px', borderTop: `1px solid ${C.border}`, fontSize: 13, background: i % 2 === 0 ? C.surface : C.alt, alignItems: 'start', gap: 8 }}>
                <span style={{ color: row.color, fontWeight: 700 }}>{row.name}</span>
                <span style={{ color: C.dim, lineHeight: 1.5, fontSize: 12 }}>{row.against}</span>
                <span style={{ color: row.changes === 'No' ? C.green : C.coral, fontWeight: 700 }}>{row.changes}</span>
                <span style={{ color: C.dim, fontSize: 12, lineHeight: 1.6 }}>{row.why}</span>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: C.dim, lineHeight: 1.9 }}>
                  <div style={{ color: row.color, fontWeight: 700 }}>{row.tree.root}</div>
                  {row.tree.items.map((leaf, j) => (
                    <div key={j} style={{ paddingLeft: 4, color: leaf.includes('numerator') ? row.color : C.muted }}>
                      {j === row.tree.items.length - 1 ? '└─ ' : '├─ '}{leaf}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 12 }}>
            <strong style={{ color: C.amber }}>The core distinction:</strong>
            <div style={{ marginTop: 6 }}><strong style={{ color: C.text }}>Sensitivity and specificity are properties of the test.</strong> They compare the test result with the patient's true disease status — established during validation and fixed thereafter.</div>
            <div style={{ marginTop: 6 }}><strong style={{ color: C.text }}>PPV and NPV are properties of the testing situation.</strong> They tell you what a positive or negative result means in this particular population. Change the population, and they change — even if the test hasn't changed at all.</div>
          </div>

          <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.purple }}>Decision rule for exams:</strong> Ask yourself one question before choosing a measure:
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 6 }}>
                Am I starting with what I know about the patient's <strong style={{ color: '#e8452a' }}>true disease status</strong>? → Sensitivity or Specificity
              </div>
              <div style={{ padding: '7px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 6 }}>
                Am I starting with the <strong style={{ color: C.purple }}>test result</strong>? → PPV or NPV
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 4: Which measure matters when */}
      <Section icon="▶" iconBg={C.coralSoft} title="Which Measure Matters — and When?">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Read each scenario and decide which measure is most important. There may be more than one defensible answer — focus on the reasoning.</p>
          {scenarios.map(sc => (
            <div key={sc.id} style={{ marginBottom: 14, padding: '14px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{sc.label}</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6, marginBottom: 12 }}>{sc.context}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {sc.measures.map((m, i) => {
                  const picked = scenarioPick[sc.id] !== undefined
                  const isAnswer = i === sc.answer
                  const isPicked = scenarioPick[sc.id] === i
                  let bg = C.alt, border = C.border, color = C.dim
                  if (picked) {
                    if (isAnswer) { bg = C.greenSoft; border = C.green; color = C.green }
                    else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
                  }
                  return (
                    <button key={i} onClick={() => !picked && setScenarioPick(p => ({ ...p, [sc.id]: i }))}
                      disabled={picked}
                      style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: picked ? 'default' : 'pointer', background: bg, border: `1px solid ${border}`, color, fontWeight: 600, transition: 'all 0.15s' }}>
                      {m}
                      {picked && isAnswer && ' ✓'}
                      {picked && isPicked && !isAnswer && ' ✗'}
                    </button>
                  )
                })}
              </div>
              {scenarioPick[sc.id] !== undefined && (
                <div style={{ padding: '10px 12px', background: scenarioPick[sc.id] === sc.answer ? C.tealSoft : C.coralSoft, border: `1px solid ${scenarioPick[sc.id] === sc.answer ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                  {scenarioPick[sc.id] === sc.answer
                    ? <><strong style={{ color: C.teal }}>Good reasoning.</strong> {sc.explain}</>
                    : <><strong style={{ color: C.coral }}>Consider this:</strong> {sc.explain}</>
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Closing bridge */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.25)`, borderRadius: 12 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: C.teal, marginBottom: 6 }}>The connection to probability rules</div>
        <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
          Sensitivity, specificity, PPV, and NPV are all conditional probabilities. The only thing that changes between them is which group becomes the denominator. Sensitivity conditions on disease status. PPV conditions on test result. Prevalence changes the composition of the test-result groups — which is why PPV and NPV change while sensitivity and specificity don't.
        </div>
      </div>
    </div>
  )
}
