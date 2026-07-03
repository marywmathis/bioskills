import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Data ──
const SIMPLE_COEFS = [
  { predictor: 'Age (years)', beta: 1.2, se: 0.18, tRatio: 6.67, pVal: '<.0001', unit: 'year', outcomeUnit: 'mmHg', direction: 'increases', continuous: true },
  { predictor: 'BMI (kg/m²)', beta: 2.1, se: 0.31, tRatio: 6.77, pVal: '<.0001', unit: 'kg/m²', outcomeUnit: 'mmHg', direction: 'increases', continuous: true },
  { predictor: 'Hours of sleep per night', beta: -3.4, se: 0.72, tRatio: -4.72, pVal: '<.0001', unit: 'hour', outcomeUnit: 'mmHg', direction: 'decreases', continuous: true },
]

const MULTI_COEFS = [
  { predictor: 'Intercept', beta: 89.4, se: 3.21, tRatio: 27.85, pVal: '<.0001', interpretation: 'The predicted SBP when all predictors equal 0 — meaning Age = 0, Male, BMI = 0. In this model that represents a newborn, not a realistic study participant. The intercept gives the regression equation its starting point. Click again to explore the prediction equation.' },
  { predictor: 'Age (years)', beta: 1.2, se: 0.17, tRatio: 7.06, pVal: '<.0001', interpretation: 'For each additional year of age, SBP is estimated to be 1.2 mmHg higher, holding sex and BMI constant.' },
  { predictor: 'Sex [Female]', beta: -3.8, se: 1.14, tRatio: -3.33, pVal: '0.0009', interpretation: 'Women have SBP estimated to be 3.8 mmHg lower than men (the reference category), holding age and BMI constant.' },
  { predictor: 'BMI (kg/m²)', beta: 2.1, se: 0.29, tRatio: 7.24, pVal: '<.0001', interpretation: 'For each additional kg/m² of BMI, SBP is estimated to be 2.1 mmHg higher, holding age and sex constant.' },
]

const LOGISTIC_COEFS = [
  { predictor: 'Intercept', beta: -4.82, se: 0.51, chiSq: 89.3, pVal: '<.0001', or: null, interpretation: 'The predicted log odds of hypertension when all predictors equal 0 (Age = 0, Male, BMI = 0). This represents a newborn — not a meaningful research scenario. The intercept gives the logistic equation its baseline. Do not exponentiate or interpret it as an effect estimate.' },
  { predictor: 'Age (years)', beta: 0.063, se: 0.009, chiSq: 49.2, pVal: '<.0001', or: 1.065, interpretation: 'Each additional year of age is associated with 6.5% higher odds of hypertension, holding sex and BMI constant.' },
  { predictor: 'Sex [Female]', beta: -0.41, se: 0.14, chiSq: 8.6, pVal: '0.0033', or: 0.664, interpretation: 'Women have 33.6% lower odds of hypertension than men (the reference category), holding age and BMI constant.' },
  { predictor: 'BMI (kg/m²)', beta: 0.112, se: 0.016, chiSq: 48.4, pVal: '<.0001', or: 1.118, interpretation: 'Each additional kg/m² of BMI is associated with 11.8% higher odds of hypertension, holding age and sex constant.' },
]

