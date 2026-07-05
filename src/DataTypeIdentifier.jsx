import { useState } from 'react'
import { C, s, XBar, PHat, Section, Concept, Quiz } from './utils'

// ── Variable type definitions ──
const TYPES = {
  continuous: {
    label: 'Continuous',
    color: C.teal,
    soft: C.tealSoft,
    border: 'rgba(0,153,168,0.25)',
    summary: 'Mean, SD',
    graph: 'Histogram, boxplot',
    test: 't-test, ANOVA',
    definition: 'Measured on a scale with meaningful, equal intervals. Can take any value within a range.',
    examples: 'Blood pressure (mmHg), age (years), cholesterol (mg/dL), height (cm)',
  },
  ordinal: {
    label: 'Ordinal',
    color: C.purple,
    soft: C.purpleSoft,
    border: 'rgba(107,63,204,0.25)',
    summary: 'Median, IQR',
    graph: 'Ordered bar chart',
    test: 'Mann-Whitney U, Kruskal-Wallis',
    definition: 'Categories with a meaningful order, but the spacing between categories is not guaranteed to be equal.',
    examples: 'Cancer stage (I–IV), pain severity (none/mild/moderate/severe), self-rated health (poor–excellent)',
  },
  categorical: {
    label: 'Categorical',
    color: C.amber,
    soft: C.amberSoft,
    border: 'rgba(184,112,0,0.25)',
    summary: 'Counts, %',
    graph: 'Bar chart',
    test: 'Chi-square test',
    definition: 'Named categories with no meaningful order. The numbers used to code them are labels, not quantities.',
    examples: 'Blood type (A/B/AB/O), race/ethnicity, zip code, patient ID',
  },
  dichotomous: {
    label: 'Dichotomous',
    color: C.coral,
    soft: C.coralSoft,
    border: 'rgba(232,69,42,0.25)',
    summary: 'Proportion (%)',
    graph: 'Bar chart',
    test: 'Chi-square, two-proportion z-test',
    definition: 'A special case of categorical with exactly two possible categories. Often coded 0/1 but the numbers are labels.',
    examples: 'Disease yes/no, HIV+/−, vaccinated/not vaccinated, survived/died',
  },
  count: {
    label: 'Count',
    color: C.green,
    soft: C.greenSoft,
    border: 'rgba(26,122,62,0.25)',
    summary: 'Mean or median (depends on distribution)',
    graph: 'Histogram, dot plot',
    test: 'Often treated as continuous; Poisson regression for specialized analyses',
    definition: 'Discrete whole numbers representing how many times something occurred. Cannot be negative or fractional.',
    examples: 'Number of hospitalizations, ER visits per year, cigarettes per day, number of falls',
  },
}

