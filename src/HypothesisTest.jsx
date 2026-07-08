import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Test definitions ──
const TESTS = {
  oneSampleT: { name: 'One-sample t-test', group: 'Comparing a mean to a known value' },
  independentT: { name: 'Independent samples t-test', group: 'Comparing means' },
  pairedT: { name: 'Paired t-test', group: 'Comparing means' },
  anova: { name: 'One-way ANOVA', group: 'Comparing means' },
  mannWhitney: { name: 'Mann-Whitney U test', group: 'Comparing rankings' },
  wilcoxon: { name: 'Wilcoxon signed-rank test', group: 'Comparing rankings' },
  kruskalWallis: { name: 'Kruskal-Wallis test', group: 'Comparing rankings' },
  chiSquare: { name: 'Chi-square test', group: 'Comparing proportions or counts' },
  twoPropZ: { name: 'Two-proportion z-test', group: 'Comparing proportions or counts' },
}

// ── Q1 options ──
const Q1_OPTS = [
  { val: 'continuous', label: 'A number', sub: 'e.g., blood pressure, weight, cholesterol, age' },
  { val: 'ordinal', label: 'A ranking or rating', sub: 'e.g., pain scale, Likert response, cancer stage' },
  { val: 'categorical', label: 'A category', sub: 'e.g., yes/no, disease/no disease, blood type' },
]

// ── Q2 options — dynamic based on scenario ──
function getQ2Opts(scenario) {
  return [
    { val: 'one', label: 'One set of measurements', sub: 'Compared to a known or historical value' },
    { val: 'two', label: 'Two sets of measurements', sub: scenario?.q2example || 'e.g., treatment vs. control, before vs. after' },
    { val: 'many', label: 'More than two sets of measurements', sub: 'e.g., three treatment arms, four age groups' },
  ]
}

// ── Q3 options ──
const Q3_OPTS = [
  { val: 'paired', label: 'Yes — same people measured twice (or matched pairs)', sub: 'e.g., before/after, matched siblings' },
  { val: 'independent', label: 'No — different people in each group', sub: 'e.g., two separate treatment groups' },
]

// ── Decision logic ──
function getTest(outcome, groups, design) {
  if (outcome === 'continuous') {
    if (groups === 'one') return 'oneSampleT'
    if (groups === 'two') return design === 'paired' ? 'pairedT' : 'independentT'
    if (groups === 'many') return 'anova'
  }
  if (outcome === 'ordinal') {
    if (groups === 'two') return design === 'paired' ? 'wilcoxon' : 'mannWhitney'
    if (groups === 'many') return 'kruskalWallis'
  }
  if (outcome === 'categorical') {
    if (groups === 'two' && design === 'independent') return 'twoPropZ'
    return 'chiSquare'
  }
  return null
}

// ── Q1 feedback ──
function q1Why(val, scenario) {
  const map = {
    continuous: 'Blood pressure, weight, cholesterol, and similar measurements fall on a numerical scale where differences are meaningful. That makes them continuous — and tells us we need a test designed for continuous outcomes.',
    ordinal: 'Ratings and rankings have a meaningful order but unequal spacing between levels. That makes them ordinal — and points us toward nonparametric tests that don\'t assume equal intervals.',
    categorical: 'Yes/no, diseased/healthy, vaccinated/not vaccinated — these are categories, not measurements. That tells us we need a test designed for counts and proportions.',
  }
  return scenario?.q1why?.[val] || map[val]
}

// ── Q2 feedback ──
function q2Why(val, design) {
  const map = {
    one: 'With only one group and one measurement, we\'re comparing a sample estimate to a known or assumed population value — not comparing two sets of measurements against each other.',
    two: design === 'paired'
      ? 'There is one group of participants, but two measurements are being compared — one from each time point or condition. That makes this a two-measurement comparison. The next question asks whether those measurements are linked person-by-person (paired) or from different people (independent).'
      : 'There are two separate groups being compared. The next question determines whether the people in those groups are different individuals (independent) or the same individuals measured twice (paired).',
    many: 'More than two groups or measurement sets means we need a test that handles multiple comparisons simultaneously — to avoid inflating the false positive rate.',
  }
  return map[val]
}

