import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Decision tree data ──
const RESULTS = {
  meanSD: {
    id: 'meanSD',
    name: 'Mean and Standard Deviation',
    color: C.teal,
    soft: C.tealSoft,
    center: 'Mean (x̄)',
    spread: 'Standard deviation (SD)',
    when: 'Continuous variable with an approximately symmetric, bell-shaped distribution.',
    why: 'The mean uses every value in the dataset and gives the most precise summary when the distribution is symmetric. The SD describes how spread out values are around the mean.',
    example: 'Systolic blood pressure in a healthy adult population: Mean = 122 mmHg, SD = 14 mmHg.',
    paperPhrase: '"Mean (SD) systolic blood pressure was 122 (14) mmHg."',
    notWhen: 'Avoid when the distribution is skewed or has extreme outliers — the mean gets pulled toward the tail and no longer represents the typical value.',
  },
  medianIQR: {
    id: 'medianIQR',
    name: 'Median and IQR',
    color: C.purple,
    soft: C.purpleSoft,
    center: 'Median',
    spread: 'Interquartile range (IQR)',
    when: 'Continuous variable with a skewed distribution or extreme outliers. Also used for ordinal variables.',
    why: 'The median is the middle value — half the observations fall above it and half below. It is not affected by extreme values the way the mean is. The IQR captures the middle 50% of the data.',
    example: 'Hospital length of stay (often right-skewed): Median = 4 days, IQR = 2–8 days.',
    paperPhrase: '"Median (IQR) length of stay was 4 (2–8) days."',
    notWhen: 'If the distribution is approximately symmetric, the mean and SD provide more statistical power and are preferred.',
  },
  freqPct: {
    id: 'freqPct',
    name: 'Frequency and Percent',
    color: C.coral,
    soft: C.coralSoft,
    center: 'Frequency (n)',
    spread: 'Percent (%)',
    when: 'Categorical variables (nominal or dichotomous) and ordinal variables with a small number of categories.',
    why: 'Categories cannot be averaged or ranked meaningfully. Counting how many observations fall in each category — and what percentage of the total that represents — is the appropriate summary.',
    example: 'Sex: 312 female (52%), 288 male (48%).',
    paperPhrase: '"Female sex was reported by 312 participants (52%)."',
    notWhen: 'Not appropriate as the primary summary for continuous variables — converting a continuous variable to categories loses information about the distribution.',
  },
}

const NOT_SURE = {
  q1: {
    title: 'How to identify the variable type',
    content: 'Ask: what does one unit of this variable represent? If it is a measured quantity with equal intervals (blood pressure in mmHg, age in years, income in dollars), it is continuous. If it is an ordered category (cancer stage, education level, satisfaction rating) where you can rank values but the gaps between them are not equal, it is ordinal. If it is a label with no inherent order (sex, HIV status, blood type), it is categorical.',
  },
  q2: {
    title: 'How to judge whether a distribution is symmetric',
    content: 'A symmetric distribution has roughly equal tails on both sides — like a bell curve. Income, hospital length of stay, and laboratory values often skew right (long tail on the right). Age in a clinical sample may be roughly symmetric. When in doubt, a histogram is the best tool. If you cannot plot it, lean toward the median and IQR — it is always safe for continuous data.',
  },
}