// ── Practice scenarios ──
const SCENARIOS = [
  {
    variable: 'Systolic blood pressure (mmHg)',
    context: 'Measured with a sphygmomanometer in a hypertension study.',
    answer: 'continuous',
    whyCorrect: 'Blood pressure is measured on a continuous scale with equal intervals. A difference of 10 mmHg means the same thing anywhere on the scale.',
    wrongFeedback: {
      ordinal: 'Blood pressure has equal intervals between values — 120 to 130 mmHg is the same gap as 140 to 150 mmHg. That makes it continuous, not ordinal.',
      categorical: 'Blood pressure is a measured quantity with equal intervals, not a named category. Even though it\'s sometimes grouped into categories (normal, elevated, high), the raw measurement is continuous.',
      dichotomous: 'Blood pressure is not a yes/no variable. It\'s measured on a continuous scale.',
      count: 'Blood pressure is not a count of events. It\'s a continuous measurement.',
    }
  },
  {
    variable: 'Cancer stage (I, II, III, IV)',
    context: 'Documented at diagnosis in an oncology registry.',
    answer: 'ordinal',
    whyCorrect: 'Cancer stages have a meaningful order — Stage IV is more advanced than Stage I. But the difference between Stage I and II is not necessarily the same as between Stage III and IV. That unequal spacing makes it ordinal.',
    wrongFeedback: {
      continuous: 'The stages have an order, but we can\'t assume equal spacing. Stage II isn\'t exactly "twice as bad" as Stage I. Continuous variables require equal, measurable intervals.',
      categorical: 'The stages do have a meaningful order (I → IV represents increasing severity), which makes this ordinal rather than unordered categorical.',
      dichotomous: 'There are four possible values, not two. Dichotomous variables have exactly two categories.',
      count: 'Although labeled with numbers, the stage numbers are not counts of events. They are ordered categories.',
    }
  },
  {
    variable: 'Blood type (A, B, AB, O)',
    context: 'Recorded in a blood bank registry.',
    answer: 'categorical',
    whyCorrect: 'Blood types are named categories with no meaningful order. Type AB is not "more" than Type A — they are just different. This is unordered categorical (nominal).',
    wrongFeedback: {
      continuous: 'Blood types are not measured on a scale. There is no quantity being measured here — only group membership.',
      ordinal: 'There is no meaningful ordering to blood types. Type O is not "less than" Type A in any measurable sense.',
      dichotomous: 'There are four possible blood types, not two. Dichotomous requires exactly two categories.',
      count: 'Blood type is not a count of events. It is a category label.',
    }
  },
  {
    variable: 'Diabetes diagnosis (yes / no)',
    context: 'Based on physician diagnosis in a clinical chart.',
    answer: 'dichotomous',
    whyCorrect: 'Diabetes diagnosis has exactly two categories: yes or no. Dichotomous variables are a special case of categorical variables with only two possible values. The summary measure is typically a proportion.',
    wrongFeedback: {
      continuous: 'Diabetes diagnosis is not measured on a scale. A patient either has the diagnosis or they don\'t.',
      ordinal: 'There is no ordering here — "yes" is not more or less than "no." Dichotomous is the right type.',
      categorical: 'Technically correct — dichotomous is a special case of categorical. But when a variable has exactly two categories, we usually call it dichotomous because it has its own summary measure (proportion) and its own set of tests.',
      count: 'A diagnosis is not a count of events. It is a binary classification.',
    }
  },
  {
    variable: 'Pain score (0–10 scale)',
    context: 'Patient self-report on a numeric rating scale in a post-surgical study.',
    answer: 'ordinal',
    whyCorrect: 'Pain scores have a meaningful order — a 7 means more pain than a 4. But we cannot assume that the difference between 2 and 3 equals the difference between 8 and 9. One patient\'s "3" may be another\'s "6." That makes it ordinal.',
    wrongFeedback: {
      continuous: 'This is the most common mistake. The numbers 0–10 look continuous, but we cannot assume equal spacing. Pain is subjective — the gap between 2 and 3 is not guaranteed to be the same as between 8 and 9.',
      categorical: 'Pain scores do have a meaningful order (higher = more pain), which rules out unordered categorical.',
      dichotomous: 'There are 11 possible values (0 through 10), not two.',
      count: 'Although the scale uses whole numbers, this is a rating scale, not a count of events. Use ordinal methods.',
    }
  },
  {
    variable: 'Zip code',
    context: 'Patient\'s residential zip code collected in an EHR.',
    answer: 'categorical',
    whyCorrect: 'Zip codes are numerical labels, not quantities. A zip code of 31201 is not "greater than" 30301 in any meaningful sense — they are just different geographic areas. This is a classic trick: numbers that look continuous but are actually categorical identifiers.',
    wrongFeedback: {
      continuous: 'This is the classic trap. Zip codes use numbers, but those numbers are labels, not measurements. You cannot meaningfully average zip codes.',
      ordinal: 'There is no meaningful ordering to zip codes. 90210 is not "more" than 10001.',
      dichotomous: 'There are thousands of zip codes, not two categories.',
      count: 'A zip code is not a count of anything. It is a geographic identifier.',
    }
  },
  {
    variable: 'Self-rated health (Poor / Fair / Good / Very Good / Excellent)',
    context: 'Single-item survey question from the Behavioral Risk Factor Surveillance System.',
    answer: 'ordinal',
    whyCorrect: 'These categories have a clear order from worst to best. But the gap between "Poor" and "Fair" is not necessarily the same as between "Good" and "Very Good." Ordinal is correct.',
    wrongFeedback: {
      continuous: 'Although health exists on a spectrum, these are ordered categories, not measurements with equal intervals.',
      categorical: 'The five categories do have a meaningful order (Poor → Excellent), which makes this ordinal rather than unordered categorical.',
      dichotomous: 'There are five categories, not two.',
      count: 'This is a rating, not a count of events.',
    }
  },
  {
    variable: 'Number of hospitalizations in the past year',
    context: 'Self-reported by participants in a chronic disease survey.',
    answer: 'count',
    whyCorrect: 'This is a count variable — a whole number that can be 0, 1, 2, 3... but not 2.7 or negative. In introductory biostatistics, counts are often treated like continuous variables, but specialized analyses (Poisson regression) exist for count data.',
    wrongFeedback: {
      continuous: 'Close — counts are often treated as continuous in introductory analyses. But strictly speaking, hospitalizations are discrete whole numbers, which makes this a count variable. You can\'t have 2.3 hospitalizations.',
      ordinal: 'Hospitalizations are not ordered categories. The numbers represent actual quantities with a true zero.',
      categorical: 'The numbers here represent actual quantities (0, 1, 2...), not category labels.',
      dichotomous: 'There are many possible values (0, 1, 2, 3...), not two.',
    }
  },
  {
    variable: 'Age group (0–17, 18–34, 35–64, 65+)',
    context: 'Categorized age variable in a national health survey.',
    answer: 'ordinal',
    whyCorrect: 'Even though age itself is continuous, this variable is not age — it is an age group. The groups have a meaningful order (younger to older), but the intervals are unequal (17 years, 16 years, 29 years, open-ended). That makes it ordinal. This is one of the most important distinctions in applied data analysis.',
    wrongFeedback: {
      continuous: 'Age (in years) is continuous, but age group is not. Once you group people into categories, the variable becomes ordinal. The intervals are unequal and you\'ve lost the original measurement.',
      categorical: 'The groups do have a meaningful order (0–17 is younger than 18–34), which makes this ordinal rather than unordered categorical.',
      dichotomous: 'There are four groups, not two.',
      count: 'Age group is not a count of events. It is a categorized version of a continuous variable.',
    }
  },
  {
    variable: 'HIV status (positive / negative)',
    context: 'Laboratory-confirmed serostatus in an epidemiological study.',
    answer: 'dichotomous',
    whyCorrect: 'HIV status has exactly two mutually exclusive categories. The summary measure is typically a proportion (e.g., 12% HIV positive). This is dichotomous — a special case of categorical with two values.',
    wrongFeedback: {
      continuous: 'HIV status is not measured on a scale. A test result is either positive or negative.',
      ordinal: 'Positive and negative have no meaningful ordering. They are two distinct categories.',
      categorical: 'Technically correct — dichotomous is a special case of categorical. But with exactly two categories, we call it dichotomous and summarize it with a proportion rather than a frequency table.',
      count: 'HIV status is not a count of anything. It is a binary test result.',
    }
  },
]