// ── Q3 feedback ──
function q3Why(val) {
  const map = {
    paired: 'The same people appear in both measurements (or each person is matched with a specific partner). That within-person pairing reduces variability and requires a paired test.',
    independent: 'Each person appears in only one group. The groups are separate and unrelated — which is the standard independent-samples situation.',
  }
  return map[val]
}

// ── Wrong answer feedback ──
function q1Wrong(chosen, correct) {
  if (chosen === 'continuous' && correct === 'ordinal') return 'The values look like numbers, but ask: are the intervals between values truly equal? A pain rating of 3 isn\'t guaranteed to be "twice as painful" as a rating of 6. Unequal spacing → ordinal.'
  if (chosen === 'continuous' && correct === 'categorical') return 'The outcome here is a category — not a measured quantity. Disease status (yes/no) can\'t be averaged, which means it\'s categorical, not continuous.'
  if (chosen === 'ordinal' && correct === 'continuous') return 'This measurement has equal, meaningful intervals — a difference of 10 mmHg means the same thing anywhere on the scale. That makes it continuous, not ordinal.'
  if (chosen === 'categorical' && correct === 'continuous') return 'This is a measured quantity on a numerical scale, not a category. Even though it can be categorized later, the raw measurement is continuous.'
  return 'Think about the nature of the measurement: is it a number with equal intervals, an ordered ranking, or a category with no implied order?'
}

function q3Wrong(chosen) {
  if (chosen === 'paired') return 'Think about the participants: is each person measured once, or are the same people measured twice? If different people are in each group, that\'s independent — even if the groups are similar in size or characteristics.'
  return 'Think about the participants: if the same person appears in both measurements (before/after, or matched with a partner), that\'s paired — the measurements are linked at the individual level.'
}