// ── JMP-style table ──
function LinearTable({ coefs, clickable, onRowClick, selectedRow }) {
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', fontSize: 13 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.8fr 0.8fr', background: C.alt, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `2px solid ${C.border}` }}>
        <span>Term</span><span>Estimate</span><span>Std Error</span><span>t Ratio</span><span>Prob&gt;|t|</span>
      </div>
      {coefs.map((row, i) => {
        const isSelected = selectedRow === i
        return (
          <div key={i}
            onClick={() => clickable && onRowClick && onRowClick(i)}
            style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.8fr 0.8fr', padding: '9px 12px', borderTop: `1px solid ${C.border}`, background: isSelected ? C.purpleSoft : i % 2 === 0 ? C.surface : C.alt, cursor: clickable ? 'pointer' : 'default', transition: 'background 0.15s', borderLeft: isSelected ? `3px solid ${C.purple}` : 'none' }}>
            <span style={{ color: isSelected ? C.purple : C.text, fontWeight: isSelected ? 700 : 400 }}>{row.predictor}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: row.beta < 0 ? C.coral : C.green, fontWeight: 600 }}>{row.beta > 0 ? '+' : ''}{row.beta}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.dim }}>{row.se}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.dim }}>{typeof row.tRatio === 'number' ? (row.tRatio > 0 ? '+' : '') + row.tRatio.toFixed(2) : row.tRatio}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: row.pVal === '<.0001' || parseFloat(row.pVal) < 0.05 ? C.teal : C.muted, fontWeight: row.pVal === '<.0001' || parseFloat(row.pVal) < 0.05 ? 700 : 400 }}>{row.pVal}</span>
          </div>
        )
      })}
    </div>
  )
}

function LogisticTable({ coefs, clickable, onRowClick, selectedRow }) {
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', fontSize: 13 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr', background: C.alt, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `2px solid ${C.border}` }}>
        <span>Term</span><span>Estimate</span><span>Std Error</span><span>ChiSquare</span><span>Prob&gt;ChiSq</span><span>Odds Ratio</span>
      </div>
      {coefs.map((row, i) => {
        const isSelected = selectedRow === i
        return (
          <div key={i}
            onClick={() => clickable && onRowClick && onRowClick(i)}
            style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr', padding: '9px 12px', borderTop: `1px solid ${C.border}`, background: isSelected ? C.purpleSoft : i % 2 === 0 ? C.surface : C.alt, cursor: clickable ? 'pointer' : 'default', transition: 'background 0.15s', borderLeft: isSelected ? `3px solid ${C.purple}` : 'none' }}>
            <span style={{ color: isSelected ? C.purple : C.text, fontWeight: isSelected ? 700 : 400 }}>{row.predictor}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: row.beta < 0 ? C.coral : C.green, fontWeight: 600 }}>{row.beta > 0 ? '+' : ''}{row.beta}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.dim }}>{row.se}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.dim }}>{row.chiSq}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: row.pVal === '<.0001' || parseFloat(row.pVal) < 0.05 ? C.teal : C.muted, fontWeight: row.pVal === '<.0001' || parseFloat(row.pVal) < 0.05 ? 700 : 400 }}>{row.pVal}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: row.or ? (row.or > 1 ? C.coral : C.teal) : C.muted, fontWeight: row.or ? 700 : 400 }}>{row.or ? row.or.toFixed(3) : '—'}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Sentence generator ──
function SentenceCard({ coef, outcome }) {
  if (!coef) return null
  const absB = Math.abs(coef.beta)
  const dirWord = coef.beta < 0 ? 'decrease' : 'increase'
  const dirColor = coef.beta < 0 ? C.coral : C.green
  return (
    <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, fontSize: 14, color: C.dim, lineHeight: 1.8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Plain-language interpretation</div>
      <div>
        For each additional <strong style={{ color: C.teal }}>one {coef.unit}</strong> increase in <strong style={{ color: C.teal }}>{coef.predictor}</strong>, the predicted {outcome} is estimated to{' '}
        <strong style={{ color: dirColor }}>{dirWord} by {absB} {coef.outcomeUnit}</strong>.
      </div>
    </div>
  )
}