// ── Chain card shown after correct answer ──
function ChainCard({ type }) {
  const t = TYPES[type]
  return (
    <div style={{ marginTop: 12, padding: '14px 16px', background: t.soft, border: `1px solid ${t.border}`, borderRadius: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
        {t.label} — full decision chain
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Summary statistic', value: t.summary },
          { label: 'Graph type', value: t.graph },
          { label: 'Typical test', value: t.test },
        ].map(item => (
          <div key={item.label} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 7, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: t.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Practice identifier ──
function Identifier() {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const scenario = SCENARIOS[idx]
  const answered = picked !== null
  const correct = picked === scenario.answer

  function handlePick(type) {
    if (answered) return
    setPicked(type)
    if (type === scenario.answer) setScore(s => s + 1)
  }

  function handleNext() {
    if (idx < SCENARIOS.length - 1) {
      setIdx(i => i + 1)
      setPicked(null)
    } else {
      setDone(true)
    }
  }

  function handleRestart() {
    setIdx(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / SCENARIOS.length) * 100)
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: pct >= 80 ? C.green : pct >= 60 ? C.amber : C.coral, fontFamily: "'Space Grotesk', sans-serif" }}>{score}/{SCENARIOS.length}</div>
        <div style={{ fontSize: 15, color: C.dim, marginTop: 6, marginBottom: 20 }}>
          {pct >= 80 ? 'Strong work — variable classification is clicking.' : pct >= 60 ? 'Getting there. Review the ones you missed and try again.' : 'Keep practicing — this skill gets easier with repetition.'}
        </div>
        <button onClick={handleRestart} style={{ padding: '10px 24px', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.muted }}>Variable {idx + 1} of {SCENARIOS.length}</div>
        <div style={{ fontSize: 12, color: C.muted }}>Score: <span style={{ color: C.text, fontWeight: 600 }}>{score}</span></div>
      </div>
      <div style={{ height: 4, background: C.alt, borderRadius: 2, marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${((idx) / SCENARIOS.length) * 100}%`, background: C.teal, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Variable card */}
      <div style={{ background: C.alt, borderRadius: 10, padding: '16px 18px', marginBottom: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Classify this variable</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>{scenario.variable}</div>
        <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{scenario.context}</div>
      </div>

      {/* Type buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {Object.entries(TYPES).map(([key, type]) => {
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (key === scenario.answer) { bg = type.soft; border = type.color; color = type.color }
            else if (key === picked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={key} onClick={() => handlePick(key)}
              disabled={answered}
              style={{ padding: '10px 14px', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = type.color }}
              onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = C.border }}
            >
              {type.label}
              {answered && key === scenario.answer && <span style={{ float: 'right' }}>✓</span>}
              {answered && key === picked && key !== scenario.answer && <span style={{ float: 'right' }}>✗</span>}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div>
          <div style={{ padding: '12px 14px', background: correct ? C.tealSoft : C.coralSoft, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
            {correct
              ? <><strong style={{ color: C.teal }}>Correct.</strong> {scenario.whyCorrect}</>
              : <><strong style={{ color: C.coral }}>Not quite.</strong> {scenario.wrongFeedback[picked]}</>
            }
          </div>
          {correct && <ChainCard type={scenario.answer} />}
          <button onClick={handleNext} style={{ marginTop: 14, width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {idx < SCENARIOS.length - 1 ? 'Next variable →' : 'See results'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function DataTypeIdentifier() {
  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Data Type Identifier</div>
      <div style={s.pageSub}>
        Identifying a variable's type is the first decision in almost every statistical workflow. Get it wrong and every downstream choice — summary statistic, graph, test — follows incorrectly.
      </div>

      {/* 1. Variable types */}
      <Section icon="≡" iconBg={C.tealSoft} title="The Four Variable Types" defaultOpen={true}>
        {/* Measurement spectrum */}
        <div style={{ paddingTop: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Where each type sits</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
            <div style={{ background: C.alt, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Quantitative</div>
              {['continuous', 'count'].map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPES[k].color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: TYPES[k].color, fontWeight: 600 }}>{TYPES[k].label}</span>
                </div>
              ))}
            </div>
            <div style={{ background: C.alt, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Qualitative</div>
              {['ordinal', 'categorical', 'dichotomous'].map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPES[k].color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: TYPES[k].color, fontWeight: 600 }}>{TYPES[k].label}{k === 'dichotomous' ? ' *' : ''}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>* Special case of categorical (2 categories only)</div>
            </div>
          </div>
        </div>

        {/* Type cards */}
        {Object.entries(TYPES).map(([key, type]) => (
          <div key={key} style={{ marginBottom: 12, padding: '14px 16px', background: type.soft, border: `1px solid ${type.border}`, borderRadius: 10 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: type.color, marginBottom: 4 }}>{type.label}</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65, marginBottom: 6 }}>{type.definition}</div>
            <div style={{ fontSize: 12, color: C.muted }}><strong style={{ color: C.dim }}>Examples:</strong> {type.examples}</div>
          </div>
        ))}
      </Section>

      {/* 2. Decision chain */}
      <Section icon="→" iconBg={C.amberSoft} title="The Decision Chain">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Variable type determines every downstream decision. This table is the map.</p>
          <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: C.alt, padding: '10px 14px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Variable type</span><span>Summary</span><span>Graph</span><span>Typical test</span>
            </div>
            {Object.entries(TYPES).filter(([k]) => k !== 'count').map(([key, type], i) => (
              <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '10px 14px', borderTop: `1px solid ${C.border}`, fontSize: 13, background: i % 2 === 0 ? C.surface : C.alt, alignItems: 'center' }}>
                <span style={{ color: type.color, fontWeight: 700 }}>{type.label}</span>
                <span style={{ color: C.dim }}>{type.summary}</span>
                <span style={{ color: C.dim }}>{type.graph}</span>
                <span style={{ color: C.dim }}>{type.test}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', padding: '8px 12px', background: C.alt, borderRadius: 6 }}>
            Note: Dichotomous variables are a special case of categorical with exactly two categories. Count variables are often analyzed like continuous variables at the introductory level.
          </div>
        </div>
      </Section>

      {/* 3. Practice */}
      <Section icon="▶" iconBg={C.coralSoft} title="Variable Identifier Practice" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Read each variable description and select its type. After answering, you'll see the full decision chain.</p>
          <Identifier />
        </div>
      </Section>

      {/* 4. Common confusions */}
      <Section icon="!" iconBg={C.purpleSoft} title="Common Confusions">
        <Concept title="Numbers that look continuous but aren't">
          <p style={s.prose}>If a number is a label — not a measured quantity — it's categorical, regardless of what it looks like.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '10px 0' }}>
            {[
              { var: 'Zip code (e.g., 31201)', why: 'A geographic label. You cannot meaningfully average zip codes.' },
              { var: 'Patient ID (e.g., 00847)', why: 'An identifier, not a measurement. Higher ≠ sicker.' },
              { var: 'Room number', why: 'A location label. Room 412 is not "more" than Room 210.' },
              { var: 'Phone number', why: 'A contact label with no quantitative meaning.' },
            ].map(item => (
              <div key={item.var} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: C.alt, borderRadius: 7, border: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.coral, fontWeight: 600, minWidth: 180, flexShrink: 0 }}>{item.var}</span>
                <span style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{item.why}</span>
              </div>
            ))}
          </div>
        </Concept>

        <Concept title="Ordinal vs. continuous: the equal-interval test">
          <p style={s.prose}>Ask: is the gap between each adjacent value guaranteed to be equal?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '10px 0' }}>
            <div style={{ padding: '12px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 6 }}>CONTINUOUS ✓</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>Temperature (°C): the gap between 20° and 21° equals the gap between 98° and 99°. Equal intervals guaranteed.</div>
            </div>
            <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, marginBottom: 6 }}>ORDINAL ✓</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>Pain score (0–10): a patient's "3" may not equal another's "3." The intervals between ratings are not guaranteed to be equal.</div>
            </div>
          </div>
        </Concept>

        <Concept title="Age vs. age group">
          <p style={s.prose}>
            Age in years is <strong style={{ color: C.teal }}>continuous</strong>.
            Age group (0–17, 18–34, 35–64, 65+) is <strong style={{ color: C.purple }}>ordinal</strong>.
          </p>
          <div style={{ ...s.example, background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)` }}>
            <div style={{ ...s.exampleLabel, color: C.amber }}>Why this matters</div>
            Once you group a continuous variable into categories, you change its type. The intervals in the example above are unequal (17 years, 16 years, 29 years, open-ended). Treating age groups as continuous — and computing a mean — is a common error that produces meaningless results.
          </div>
        </Concept>
      </Section>
    </div>
  )
}