// ── Scenarios ──
const SCENARIOS = [
  {
    id: 1,
    q: 'Researchers compare mean systolic blood pressure between patients taking Drug A and patients taking Drug B. Each patient takes only one drug.',
    q2example: 'e.g., Drug A patients vs. Drug B patients',
    outcome: 'continuous',
    groups: 'two',
    design: 'independent',
    test: 'independentT',
    context: { outcome: 'Systolic blood pressure is measured in mmHg — a numerical scale with equal intervals.', groups: 'Two groups: Drug A patients and Drug B patients.', design: 'Each patient takes only one drug, so the groups contain different people.' },
    q1why: { continuous: 'Systolic blood pressure is measured in mmHg — a numerical scale with equal intervals. A difference of 10 mmHg means the same thing anywhere on the scale.' },
    testExplain: 'Blood pressure is continuous, there are two groups, and different people are in each group. An independent samples t-test compares the means of two unrelated groups.',
    scaffold: 'full',
  },
  {
    id: 2,
    q: 'A researcher measures pain scores (0–10 scale) before and after a new physical therapy protocol in 30 male and female patients.',
    q2example: 'e.g., before physical therapy vs. after physical therapy (same patients measured twice)',
    outcome: 'ordinal',
    groups: 'two',
    design: 'paired',
    test: 'wilcoxon',
    context: { outcome: 'Pain scores use a 0–10 rating scale — the gaps between values are not guaranteed to be equal.', groups: 'Two measurements: before and after treatment.', design: 'The same 30 patients are measured twice — before and after.' },
    q1why: { ordinal: 'Pain scores are ratings on a 0–10 scale. A change from 2 to 3 may not equal a change from 8 to 9. Unequal spacing → ordinal.' },
    testExplain: 'Pain scores are ordinal, and the same patients are measured twice (paired). The Wilcoxon signed-rank test is the paired nonparametric equivalent of the paired t-test.',
    scaffold: 'full',
  },
  {
    id: 3,
    q: 'A health department surveys 500 adults and records whether each person is vaccinated (yes/no). They want to compare vaccination rates between men and women.',
    q2example: 'e.g., men vs. women',
    outcome: 'categorical',
    groups: 'two',
    design: 'independent',
    test: 'twoPropZ',
    context: { outcome: 'Vaccinated yes/no is a dichotomous category — not a measurement.', groups: 'Two groups: men and women.', design: 'Men and women are separate groups — different people.' },
    q1why: { categorical: 'Vaccinated/not vaccinated is a binary category. We\'re counting how many in each group said yes — not measuring a quantity.' },
    testExplain: 'Vaccination status is categorical (yes/no), there are two independent groups (men and women), and we\'re comparing proportions. A two-proportion z-test compares the proportion vaccinated between two independent groups.',
    scaffold: 'full',
  },
  {
    id: 4,
    q: 'Researchers test a new cholesterol-lowering drug. Forty patients have their LDL cholesterol measured before taking the drug and again after 12 weeks.',
    q2example: 'e.g., before treatment vs. 12 weeks after treatment',
    outcome: 'continuous',
    groups: 'two',
    design: 'paired',
    test: 'pairedT',
    context: { outcome: 'LDL cholesterol is measured in mg/dL — a continuous scale.', groups: 'Two measurements: before and after treatment.', design: 'The same 40 patients are measured before and after.' },
    testExplain: 'LDL cholesterol is continuous, and the same patients are measured twice (before/after). A paired t-test accounts for the within-person correlation between the two measurements.',
    scaffold: 'combined',
  },
  {
    id: 5,
    q: 'A study compares self-rated health (Poor/Fair/Good/Very Good/Excellent) among adults from four different U.S. regions.',
    q2example: 'Four regions: Northeast, South, Midwest, West',
    outcome: 'ordinal',
    groups: 'many',
    design: 'independent',
    test: 'kruskalWallis',
    context: { outcome: 'Self-rated health is an ordered categorical scale — ordinal.', groups: 'Four groups: four U.S. regions.', design: 'Adults from different regions are different people — independent.' },
    testExplain: 'Self-rated health is ordinal, and there are more than two independent groups. The Kruskal-Wallis test is the nonparametric equivalent of one-way ANOVA for ordinal outcomes.',
    scaffold: 'combined',
  },
  {
    id: 6,
    q: 'A clinical trial randomizes 300 patients to one of three treatment arms: placebo, low-dose, or high-dose. The primary outcome is change in blood glucose (mg/dL).',
    q2example: 'Three arms: placebo, low-dose, high-dose',
    outcome: 'continuous',
    groups: 'many',
    design: 'independent',
    test: 'anova',
    context: { outcome: 'Blood glucose change is measured in mg/dL — continuous.', groups: 'Three groups: placebo, low-dose, high-dose.', design: 'Patients are randomized to one arm only — independent groups.' },
    testExplain: 'Blood glucose is continuous, and there are three independent groups. One-way ANOVA tests whether mean blood glucose differs across the three treatment arms simultaneously.',
    scaffold: 'combined',
  },
  {
    id: 7,
    q: 'Epidemiologists want to know if HIV status (positive/negative) is associated with homelessness status (yes/no) in a sample of 800 adults.',
    q2example: 'e.g., HIV+ vs. HIV− (or homeless vs. not homeless)',
    outcome: 'categorical',
    groups: 'two',
    design: 'independent',
    test: 'chiSquare',
    context: { outcome: 'HIV status and homelessness are both categorical (yes/no).', groups: 'Both variables are categorical (yes/no) — we are testing whether they are associated.', design: 'Different adults — independent observations.' },
    testExplain: 'Both variables are categorical. A chi-square test of independence assesses whether HIV status and homelessness status are associated in the population.',
    scaffold: 'independent',
  },
  {
    id: 8,
    q: 'Researchers compare mean weekly step counts among adults with normal weight, overweight, and obesity (three groups). Each participant is measured once.',
    q2example: 'Three groups: normal weight, overweight, obesity',
    outcome: 'continuous',
    groups: 'many',
    design: 'independent',
    test: 'anova',
    context: { outcome: 'Weekly step count is a continuous numerical measurement.', groups: 'Three groups based on BMI category.', design: 'Each adult belongs to one BMI category — independent.' },
    testExplain: 'Step count is continuous, and there are three independent groups. One-way ANOVA tests whether mean step counts differ significantly across the three BMI categories.',
    scaffold: 'independent',
  },
  {
    id: 9,
    q: 'A study follows 50 pairs of identical twins. One twin in each pair receives a dietary intervention; the other serves as control. Researchers compare weight loss (kg) between the two groups.',
    q2example: 'e.g., intervention twin vs. control twin (matched pairs)',
    outcome: 'continuous',
    groups: 'two',
    design: 'paired',
    test: 'pairedT',
    context: { outcome: 'Weight loss in kg is a continuous measurement.', groups: 'Two groups: intervention and control.', design: 'Each pair of twins is matched — the measurements are linked.' },
    testExplain: 'Weight loss is continuous, and each intervention twin is matched with a control twin (paired design). A paired t-test accounts for the genetic similarity within twin pairs.',
    scaffold: 'independent',
  },
]