const PRACTICE_VARS = [
  { id: 'sbp', label: 'Systolic blood pressure (mmHg)', type: 'continuous', skewed: false, answer: 'meanSD', why: 'Blood pressure is a continuous measurement on a numerical scale with equal intervals. In most adult populations it is approximately normally distributed, so mean and SD are appropriate.' },
  { id: 'los', label: 'Hospital length of stay (days)', type: 'continuous', skewed: true, answer: 'medianIQR', why: 'Length of stay is continuous but typically right-skewed — most patients leave in a few days but a few stay for weeks. The median and IQR are more appropriate than the mean and SD.' },
  { id: 'sex', label: 'Sex (male/female)', type: 'categorical', answer: 'freqPct', why: 'Sex is a dichotomous categorical variable. You cannot average it or find a median. Frequency and percent are the only meaningful summaries.' },
  { id: 'stage', label: 'Cancer stage (I, II, III, IV)', type: 'ordinal', answer: 'medianIQR', why: 'Cancer stage is ordinal — Stage IV is more advanced than Stage I, but the difference between stages is not a measurable quantity. Median (or frequencies) is appropriate. Reporting a mean stage is not meaningful.' },
  { id: 'age', label: 'Age in years', type: 'continuous', skewed: false, answer: 'meanSD', why: 'Age is continuous with equal intervals. In most study populations it is approximately symmetric, making mean and SD appropriate. (Note: if the population has a skewed age distribution, median and IQR may be better.)' },
  { id: 'income', label: 'Annual household income (dollars)', type: 'continuous', skewed: true, answer: 'medianIQR', why: 'Income is continuous but almost always right-skewed — a few very high earners pull the mean upward. Median and IQR better represent the typical participant.' },
  { id: 'vacc', label: 'Vaccinated (yes/no)', type: 'categorical', answer: 'freqPct', why: 'Vaccination status is dichotomous. Count the number vaccinated and report the percentage. A mean of 0s and 1s is technically possible but not how it is reported in public health.' },
  { id: 'edu', label: 'Education level (less than HS / HS diploma / some college / college degree)', type: 'ordinal', answer: 'freqPct', why: 'Education level is ordinal with only four categories. Reporting frequencies and percentages for each level is usually more informative than a median alone, though median is also acceptable.' },
  { id: 'hr', label: 'Resting heart rate (beats per minute)', type: 'continuous', skewed: false, answer: 'meanSD', why: 'Heart rate is continuous with equal intervals and is approximately normally distributed in most populations. Mean and SD are appropriate.' },
  { id: 'hiv', label: 'HIV status (positive/negative)', type: 'categorical', answer: 'freqPct', why: 'HIV status is dichotomous. Frequency and percent are the only meaningful summaries.' },
  { id: 'cigs', label: 'Number of cigarettes smoked per day', type: 'continuous', skewed: true, answer: 'medianIQR', why: 'Cigarettes per day is right-skewed — many people smoke few cigarettes and some smoke many. Median and IQR are more appropriate than mean and SD.' },
  { id: 'bmi', label: 'Body mass index (kg/m²)', type: 'continuous', skewed: false, answer: 'meanSD', why: 'BMI is a continuous measurement. In most adult populations it is approximately normally distributed, making mean and SD appropriate. In populations with high obesity prevalence it may be slightly right-skewed — a histogram would confirm.' },
]