function InterceptCard({ interceptVal, selectedCoef }) {
  const predName = selectedCoef ? selectedCoef.predictor : 'the predictor'
  const unitName = selectedCoef ? selectedCoef.unit : 'unit'
  return (
    <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, fontSize: 14, color: C.dim, lineHeight: 1.8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Plain-language interpretation — Intercept</div>
      <div style={{ marginBottom: 10 }}>
        The intercept is the predicted systolic blood pressure when the predictor equals 0.
      </div>
      <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: 7, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginBottom: 12 }}>
        <div>{predName} = 0 {unitName}</div>
        <div style={{ color: C.purple, fontWeight: 700, marginTop: 4 }}>Predicted SBP = {interceptVal} mmHg</div>
      </div>
      <div style={{ padding: '10px 12px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
        <strong style={{ color: C.amber, display: 'block', marginBottom: 4 }}>Why this usually is not the important number</strong>
        The intercept gives the regression equation its starting point. In most public health studies, a value of 0 for {predName.toLowerCase()} is unrealistic — {selectedCoef && selectedCoef.predictor.includes('Age') ? 'a person aged 0 is a newborn, not a typical study participant' : selectedCoef && selectedCoef.predictor.includes('BMI') ? 'a BMI of 0 is not biologically possible' : selectedCoef && selectedCoef.predictor.includes('sleep') ? 'no one sleeps exactly 0 hours' : 'a value of 0 is outside the range of realistic observations'}. Researchers focus on the predictor estimates, not the intercept, because those answer the research question.
      </div>
    </div>
  )
}