// ── Challenge scenarios ──
const CHALLENGE_SCENARIOS = [
  { q: 'A nutritionist measures daily caloric intake in 120 adults before and after a 6-week nutrition program.', answer: 'pairedT', why: 'Continuous outcome (calories), two measurements, same people (paired) → Paired t-test.' },
  { q: 'Researchers compare cancer stage (I/II/III/IV) distribution between two hospitals.', answer: 'mannWhitney', why: 'Ordinal outcome (stage), two independent groups → Mann-Whitney U test.' },
  { q: 'A survey asks 1,000 adults whether they have hypertension. Researchers compare rates between smokers and non-smokers.', answer: 'twoPropZ', why: 'Categorical outcome (yes/no), two independent groups → Two-proportion z-test.' },
  { q: 'Researchers compare mean body temperature across five different infectious diseases in hospitalized patients.', answer: 'anova', why: 'Continuous outcome (temperature), more than two independent groups → One-way ANOVA.' },
  { q: 'A study compares physical activity levels (sedentary/lightly active/active/very active) between adults with and without diabetes.', answer: 'mannWhitney', why: 'Ordinal outcome (activity level), two independent groups → Mann-Whitney U test.' },
]

// ── Paired vs Independent visual ──
function PairedVisual() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div style={{ padding: '14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Independent groups</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          <div style={{ padding: '6px 10px', background: C.tealSoft, borderRadius: 6, fontSize: 13, color: C.teal, fontWeight: 600 }}>👤 Patient 1 → Drug A</div>
          <div style={{ padding: '6px 10px', background: C.tealSoft, borderRadius: 6, fontSize: 13, color: C.teal, fontWeight: 600 }}>👤 Patient 2 → Drug A</div>
          <div style={{ padding: '6px 10px', background: C.coralSoft, borderRadius: 6, fontSize: 13, color: C.coral, fontWeight: 600 }}>👤 Patient 3 → Drug B</div>
          <div style={{ padding: '6px 10px', background: C.coralSoft, borderRadius: 6, fontSize: 13, color: C.coral, fontWeight: 600 }}>👤 Patient 4 → Drug B</div>
        </div>
        <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>Different people in each group. Each person is measured once. No linking between groups.</div>
      </div>
      <div style={{ padding: '14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Paired (same person twice)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {['Patient 1', 'Patient 2', 'Patient 3'].map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ padding: '5px 8px', background: C.tealSoft, borderRadius: 5, fontSize: 12, color: C.teal, fontWeight: 600, flex: 1 }}>👤 {p} Before</div>
              <div style={{ fontSize: 14, color: C.amber }}>↓</div>
              <div style={{ padding: '5px 8px', background: C.coralSoft, borderRadius: 5, fontSize: 12, color: C.coral, fontWeight: 600, flex: 1 }}>👤 {p} After</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>Same person measured twice. Each before measurement is linked to an after measurement.</div>
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid rgba(184,112,0,0.15)` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Also paired: matched pairs</div>
          {['Pair 1', 'Pair 2', 'Pair 3'].map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
              <div style={{ padding: '4px 8px', background: C.tealSoft, borderRadius: 5, fontSize: 12, color: C.teal, fontWeight: 600, flex: 1 }}>👤 {p}: Twin A</div>
              <div style={{ fontSize: 14, color: C.amber }}>↔</div>
              <div style={{ padding: '4px 8px', background: C.coralSoft, borderRadius: 5, fontSize: 12, color: C.coral, fontWeight: 600, flex: 1 }}>👤 {p}: Twin B</div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6, marginTop: 6 }}>Pairing is about a one-to-one relationship — not just repeated measurements. Matched siblings, matched cases/controls, and matched recruits all qualify.</div>
        </div>
      </div>
    </div>
  )
}

// ── Option button ──
function OptionBtn({ opt, picked, correct, showFeedback, onClick }) {
  const isPicked = picked === opt.val
  const isCorrect = opt.val === correct
  let bg = C.surface, border = C.border, color = C.dim
  if (showFeedback) {
    if (isCorrect) { bg = C.greenSoft; border = C.green; color = C.green }
    else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
  } else if (isPicked) { bg = C.tealSoft; border = C.teal; color = C.teal }
  return (
    <button onClick={() => !showFeedback && onClick(opt.val)} disabled={showFeedback}
      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', marginBottom: 8, background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, cursor: showFeedback ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
      <strong>{opt.label}</strong>
      {opt.sub && <span style={{ display: 'block', fontSize: 11, color: showFeedback ? color : C.muted, marginTop: 2 }}>{opt.sub}</span>}
      {showFeedback && isCorrect && <span style={{ float: 'right', fontSize: 11, fontWeight: 700, color: C.green }}>✓</span>}
      {showFeedback && isPicked && !isCorrect && <span style={{ float: 'right', fontSize: 11, fontWeight: 700, color: C.coral }}>✗</span>}
    </button>
  )
}

// ── Reasoning trace ──
function ReasoningTrace({ outcome, groups, design, testId, scenario }) {
  const test = TESTS[testId]
  const steps = [
    { label: 'Research question', val: scenario.q, color: C.muted },
    { label: 'Outcome type', val: outcome === 'continuous' ? 'Continuous measurement' : outcome === 'ordinal' ? 'Ordinal / ranking' : 'Categorical', color: C.teal },
    { label: 'Sets of measurements', val: groups === 'one' ? 'One set' : groups === 'two' ? 'Two sets' : 'More than two sets', color: C.purple },
    ...(groups !== 'one' ? [{ label: 'Study design', val: design === 'paired' ? 'Paired / matched' : 'Independent', color: C.amber }] : []),
    { label: 'Test', val: test?.name, color: C.green, bold: true },
  ]
  return (
    <div style={{ marginTop: 14, padding: '14px 16px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Your reasoning path</div>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < steps.length - 1 ? 4 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: step.color, marginTop: 5 }} />
            {i < steps.length - 1 && <div style={{ width: 1, flex: 1, background: C.border, marginTop: 2 }} />}
          </div>
          <div style={{ paddingBottom: 8 }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>{step.label}</div>
            <div style={{ fontSize: 13, color: step.bold ? step.color : C.dim, fontWeight: step.bold ? 700 : 400, lineHeight: 1.5 }}>{step.val}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Guided scenario ──
function GuidedScenario({ scenario, onComplete }) {
  const [q1, setQ1] = useState(null)
  const [q2, setQ2] = useState(null)
  const [q3, setQ3] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const q2Opts = getQ2Opts(scenario)
  const scaffold = scenario.scaffold
  const showQ1Feedback = scaffold === 'full' ? q1 !== null : submitted && q1 !== null
  const showQ2Feedback = scaffold === 'full' ? q2 !== null : submitted && q2 !== null
  const showQ3Feedback = scaffold === 'full' ? q3 !== null : submitted && q3 !== null
  const q1Correct = q1 === scenario.outcome
  const q2Correct = q2 === scenario.groups
  const q3Correct = q3 === scenario.design

  const needsQ3 = scenario.groups !== 'one'
  const q1Done = q1 !== null
  const q2Done = q2 !== null
  const q3Done = !needsQ3 || q3 !== null
  const allDone = q1Done && q2Done && q3Done

  const canSubmit = scaffold !== 'full' && allDone && !submitted
  const testId = submitted || scaffold === 'full' ? getTest(scenario.outcome, scenario.groups, scenario.design) : null
  const showTest = scaffold === 'full' ? allDone : submitted
  const allCorrect = q1Correct && q2Correct && (!needsQ3 || q3Correct)

  return (
    <div>
      {/* Scenario */}
      <div style={{ background: C.alt, borderRadius: 10, padding: '14px 16px', marginBottom: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Research scenario</div>
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.65 }}>{scenario.q}</div>
        {scaffold === 'full' && <div style={{ marginTop: 8, fontSize: 12, color: C.teal, fontStyle: 'italic' }}>Answer each question — feedback appears after each one.</div>}
        {scaffold === 'combined' && <div style={{ marginTop: 8, fontSize: 12, color: C.amber, fontStyle: 'italic' }}>Answer all three questions, then submit for combined feedback.</div>}
        {scaffold === 'independent' && <div style={{ marginTop: 8, fontSize: 12, color: C.purple, fontStyle: 'italic' }}>Answer all three questions independently.</div>}
      </div>

      {/* Q1 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>1. What are you measuring?</div>
        {Q1_OPTS.map(opt => (
          <OptionBtn key={opt.val} opt={opt} picked={q1} correct={scenario.outcome} showFeedback={showQ1Feedback} onClick={setQ1} />
        ))}
        {showQ1Feedback && (
          <div style={{ padding: '10px 12px', background: q1Correct ? C.tealSoft : C.coralSoft, border: `1px solid ${q1Correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7, marginTop: 4 }}>
            {q1Correct ? q1Why(q1, scenario) : q1Wrong(q1, scenario.outcome)}
          </div>
        )}
      </div>

      {/* Q2 — show after Q1 answered (full) or always (combined/independent) */}
      {(scaffold !== 'full' || q1Done) && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>2. How many sets of measurements are being compared?</div>
          {q2Opts.map(opt => (
            <OptionBtn key={opt.val} opt={opt} picked={q2} correct={scenario.groups} showFeedback={showQ2Feedback} onClick={setQ2} />
          ))}
          {showQ2Feedback && (
            <div style={{ padding: '10px 12px', background: q2Correct ? C.tealSoft : C.coralSoft, border: `1px solid ${q2Correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7, marginTop: 4 }}>
              {q2Correct ? q2Why(q2, scenario.design) : q2 === 'one' && scenario.groups === 'two' && scenario.design === 'paired'
                ? `This is one group of participants, but it is not a one-sample comparison. We are comparing two measurements from that group: ${scenario.q2example || 'two sets of measurements'}. Choose "two sets of measurements."`
                : `Count the sets of measurements being compared in this study. ${scenario.q2example ? 'Here: ' + scenario.q2example + '.' : ''}`
              }
            </div>
          )}
        </div>
      )}

      {/* Q3 — only if 2+ groups */}
      {needsQ3 && (scaffold !== 'full' || q2Done) && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>3. Are these the same people measured twice (or matched pairs)?</div>
          {Q3_OPTS.map(opt => (
            <OptionBtn key={opt.val} opt={opt} picked={q3} correct={scenario.design} showFeedback={showQ3Feedback} onClick={setQ3} />
          ))}
          {showQ3Feedback && (
            <div style={{ padding: '10px 12px', background: q3Correct ? C.tealSoft : C.coralSoft, border: `1px solid ${q3Correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7, marginTop: 4 }}>
              {q3Correct ? q3Why(q3) : q3Wrong(q3)}
            </div>
          )}
        </div>
      )}

      {/* Submit button for combined/independent */}
      {canSubmit && (
        <button onClick={() => setSubmitted(true)}
          style={{ width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14 }}>
          Submit answers
        </button>
      )}

      {/* Test reveal */}
      {showTest && testId && (
        <div>
          <div style={{ padding: '14px 16px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.25)`, borderRadius: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              {allCorrect ? '✓ Correct reasoning →' : 'Based on your answers →'}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: C.green, marginBottom: 8 }}>{TESTS[testId]?.name}</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{scenario.testExplain}</div>
          </div>
          <ReasoningTrace outcome={scenario.outcome} groups={scenario.groups} design={scenario.design} testId={testId} scenario={scenario} />
          <button onClick={onComplete}
            style={{ marginTop: 14, width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Next scenario →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Challenge mode ──
function ChallengeMode() {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const sc = CHALLENGE_SCENARIOS[idx]
  const answered = picked !== null
  const correct = picked === sc?.answer

  function handlePick(id) {
    if (answered) return
    setPicked(id)
    if (id === sc.answer) setScore(s => s + 1)
  }

  function next() {
    if (idx < CHALLENGE_SCENARIOS.length - 1) { setIdx(i => i + 1); setPicked(null) }
    else setDone(true)
  }

  if (done) {
    const pct = Math.round(score / CHALLENGE_SCENARIOS.length * 100)
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: pct >= 80 ? C.green : pct >= 60 ? C.amber : C.coral, fontFamily: "'Space Grotesk', sans-serif" }}>{score}/{CHALLENGE_SCENARIOS.length}</div>
        <div style={{ fontSize: 15, color: C.dim, marginTop: 6, marginBottom: 20 }}>
          {pct >= 80 ? 'Test selection is clicking — you\'re reasoning, not pattern-matching.' : 'Review the reasoning traces from the guided section and try again.'}
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
        <span>Question {idx + 1} of {CHALLENGE_SCENARIOS.length}</span>
        <span>Score: <strong style={{ color: C.text }}>{score}</strong></span>
      </div>
      <div style={{ height: 4, background: C.alt, borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: '100%', width: `${(idx / CHALLENGE_SCENARIOS.length) * 100}%`, background: C.teal, borderRadius: 2 }} />
      </div>
      <div style={{ background: C.alt, borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Select the appropriate test</div>
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.65 }}>{sc.q}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {Object.entries(TESTS).map(([id, t]) => {
          const isPicked = picked === id
          const isCorrect = id === sc.answer
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (isCorrect) { bg = C.greenSoft; border = C.green; color = C.green }
            else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={id} onClick={() => handlePick(id)} disabled={answered}
              style={{ padding: '9px 12px', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 12, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
              {t.name}
              {answered && isCorrect && <span style={{ float: 'right' }}>✓</span>}
              {answered && isPicked && !isCorrect && <span style={{ float: 'right', color: C.coral }}>✗</span>}
            </button>
          )
        })}
      </div>
      {answered && (
        <div>
          <div style={{ padding: '10px 14px', background: correct ? C.tealSoft : C.coralSoft, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
            {correct ? <><strong style={{ color: C.teal }}>Correct.</strong> {sc.why}</> : <><strong style={{ color: C.coral }}>Not quite.</strong> {sc.why}</>}
          </div>
          <button onClick={next} style={{ width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {idx < CHALLENGE_SCENARIOS.length - 1 ? 'Next →' : 'See results'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ──
export default function HypothesisTest() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [showChallenge, setShowChallenge] = useState(false)
  const [keys, setKeys] = useState(SCENARIOS.map((_, i) => i))

  function handleComplete() {
    const next = scenarioIdx + 1
    if (next < SCENARIOS.length) {
      setScenarioIdx(next)
      setCompletedCount(c => c + 1)
    } else {
      setCompletedCount(SCENARIOS.length)
    }
  }

  const allDone = completedCount >= SCENARIOS.length

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Hypothesis Test Selector</div>
      <div style={s.pageSub}>
        The right statistical test is the consequence of three decisions. Make those decisions well and the test follows automatically.
      </div>

      {/* Three questions overview */}
      <Section icon="?" iconBg={C.tealSoft} title="The Three Questions to Ask First">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Every hypothesis test selection follows the same three questions, in the same order:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '1', q: 'What are you measuring?', sub: 'The outcome type determines the entire family of appropriate tests.', color: C.teal },
              { n: '2', q: 'How many sets of measurements are being compared?', sub: 'One set vs. a known value, two sets, or more than two sets.', color: C.purple },
              { n: '3', q: 'Are these the same people measured twice (or matched pairs)?', sub: 'Paired designs require paired tests — using an independent test when data are paired loses statistical power.', color: C.amber },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: item.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginTop: 14 }}>{item.n}</div>
                  {i < 2 && <div style={{ width: 2, flex: 1, background: C.border, minHeight: 16 }} />}
                </div>
                <div style={{ padding: '14px 14px 14px 4px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: item.color, marginBottom: 3 }}>{item.q}</div>
                  <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>The test is the consequence, not the starting point.</strong> Work through the three questions and the test follows from your answers — you shouldn't need to memorize a long list.
          </div>
        </div>
      </Section>

      {/* Guided practice */}
      <Section icon="▶" iconBg={C.purpleSoft} title="Guided Practice" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          {!allDone ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: C.muted }}>Scenario {scenarioIdx + 1} of {SCENARIOS.length}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {SCENARIOS.map((_, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < completedCount ? C.green : i === scenarioIdx ? C.teal : C.border }} />
                  ))}
                </div>
              </div>
              <GuidedScenario key={scenarioIdx} scenario={SCENARIOS[scenarioIdx]} onComplete={handleComplete} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: C.green, marginBottom: 8 }}>All 9 scenarios complete</div>
              <div style={{ fontSize: 14, color: C.dim, marginBottom: 20 }}>You've practiced the three-question reasoning chain across a range of study designs.</div>
              <button onClick={() => { setScenarioIdx(0); setCompletedCount(0) }}
                style={{ padding: '10px 20px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, cursor: 'pointer', fontFamily: 'inherit' }}>
                ↺ Start over
              </button>
            </div>
          )}
        </div>
      </Section>

      {/* Challenge mode — unlocks after all scenarios */}
      {allDone && (
        <Section icon="⚡" iconBg={C.coralSoft} title="Challenge Mode — Select the Test Directly" defaultOpen={true}>
          <div style={{ paddingTop: 20 }}>
            <p style={s.prose}>Now try selecting the test directly, without the guided questions. Use the reasoning chain you've practiced.</p>
            <ChallengeMode />
          </div>
        </Section>
      )}

      {/* Paired vs Independent visual */}
      <Section icon="↔" iconBg={C.amberSoft} title="Paired vs. Independent — The Most Common Confusion">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>The single most important question in test selection is whether the groups share a link at the individual level.</p>
          <PairedVisual />
          <div style={{ marginTop: 14, padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>The diagnostic question:</strong> Can you draw a line connecting a specific person in Group A to a specific person in Group B? If yes, the design is paired. If no, it's independent.
          </div>
        </div>
      </Section>

      {/* Reference table */}
      <Section icon="≡" iconBg={C.alt} title="Test Selection Reference Table">
        <div style={{ paddingTop: 20 }}>
          {[
            {
              group: 'Comparing means (continuous outcome)',
              color: C.teal,
              rows: [
                { situation: 'One group vs. a known value', test: 'One-sample t-test' },
                { situation: 'Two independent groups', test: 'Independent samples t-test' },
                { situation: 'Two paired / matched groups', test: 'Paired t-test' },
                { situation: 'Three or more independent groups', test: 'One-way ANOVA' },
              ],
            },
            {
              group: 'Comparing an ordinal outcome between groups',
              color: C.purple,
              rows: [
                { situation: 'Two independent groups', test: 'Mann-Whitney U test' },
                { situation: 'Two paired / matched groups', test: 'Wilcoxon signed-rank test' },
                { situation: 'Three or more independent groups', test: 'Kruskal-Wallis test' },
              ],
            },
            {
              group: 'Comparing proportions or counts (categorical outcome)',
              color: C.coral,
              rows: [
                { situation: 'Two independent groups', test: 'Two-proportion z-test' },
                { situation: 'Testing whether two categorical variables are associated (or comparing proportions across groups)', test: 'Chi-square test' },
                { situation: 'Very small expected cell counts', test: 'Fisher\'s exact test (special case of chi-square)' },
              ],
            },
          ].map((section, si) => (
            <div key={si} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: section.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{section.group}</div>
              <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', background: C.alt, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <span>Situation</span><span>Test</span>
                </div>
                {section.rows.map((row, ri) => (
                  <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', padding: '9px 12px', borderTop: `1px solid ${C.border}`, fontSize: 13, background: ri % 2 === 0 ? C.surface : C.alt }}>
                    <span style={{ color: C.dim }}>{row.situation}</span>
                    <span style={{ color: section.color, fontWeight: 600 }}>{row.test}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Common confusions */}
      <Section icon="!" iconBg={C.coralSoft} title="Common Confusions">
        <div style={{ paddingTop: 20 }}>
          {[
            {
              title: 'Continuous vs. categorical outcomes',
              wrong: '"Blood pressure" and "hypertension status" both relate to blood pressure — so the same test applies to both.',
              right: 'Blood pressure (mmHg) is continuous. Hypertension status (yes/no) is categorical. These require completely different tests. A t-test for a continuous outcome and a chi-square for a categorical outcome are not interchangeable, even when they study the same underlying health concept.',
            },
            {
              title: 'Paired vs. independent groups',
              wrong: 'Two groups of equal size must be paired.',
              right: 'Group size has nothing to do with whether samples are paired. Pairing requires a specific link between individual observations — the same person measured twice, matched twins, or similar one-to-one pairing. Two groups of 50 unrelated people are independent, not paired.',
            },
            {
              title: 't-test vs. Mann-Whitney',
              wrong: 'Always use a t-test for numerical data.',
              right: 'The t-test works best when the continuous outcome is approximately normally distributed within each group (or when samples are large enough for the Central Limit Theorem to apply). For ordinal data, or for small samples with clearly non-normal distributions, the Mann-Whitney U test is more appropriate. Ordinal data should always use nonparametric methods.',
            },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 14, padding: '14px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>{item.title}</div>
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
    </div>
  )
}