// ── Result card ──
function ResultCard({ resultId, onRestart }) {
  const r = RESULTS[resultId]
  if (!r) return null
  return (
    <div>
      <div style={{ padding: '16px 18px', background: r.soft, border: `2px solid ${r.color}`, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: r.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Appropriate summary statistics</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.name}</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <div><div style={{ fontSize: 10, color: r.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Center</div><div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{r.center}</div></div>
          <div><div style={{ fontSize: 10, color: r.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Spread</div><div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{r.spread}</div></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { label: 'Use when', val: r.when, color: C.green },
          { label: 'Why this works', val: r.why, color: r.color },
          { label: 'Avoid when', val: r.notWhen, color: C.coral },
          { label: 'Typical wording in papers', val: r.paperPhrase, color: C.muted, mono: true },
        ].map((item, i) => (
          <div key={i} style={{ padding: '11px 13px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65, fontFamily: item.mono ? "'JetBrains Mono', monospace" : 'inherit' }}>{item.val}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '11px 13px', background: r.soft, border: `1px solid ${r.color}33`, borderRadius: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: r.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Example</div>
        <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>{r.example}</div>
      </div>
      <button onClick={onRestart} style={{ width: '100%', padding: '11px 0', background: r.color, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
        Start over ↺
      </button>
    </div>
  )
}

// ── Walkthrough ──
function Walkthrough() {
  const [step, setStep] = useState('q1')
  const [result, setResult] = useState(null)
  const [notSure, setNotSure] = useState(null)
  const [history, setHistory] = useState([])

  function go(next) {
    setHistory(h => [...h, step])
    if (RESULTS[next]) { setResult(next); setStep('result') }
    else setStep(next)
    setNotSure(null)
  }
  function back() {
    const prev = history[history.length - 1]
    if (prev) { setStep(prev); setHistory(h => h.slice(0, -1)); setResult(null); setNotSure(null) }
  }
  function restart() { setStep('q1'); setResult(null); setHistory([]); setNotSure(null) }

  const questions = {
    q1: {
      q: 'What type of variable is this?',
      hint: 'Think about what one unit of this variable represents.',
      options: [
        { label: 'Continuous', sub: 'A measured quantity with equal intervals — blood pressure, age, income, BMI', next: 'q2' },
        { label: 'Ordinal', sub: 'Ordered categories where the gaps between values are not equal — cancer stage, education level, satisfaction rating', next: 'q3' },
        { label: 'Categorical or dichotomous', sub: 'Named groups with no inherent order, or yes/no — sex, HIV status, treatment group', next: 'freqPct' },
      ],
      ns: 'q1',
    },
    q2: {
      q: 'Is the distribution approximately symmetric?',
      hint: 'Think about whether the data have a long tail on one side. Income and length of stay are often right-skewed. Blood pressure in healthy adults is often symmetric.',
      options: [
        { label: 'Yes — roughly bell-shaped, no extreme outliers', sub: 'Both tails look similar in a histogram', next: 'meanSD' },
        { label: 'No — skewed, or has extreme outliers', sub: 'Long right tail is common for income, length of stay, lab values', next: 'medianIQR' },
        { label: "I don't know the distribution", sub: 'When in doubt, median and IQR is the safer choice', next: 'medianIQR' },
      ],
      ns: 'q2',
    },
    q3: {
      q: 'How many ordered categories does this variable have?',
      hint: 'A small number of categories may be better summarized with frequencies.',
      options: [
        { label: 'Many ordered values (5 or more)', sub: 'e.g., age reported in ordered groups, pain scale 0–10 with many responses', next: 'medianIQR' },
        { label: 'Few ordered categories (2–4)', sub: 'e.g., cancer stage I–IV, education level, satisfaction (low/medium/high)', next: 'freqPct' },
      ],
      ns: 'q1',
    },
  }

  if (step === 'result') return <ResultCard resultId={result} onRestart={restart} />
  const current = questions[step]
  if (!current) return null

  return (
    <div>
      {history.length > 0 && (
        <button onClick={back} style={{ fontSize: 12, color: C.dim, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14 }}>← Back</button>
      )}
      <div style={{ background: C.alt, borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Question {history.length + 1}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5, marginBottom: 6 }}>{current.q}</div>
        <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>{current.hint}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {current.options.map((opt, i) => (
          <button key={i} onClick={() => go(opt.next)}
            style={{ textAlign: 'left', padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealSoft }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{opt.sub}</div>}
          </button>
        ))}
        <button onClick={() => setNotSure(notSure === current.ns ? null : current.ns)}
          style={{ textAlign: 'left', padding: '10px 14px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: C.muted, fontSize: 13 }}>
          Not sure how to answer this →
        </button>
      </div>
      {notSure && NOT_SURE[notSure] && (
        <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
          <strong style={{ color: C.amber, display: 'block', marginBottom: 6 }}>{NOT_SURE[notSure].title}</strong>
          {NOT_SURE[notSure].content}
        </div>
      )}
    </div>
  )
}

// ── Practice ──
function Practice() {
  const [shuffled] = useState(() => {
    const arr = [...PRACTICE_VARS]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const sc = shuffled[idx]
  const answered = picked !== null
  const correct = picked === sc.answer

  function next() { setIdx(i => (i + 1) % shuffled.length); setPicked(null) }

  const options = [
    { val: 'meanSD', label: 'Mean and SD' },
    { val: 'medianIQR', label: 'Median and IQR' },
    { val: 'freqPct', label: 'Frequency and percent' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.muted }}>Variable {idx + 1} of {shuffled.length}</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {shuffled.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < idx ? C.teal : i === idx ? C.purple : C.border }} />
          ))}
        </div>
      </div>
      <div style={{ padding: '16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Variable</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{sc.label}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Which summary statistics are most appropriate?</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {options.map(opt => {
          const isPicked = picked === opt.val
          const isCorrect = opt.val === sc.answer
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (isCorrect) { bg = RESULTS[opt.val].soft; border = RESULTS[opt.val].color; color = RESULTS[opt.val].color }
            else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={opt.val} onClick={() => !answered && setPicked(opt.val)} disabled={answered}
              style={{ padding: '11px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
              {opt.label}
              {answered && isCorrect && <span style={{ float: 'right' }}>✓</span>}
              {answered && isPicked && !isCorrect && <span style={{ float: 'right', color: C.coral }}>✗</span>}
            </button>
          )
        })}
      </div>
      {answered && (
        <div>
          <div style={{ padding: '12px 14px', background: correct ? C.tealSoft : C.coralSoft, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
            <strong style={{ color: correct ? C.teal : C.coral }}>{correct ? 'Correct.' : `Not quite — ${RESULTS[sc.answer].name} is standard here.`}</strong> {sc.why}
          </div>
          <button onClick={next} style={{ width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {idx < shuffled.length - 1 ? 'Next variable →' : 'Start over ↺'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ──
export default function SummaryStatsHelper() {
  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Which Summary Statistics?</div>
      <div style={s.pageSub}>
        The right summary statistic depends on the variable type and, for continuous variables, the shape of the distribution. This tool walks you through that decision.
      </div>

      {/* Decision tree */}
      <Section icon="→" iconBg={C.tealSoft} title="Decision Walkthrough" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <Walkthrough />
        </div>
      </Section>

      {/* Why categorizing loses information */}
      <Section icon="!" iconBg={C.amberSoft} title="Why Categorizing Continuous Data Loses Information">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Reporting a percentage is not wrong — it is just answering a different question. The issue is when a continuous variable is collapsed into categories and the summary statistic treats those categories as the primary description.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ padding: '14px 16px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Continuous summary</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.dim, marginBottom: 8 }}>
                {[22, 24, 27, 29, 31, 33, 36].map((v, i) => (
                  <span key={i} style={{ marginRight: 8 }}>{v}</span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Mean BMI = 28.9 kg/m²</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>SD = 4.7 — you can see the spread and the center.</div>
            </div>
            <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>After categorizing</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.dim, marginBottom: 8 }}>
                {['No', 'No', 'No', 'No', 'Yes', 'Yes', 'Yes'].map((v, i) => (
                  <span key={i} style={{ marginRight: 8, color: v === 'Yes' ? C.coral : C.muted }}>{v}</span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: C.coral, fontWeight: 600 }}>Obesity: 43% (3 of 7)</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>You lose the individual values and the shape of the distribution.</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            Reporting "42% had obesity" is perfectly valid when obesity status is the research question. But if you want to describe the BMI distribution in your sample, mean and SD (or median and IQR) are more informative.
          </div>
        </div>
      </Section>

      {/* Why mean fails on ordinal */}
      <Section icon="≠" iconBg={C.coralSoft} title="Why the Mean Is Not Appropriate for Ordinal Variables">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Ordinal variables can be ranked, but the gaps between categories are not equal or measurable. That makes the mean misleading.</p>
          <div style={{ padding: '14px 16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Cancer stage — four patients</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              {['Stage I', 'Stage II', 'Stage III', 'Stage IV'].map((s2, i) => (
                <div key={i} style={{ padding: '8px 12px', background: [C.greenSoft, C.tealSoft, C.amberSoft, C.coralSoft][i], border: `1px solid ${[C.green, C.teal, C.amber, C.coral][i]}33`, borderRadius: 7, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: [C.green, C.teal, C.amber, C.coral][i], fontWeight: 700 }}>{s2}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.text, fontWeight: 700, marginTop: 3 }}>{i + 1}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '10px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 7 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Mean stage (misleading)</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.coral, fontWeight: 700 }}>2.5</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>"Stage 2.5" does not exist and implies the gap from Stage I to II equals the gap from II to III — which is not necessarily true biologically.</div>
              </div>
              <div style={{ padding: '10px 12px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 7 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Better approach</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>Median = Stage II–III, or report frequencies: Stage I: 1 (25%), Stage II: 1 (25%), Stage III: 1 (25%), Stage IV: 1 (25%).</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>The rule of thumb:</strong> If you cannot give a meaningful interpretation of a one-unit increase in the variable, you should not report a mean.
          </div>
        </div>
      </Section>

      {/* What question are you trying to answer? */}
      <Section icon="?" iconBg={C.purpleSoft} title="What Question Are You Trying to Answer?">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>The same variable can be summarized different ways depending on the research question. This does not mean all summaries are equally appropriate — it means the choice depends on what you are trying to communicate.</p>
          <div style={{ padding: '14px 16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Variable: Age (years)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { question: 'What is the average age of participants in our study?', stat: 'Mean (SD)', example: 'Mean age = 52.4 (SD = 11.2) years', color: C.teal },
                { question: 'What is the typical age, given that a few very old participants pull the average up?', stat: 'Median (IQR)', example: 'Median age = 51 (IQR: 44–60) years', color: C.purple },
                { question: 'What proportion of participants are 65 years or older?', stat: 'Frequency and percent', example: '148 participants (31%) were aged ≥65 years', color: C.coral },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 13px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <div style={{ width: 4, background: item.color, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.dim, marginBottom: 4, fontStyle: 'italic' }}>{item.question}</div>
                    <div style={{ fontSize: 13, color: item.color, fontWeight: 700 }}>{item.stat}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.muted, marginTop: 3 }}>{item.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            In a Table 1 (descriptive statistics table), you will usually report mean/SD or median/IQR for each continuous variable and frequency/percent for each categorical variable — regardless of the research question — because you are describing the sample, not answering the main hypothesis.
          </div>
        </div>
      </Section>

      {/* Practice */}
      <Section icon="▶" iconBg={C.purpleSoft} title="Practice">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Read each variable and choose the most appropriate summary statistic. Feedback explains the reasoning.</p>
          <Practice />
        </div>
      </Section>

      {/* Quick reference */}
      <Section icon="≡" iconBg={C.alt} title="Quick Reference">
        <div style={{ paddingTop: 20 }}>
          <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.5fr', background: C.alt, padding: '9px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `2px solid ${C.border}` }}>
              <span>Variable type</span><span>Center</span><span>Spread</span><span>Standard wording</span>
            </div>
            {[
              { type: 'Continuous, symmetric', center: 'Mean', spread: 'SD', wording: 'Mean (SD)', color: C.teal },
              { type: 'Continuous, skewed', center: 'Median', spread: 'IQR', wording: 'Median (IQR)', color: C.purple },
              { type: 'Ordinal (many levels)', center: 'Median', spread: 'IQR', wording: 'Median (IQR)', color: C.purple },
              { type: 'Ordinal (few categories)', center: 'Frequency', spread: 'Percent', wording: 'n (%)', color: C.coral },
              { type: 'Categorical / Dichotomous', center: 'Frequency', spread: 'Percent', wording: 'n (%)', color: C.coral },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.5fr', padding: '9px 12px', borderTop: `1px solid ${C.border}`, fontSize: 13, background: i % 2 === 0 ? C.surface : C.alt }}>
                <span style={{ color: row.color, fontWeight: 600 }}>{row.type}</span>
                <span style={{ color: C.dim }}>{row.center}</span>
                <span style={{ color: C.dim }}>{row.spread}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.muted }}>{row.wording}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
            These are the standard choices in public health research. The research question may sometimes call for a different approach — but these are the right defaults.
          </div>
        </div>
      </Section>

      {/* Cross-link */}
      <div style={{ marginTop: 20, padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
        <strong style={{ color: C.text }}>Related tools:</strong> The <span style={{ color: C.amber, fontWeight: 600 }}>Data Type Identifier</span> helps you classify variables. The <span style={{ color: C.purple, fontWeight: 600 }}>Distributions Explorer</span> shows what symmetric vs. skewed distributions look like.
      </div>
    </div>
  )
}