// ── Main ──
export default function RegressionInterpreter() {
  const [simpleSelected, setSimpleSelected] = useState(0)
  const [simpleIntercept, setSimpleIntercept] = useState(false)
  const [interceptAge, setInterceptAge] = useState(40)
  const [multiSelected, setMultiSelected] = useState(null)
  const [logisticSelected, setLogisticSelected] = useState(null)
  const [showExp, setShowExp] = useState(false)

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Regression Interpreter</div>
      <div style={s.pageSub}>
        Regression output is not a formula to memorize. It is an answer to a question. Learn to read the table and translate each number into a sentence.
      </div>

      {/* 1. What is regression trying to do? */}
      <Section icon="?" iconBg={C.tealSoft} title="What Is Regression Trying to Do?" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Suppose you want to understand what predicts systolic blood pressure (SBP). You have data on age, sex, and BMI for 800 adults. You could ask three separate questions:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0' }}>
            {['Does age predict SBP?', 'Does sex predict SBP?', 'Does BMI predict SBP?'].map((q, i) => (
              <div key={i} style={{ padding: '9px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, color: C.dim }}>{q}</div>
            ))}
          </div>
          <p style={s.prose}>But regression lets you ask all three at once — and answers a fourth question those separate analyses cannot:</p>
          <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: C.purple, marginBottom: 6 }}>Which factors predict SBP, and by how much — after accounting for the others?</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>That last phrase — "after accounting for the others" — is what makes regression powerful. It separates the contribution of each predictor from the others. The estimate for age tells you what age does to SBP when BMI and sex are held constant.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '12px 14px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
              <strong style={{ color: C.green }}>Linear regression</strong> — outcome is continuous (e.g., SBP in mmHg). Coefficients are differences in means.
            </div>
            <div style={{ padding: '12px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
              <strong style={{ color: C.coral }}>Logistic regression</strong> — outcome is binary (e.g., hypertension yes/no). Coefficients are log odds ratios.
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Simple linear regression */}
      <Section icon="1" iconBg={C.purpleSoft} title="Simple Linear Regression — One Predictor">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Start with one predictor. Click a row to see its plain-language interpretation.</p>
          <div style={{ marginBottom: 12, padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim }}>
            <strong style={{ color: C.amber }}>Outcome:</strong> Systolic blood pressure (mmHg) — a continuous measurement. This is <strong>simple</strong> linear regression because there is only one predictor at a time.
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {SIMPLE_COEFS.map((sc2, i) => (
                <button key={i} onClick={() => { setSimpleSelected(i); setSimpleIntercept(false) }}
                  style={{ padding: '6px 14px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, background: simpleSelected === i && !simpleIntercept ? C.purple : C.surface, color: simpleSelected === i && !simpleIntercept ? '#fff' : C.dim, border: `1px solid ${simpleSelected === i && !simpleIntercept ? C.purple : C.border}` }}>
                  {sc2.predictor}
                </button>
              ))}
            </div>
            <LinearTable
              coefs={[{ predictor: 'Intercept', beta: 78.3, se: 5.12, tRatio: 15.29, pVal: '<.0001' }, SIMPLE_COEFS[simpleSelected]]}
              clickable={true}
              onRowClick={i => { if (i === 0) setSimpleIntercept(true); else setSimpleIntercept(false) }}
              selectedRow={simpleIntercept ? 0 : null}
            />
          </div>
          {simpleIntercept
            ? <InterceptCard interceptVal={78.3} selectedCoef={SIMPLE_COEFS[simpleSelected]} />
            : <SentenceCard coef={SIMPLE_COEFS[simpleSelected]} outcome="systolic blood pressure" />
          }
          <div style={{ marginTop: 14, padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.text }}>What each column means:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {[
                { col: 'Estimate', meaning: 'For predictor variables: the expected change in the outcome for a one-unit increase in the predictor. For the intercept: the predicted outcome when all predictors equal 0.' },
                { col: 'Std Error', meaning: 'How precisely the coefficient was estimated. Smaller SE = more precise.' },
                { col: 't Ratio', meaning: 'Estimate ÷ Std Error. How many standard errors away from zero.' },
                { col: 'Prob>|t|', meaning: 'The p-value. Probability of seeing a t Ratio this large if the true coefficient were zero.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.purple, fontWeight: 600, minWidth: 90, flexShrink: 0 }}>{item.col}</span>
                  <span style={{ color: C.dim }}>{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 3. Multiple linear regression */}
      <Section icon="2" iconBg={C.tealSoft} title="Multiple Linear Regression — Holding Everything Else Constant">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Now all three predictors are in the model at once. Click any row to see its interpretation.</p>
          <div style={{ marginBottom: 14, padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.purple }}>What "holding everything else constant" means:</strong> When you read the estimate for Age, it tells you what age does to SBP among people who are identical in sex and BMI. The regression model mathematically separates each predictor's contribution from the others.
          </div>

          {/* Visual: same person, one thing changes */}
          <div style={{ marginBottom: 14, padding: '14px 16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Visualizing "holding constant"</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
              <div style={{ padding: '10px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>Person A</div>
                {[['Age', '45 years'], ['Sex', 'Male'], ['BMI', '28 kg/m²'], ['Predicted SBP', '132 mmHg']].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: i < 3 ? C.dim : C.purple, fontWeight: i === 3 ? 700 : 400, padding: '2px 0', borderTop: i === 3 ? `1px solid ${C.border}` : 'none', marginTop: i === 3 ? 6 : 0 }}>
                    <span>{k}</span><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, color: C.teal }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>→</div>
                <div style={{ color: C.teal, fontWeight: 700 }}>+1 year</div>
                <div style={{ color: C.muted }}>age only</div>
              </div>
              <div style={{ padding: '10px 12px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: C.teal, marginBottom: 6 }}>Person B</div>
                {[['Age', '46 years ✓'], ['Sex', 'Male (same)'], ['BMI', '28 kg/m² (same)'], ['Predicted SBP', '133.2 mmHg']].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: i === 0 ? C.teal : i < 3 ? C.muted : C.purple, fontWeight: i === 0 || i === 3 ? 700 : 400, padding: '2px 0', borderTop: i === 3 ? `1px solid ${C.border}` : 'none', marginTop: i === 3 ? 6 : 0 }}>
                    <span>{k}</span><span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: C.dim, textAlign: 'center' }}>SBP difference = 133.2 − 132.0 = <strong style={{ color: C.purple }}>1.2 mmHg</strong> — exactly the Age coefficient</div>
          </div>

          <LinearTable coefs={MULTI_COEFS} clickable={true} onRowClick={setMultiSelected} selectedRow={multiSelected} />

          {multiSelected !== null && (
            <div style={{ marginTop: 12, padding: '14px 16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Plain-language interpretation</div>
              <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.8 }}>{MULTI_COEFS[multiSelected].interpretation}</div>
              {multiSelected === 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 8 }}>Try it — adjust age to see the prediction</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                    <span>Age</span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{interceptAge} years</span>
                  </div>
                  <input type="range" min={20} max={80} step={1} value={interceptAge} onChange={e => setInterceptAge(+e.target.value)} style={{ width: '100%', accentColor: C.purple, marginBottom: 10 }} />
                  <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: 7, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.dim, lineHeight: 1.8 }}>
                    <div>Predicted SBP = 89.4 + (1.2 × {interceptAge})</div>
                    <div style={{ color: C.purple, fontWeight: 700, fontSize: 15, marginTop: 4 }}>= {(89.4 + 1.2 * interceptAge).toFixed(1)} mmHg</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Assumes Male, average BMI. The 89.4 intercept gives the line its starting point.</div>
                  </div>
                  <div style={{ marginTop: 10, padding: '8px 12px', background: C.amberSoft, borderRadius: 7, fontSize: 12, color: C.dim, lineHeight: 1.6 }}>
                    <strong style={{ color: C.amber }}>Does the intercept matter here?</strong> In this model, Age = 0 means a newborn — not a typical study participant. The intercept gives the regression equation a starting point, but most studies focus on the predictor estimates rather than the intercept itself.
                  </div>
                </div>
              )}
            </div>
          )}

          {multiSelected === null && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.muted, textAlign: 'center' }}>
              Click any row to see its plain-language interpretation
            </div>
          )}
        </div>
      </Section>

      {/* 4. Linear to logistic */}
      <Section icon="3" iconBg={C.coralSoft} title="From Linear to Logistic — When the Outcome Is Binary">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Same predictors. Same adults. But now the outcome is hypertension (yes/no) instead of a blood pressure number. That change requires a different regression model — and a different way to read the estimates.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Linear regression</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>Outcome: SBP (mmHg)<br />Coefficient: difference in means<br />Example: +1.2 mmHg per year of age</div>
            </div>
            <div style={{ padding: '12px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Logistic regression</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>Outcome: Hypertension (yes/no)<br />Coefficient: log odds ratio<br />Must be exponentiated to interpret</div>
            </div>
          </div>

          {/* Exponentiation walkthrough */}
          <div style={{ padding: '14px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 10 }}>The exponentiation step — why it is necessary</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
              Logistic regression models the <em>log odds</em> of the outcome. The estimate for Age = +0.063 means the log odds of hypertension increases by 0.063 for each year of age. Log odds are hard to interpret. To get something meaningful, exponentiate:
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
              {[
                { label: 'Coefficient (log OR)', val: '0.063', color: C.muted },
                { label: '', val: '→ e^0.063 →', color: C.amber },
                { label: 'Odds Ratio', val: '1.065', color: C.coral },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  {item.label && <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{item.label}</div>}
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              <strong style={{ color: C.amber }}>Interpretation:</strong> Each additional year of age is associated with <strong>1.065 times</strong> the odds of hypertension — or about <strong>6.5% higher odds</strong> — holding sex and BMI constant.
            </div>
            <button onClick={() => setShowExp(v => !v)} style={{ marginTop: 10, fontSize: 12, color: C.amber, background: 'none', border: `1px solid rgba(184,112,0,0.3)`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {showExp ? 'Hide' : 'How to convert OR to percent change →'}
            </button>
            {showExp && (
              <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                <strong style={{ color: C.text }}>Converting OR to percent change:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  <div>OR &gt; 1: (OR − 1) × 100 = % increase in odds. Example: (1.065 − 1) × 100 = <strong style={{ color: C.coral }}>6.5% higher odds</strong></div>
                  <div>OR &lt; 1: (1 − OR) × 100 = % decrease in odds. Example: (1 − 0.664) × 100 = <strong style={{ color: C.teal }}>33.6% lower odds</strong></div>
                </div>
              </div>
            )}
          </div>

          <p style={s.prose}>Click any row in the logistic regression table to see its interpretation.</p>
          <LogisticTable coefs={LOGISTIC_COEFS} clickable={true} onRowClick={setLogisticSelected} selectedRow={logisticSelected} />

          {logisticSelected !== null && (
            <div style={{ marginTop: 12, padding: '14px 16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Plain-language interpretation</div>
              <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.8 }}>{LOGISTIC_COEFS[logisticSelected].interpretation}</div>
            </div>
          )}
          {logisticSelected === null && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.muted, textAlign: 'center' }}>
              Click any row to see its plain-language interpretation
            </div>
          )}
        </div>
      </Section>

      {/* 5. Reference categories */}
      <Section icon="4" iconBg={C.amberSoft} title="Reference Categories — What the Coefficient Is Compared To">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>When a predictor is categorical (like sex), one category must be chosen as the reference. The estimate for every other category is the difference from the reference.</p>
          <div style={{ padding: '14px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 10 }}>In our example: Sex [Female] — reference is Male</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 7, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Reference category</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Male</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.muted, marginTop: 4 }}>estimate = 0 (implicit)</div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 20, color: C.muted }}>vs.</div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 7, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Comparison category</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Female</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.teal, marginTop: 4 }}>estimate = −3.8 mmHg</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              The estimate −3.8 means: women have SBP estimated to be 3.8 mmHg <em>lower than men</em>, holding age and BMI constant. The reference category (Male) does not appear in the table — its coefficient is implicitly zero.
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.text }}>How to find the reference category:</strong> JMP labels the comparison category in brackets — "Sex [Female]" means Female is being compared to the omitted category (Male). If a variable has three or more categories (e.g., race/ethnicity), one group is omitted and all others are compared to it.
          </div>
        </div>
      </Section>

      {/* 6. Common mistakes */}
      <Section icon="!" iconBg={C.coralSoft} title="Common Mistakes">
        <div style={{ paddingTop: 20 }}>
          {[
            {
              wrong: 'Treating the coefficient as a correlation.',
              right: 'A regression estimate depends on the scale of the predictor. A coefficient of 2.1 for BMI (in kg/m²) and 0.063 for age (in years) cannot be compared directly — they are on different scales. Standardized coefficients or effect sizes are needed for comparison.',
            },
            {
              wrong: 'Interpreting a non-significant coefficient as "no effect."',
              right: 'A non-significant p-value means the data are insufficient to rule out chance, not that the true coefficient is zero. The estimate may still be meaningful — the study may simply have been underpowered to detect it.',
            },
            {
              wrong: 'Reporting logistic regression estimates without exponentiating them.',
              right: 'The estimate from logistic regression is a log odds ratio. It must be exponentiated to produce an odds ratio, which is what most readers expect. Reporting the estimate without the odds ratio is incomplete.',
            },
            {
              wrong: 'Ignoring the reference category for categorical predictors.',
              right: 'Every categorical coefficient is a comparison — Female vs. Male, Black vs. White, Treatment vs. Control. Interpreting "Sex [Female] = −3.8" without naming the reference group (Male) is ambiguous and incomplete.',
            },
            {
              wrong: 'Assuming that a statistically significant predictor is the most important predictor.',
              right: 'Statistical significance depends on both effect size and sample size. In a large study, a tiny effect can be highly significant. Compare coefficients on the same scale, or use standardized effect measures, to assess relative importance.',
            },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 14, padding: '14px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                <span style={{ color: C.coral, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>✗</span>
                <div style={{ fontSize: 13, color: C.coral, fontStyle: 'italic', lineHeight: 1.6 }}>{item.wrong}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: C.green, fontWeight: 700, fontSize: 15, flexShrink: 0 }}>✓</span>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{item.right}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Closing bridge */}
      <div style={{ marginTop: 20, padding: '14px 16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
        <strong style={{ color: C.text }}>Connecting regression to what you have already learned:</strong> The p-values in a regression table follow the same logic as any hypothesis test — they test whether the estimate is different from 0. The confidence intervals work the same way as the CI Builder. The study design affects what you can conclude: a significant coefficient in an observational study shows association, not causation. Regression helps estimate associations, but it does not change what the study design allows you to conclude. A statistically significant estimate in an observational study still shows association, not causation.
      </div>
    </div>
  )
}
