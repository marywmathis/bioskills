import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Design definitions ──
const DESIGNS = {
  crossSectional: {
    id: 'crossSectional',
    name: 'Cross-Sectional',
    color: C.teal,
    soft: C.tealSoft,
    tagline: 'A snapshot of a population at one point in time.',
    selection: 'A sample from the general population, with no selection based on exposure or outcome status.',
    timeline: 'Single point in time — exposure and outcome measured simultaneously.',
    bestFor: 'Estimating prevalence of disease or risk factors. Useful for surveillance and generating hypotheses.',
    limitation: 'Cannot establish temporality — you cannot determine which came first, the exposure or the outcome.',
    paperPhrases: [
      '"A nationally representative survey assessed..."',
      '"Data were collected from participants at a single clinic visit."',
      '"Prevalence of hypertension was estimated from..."',
      '"Cross-sectional data were obtained from..."',
    ],
    classicExample: 'Behavioral Risk Factor Surveillance System (BRFSS) — annual telephone survey estimating obesity, smoking, and chronic disease prevalence across U.S. states.',
    clues: ['Exposure and outcome measured at the same time', 'No follow-up period', 'Reports prevalence (not incidence)', 'Words like "survey," "at baseline," "at the time of enrollment"'],
  },
  caseControl: {
    id: 'caseControl',
    name: 'Case-Control',
    color: C.coral,
    soft: C.coralSoft,
    tagline: 'Start with people who already have the disease; look backward at their exposures.',
    selection: 'Cases are selected because they already have the outcome. Controls are selected because they do not.',
    timeline: 'Retrospective — researchers look backward at past exposures after the outcome has occurred.',
    bestFor: 'Rare diseases or outcomes with long latency. Efficient when disease is uncommon.',
    limitation: 'Susceptible to recall bias — cases may remember past exposures differently than controls. Cannot calculate incidence.',
    paperPhrases: [
      '"We identified 250 patients with colorectal cancer and 250 matched controls..."',
      '"Cases were defined as individuals with a new diagnosis of..."',
      '"Controls were matched on age and sex to cases..."',
      '"Participants were asked to recall their exposure history..."',
    ],
    classicExample: 'Doll and Hill (1950) — identified lung cancer patients and matched controls, then asked about past smoking history. Established the smoking–lung cancer link.',
    clues: ['Selected based on disease status (cases vs. controls)', 'Looks backward at past exposures', 'Reports odds ratios, not risk ratios', 'Words like "cases," "controls," "matched," "recall"'],
  },
  prospectiveCohort: {
    id: 'prospectiveCohort',
    name: 'Prospective Cohort',
    color: C.purple,
    soft: C.purpleSoft,
    tagline: 'Enroll people before disease occurs; follow them forward to see who develops it.',
    selection: 'Participants enrolled free of the outcome of interest. Groups defined by exposure status at enrollment.',
    timeline: 'Prospective — researchers enroll participants now and collect new data going forward over time.',
    bestFor: 'Establishing temporality (exposure precedes outcome). Estimating incidence and relative risk.',
    limitation: 'Expensive and time-consuming. Loss to follow-up can bias results.',
    paperPhrases: [
      '"Participants were enrolled in 2015 and followed for 10 years."',
      '"At baseline, participants were free of cardiovascular disease."',
      '"Incident cases of diabetes were identified during follow-up."',
      '"Exposure was assessed at enrollment and updated every two years."',
    ],
    classicExample: "Nurses' Health Study — enrolled 121,700 registered nurses in 1976, free of cancer, and has followed them ever since to study diet, lifestyle, and chronic disease.",
    clues: ['Enrolled before outcome occurred', 'Followed forward over time', 'Exposure measured first, outcome observed later', 'Words like "enrolled," "followed," "incident," "at baseline"'],
  },
  retrospectiveCohort: {
    id: 'retrospectiveCohort',
    name: 'Retrospective Cohort',
    color: C.amber,
    soft: C.amberSoft,
    tagline: 'Same logic as prospective cohort — but using existing records instead of new data collection.',
    selection: 'Groups defined by past exposure status using existing records. Outcome also ascertained from records.',
    timeline: 'Retrospective — the exposure and outcome have already occurred; researchers use existing data.',
    bestFor: 'When prospective follow-up would take too long or cost too much, and good records already exist.',
    limitation: 'Entirely dependent on record quality. Cannot control for variables not recorded at the time.',
    paperPhrases: [
      '"We used electronic health records to identify workers exposed to..."',
      '"Employment records from 1990–2010 were used to classify exposure."',
      '"Cancer diagnoses were ascertained from the state registry."',
      '"A historical cohort was assembled using occupational records."',
    ],
    classicExample: 'Occupational cohort studies — using company employment records to identify workers exposed to asbestos, then linking to cancer registries to assess mesothelioma risk.',
    clues: ['Groups defined by past exposure from records', 'Outcome also from records', 'No new data collected going forward', 'Words like "records," "historical," "registry," "retrospective cohort"'],
  },
  parallelRCT: {
    id: 'parallelRCT',
    name: 'Randomized Controlled Trial (Parallel)',
    color: C.green,
    soft: C.greenSoft,
    tagline: 'Randomly assign participants to treatment or control; compare outcomes between the two groups.',
    selection: 'Eligible participants randomly assigned to one arm (treatment or control). Each participant in only one group.',
    timeline: 'Prospective — participants assigned and followed forward from randomization.',
    bestFor: 'Testing interventions when random assignment is ethical. Provides the strongest evidence for causation.',
    limitation: 'Expensive. Cannot be used when exposure is harmful. Results may not generalize beyond the trial population.',
    paperPhrases: [
      '"Participants were randomly assigned in a 1:1 ratio to..."',
      '"The trial was double-blind and placebo-controlled."',
      '"Randomization was stratified by age and sex."',
      '"The primary endpoint was assessed at 12 months post-randomization."',
    ],
    classicExample: 'COVID-19 vaccine trials — participants randomly assigned to vaccine or placebo; followed for symptomatic COVID-19. Established vaccine efficacy.',
    clues: ['Random assignment explicitly stated', 'Two (or more) separate groups', 'Each participant in only one group', 'Words like "randomized," "assigned," "placebo," "double-blind"'],
  },
  crossoverRCT: {
    id: 'crossoverRCT',
    name: 'Randomized Controlled Trial (Crossover)',
    color: C.green,
    soft: C.greenSoft,
    tagline: 'Each participant receives both treatments in sequence; order is randomized.',
    selection: 'Same participants receive both treatment and control, separated by a washout period. Order randomized.',
    timeline: 'Prospective, with two (or more) periods — treatment period, washout, then control period (or vice versa).',
    bestFor: 'Stable chronic conditions where treatment effects are reversible. Each participant serves as their own control.',
    limitation: 'Carryover effects — the first treatment may affect response to the second. Not suitable for acute or progressive conditions.',
    paperPhrases: [
      '"In a crossover design, participants received both treatments in random order."',
      '"A two-week washout period separated the two treatment periods."',
      '"Each participant served as their own control."',
      '"The order of treatment assignment was randomized."',
    ],
    classicExample: 'Blood pressure medication comparison — same hypertensive patients receive Drug A for 8 weeks, washout, then Drug B for 8 weeks. Order randomized.',
    clues: ['Same participants in both conditions', 'Washout period mentioned', '"Crossover" or "each participant served as own control"', 'Two study periods described'],
  },
}

// ── Comparison table data ──
const TABLE_ROWS = [
  { design: 'Cross-Sectional', startsWith: 'Population sample', direction: 'None (snapshot)', incidence: 'No', rareDisease: 'Poor', rareExposure: 'OK', color: C.teal },
  { design: 'Case-Control', startsWith: 'Cases + controls', direction: 'Backward', incidence: 'No', rareDisease: 'Excellent', rareExposure: 'Poor', color: C.coral },
  { design: 'Prospective Cohort', startsWith: 'Exposed + unexposed', direction: 'Forward', incidence: 'Yes', rareDisease: 'Poor', rareExposure: 'Good', color: C.purple },
  { design: 'Retrospective Cohort', startsWith: 'Exposed + unexposed (records)', direction: 'Backward (via records)', incidence: 'Yes', rareDisease: 'OK', rareExposure: 'Good', color: C.amber },
  { design: 'Parallel RCT', startsWith: 'Eligible participants', direction: 'Forward', incidence: 'Yes', rareDisease: 'Poor', rareExposure: 'N/A (assigned)', color: C.green },
  { design: 'Crossover RCT', startsWith: 'Eligible participants', direction: 'Forward (two periods)', incidence: 'Yes', rareDisease: 'Poor', rareExposure: 'N/A (assigned)', color: C.green },
]

// ── Practice paragraphs ──
const PRACTICE = [
  {
    id: 'p1',
    text: 'Researchers enrolled 3,800 adults free of cardiovascular disease in 2010. Smoking status was recorded at enrollment using a questionnaire. Participants were followed for 12 years, during which new heart attacks were identified through medical records.',
    answer: 'prospectiveCohort',
    clueMap: [
      { phrase: 'enrolled 3,800 adults free of cardiovascular disease', clue: 'Enrolled before outcome occurred' },
      { phrase: 'Smoking status was recorded at enrollment', clue: 'Exposure measured first' },
      { phrase: 'followed for 12 years', clue: 'Followed forward over time' },
      { phrase: 'new heart attacks were identified', clue: 'Incident outcome observed later' },
    ],
  },
  {
    id: 'p2',
    text: 'A research team identified 180 patients recently diagnosed with mesothelioma at three regional hospitals. For each case, they selected two controls without mesothelioma, matched on age and sex. Both groups were interviewed about their occupational history and asbestos exposure over the preceding 40 years.',
    answer: 'caseControl',
    clueMap: [
      { phrase: 'identified 180 patients recently diagnosed with mesothelioma', clue: 'Selected because they already have the outcome' },
      { phrase: 'selected two controls without mesothelioma', clue: 'Controls selected because they do not have the outcome' },
      { phrase: 'matched on age and sex', clue: 'Matching is a hallmark of case-control' },
      { phrase: 'interviewed about their occupational history over the preceding 40 years', clue: 'Looking backward at past exposures' },
    ],
  },
  {
    id: 'p3',
    text: 'To estimate the prevalence of undiagnosed hypertension, researchers administered blood pressure measurements and a health survey to 5,200 adults attending community health fairs across Georgia. All data were collected on the same day.',
    answer: 'crossSectional',
    clueMap: [
      { phrase: 'estimate the prevalence', clue: 'Goal is prevalence, not incidence' },
      { phrase: 'All data were collected on the same day', clue: 'Single point in time — no follow-up' },
      { phrase: 'blood pressure measurements and a health survey', clue: 'Exposure and outcome measured simultaneously' },
    ],
  },
]

// ── Not sure explainers ──
const NOT_SURE = {
  q1: {
    title: 'How to tell if researchers assigned the exposure',
    content: 'Look for words like randomized, assigned, intervention, trial, or placebo. If the researchers decided who received the treatment — rather than simply observing what participants did naturally — the study is experimental. If participants were simply observed in their natural setting, choose No.',
  },
  q2: {
    title: 'How to tell how participants were selected',
    content: 'Ask: why was this particular person included in the study? If they were recruited because they already had the disease (cases) or because they did not (controls), that is case-control. If they were recruited regardless of disease status and then followed over time, that is cohort. If everyone was measured once at the same time, that is cross-sectional.',
  },
  q3: {
    title: 'How to tell if participants were followed over time',
    content: 'Look for phrases like "followed for X years," "incident cases identified during follow-up," or "participants were contacted annually." If participants were measured only once, it is cross-sectional. If they were tracked from enrollment to an outcome, it is cohort.',
  },
  q3b: {
    title: 'How to tell prospective from retrospective cohort',
    content: 'Prospective: researchers enrolled participants now and collected new data going forward. Retrospective: researchers used existing records (medical records, employment files, registries) to reconstruct what happened in the past. The key question is whether new data were collected or existing records were used.',
  },
  q4: {
    title: 'How to tell parallel from crossover RCT',
    content: 'Parallel: each participant is assigned to only one treatment group. Crossover: each participant receives both treatments in sequence, with a washout period in between. Look for phrases like "each participant served as their own control" or "a washout period separated the two treatment periods."',
  },
}

// ── Result card ──
function ResultCard({ designId, onRestart }) {
  const d = DESIGNS[designId]
  if (!d) return null
  return (
    <div>
      <div style={{ padding: '16px 18px', background: d.soft, border: `2px solid ${d.color}`, borderRadius: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: d.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Study design identified</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: d.color, marginBottom: 8 }}>{d.name}</div>
        <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.6, fontStyle: 'italic' }}>{d.tagline}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { label: 'How participants were selected', val: d.selection, color: d.color },
          { label: 'Timeline', val: d.timeline, color: d.color },
          { label: 'Best used for', val: d.bestFor, color: C.green },
          { label: 'Main limitation', val: d.limitation, color: C.coral },
        ].map((item, i) => (
          <div key={i} style={{ padding: '11px 13px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{item.val}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Typical wording in published papers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {d.paperPhrases.map((phrase, i) => (
            <div key={i} style={{ fontSize: 13, color: C.dim, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.5 }}>{phrase}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 14px', background: d.soft, border: `1px solid ${d.color}33`, borderRadius: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: d.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Classic example</div>
        <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>{d.classicExample}</div>
      </div>

      <button onClick={onRestart} style={{ width: '100%', padding: '11px 0', background: d.color, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
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
    if (DESIGNS[next]) { setResult(next); setStep('result') }
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
      q: 'Did the researchers assign the exposure or treatment?',
      hint: 'Look at the Methods section — specifically how participants were recruited and what was done to them.',
      options: [
        { label: 'Yes — researchers decided who received the treatment', sub: 'Randomization, intervention, or treatment assignment', next: 'q4' },
        { label: 'No — participants were observed in their natural setting', sub: 'No assignment; researchers just watched what happened', next: 'q2' },
      ],
      ns: 'q1',
    },
    q2: {
      q: 'How were participants selected for the study?',
      hint: 'Ask: why was each person included?',
      options: [
        { label: 'Selected because they already had the disease or outcome', sub: 'Cases and controls identified after the outcome occurred', next: 'caseControl' },
        { label: 'Selected before the outcome was known — based on exposure status or general eligibility', sub: 'Then followed over time', next: 'q3' },
        { label: 'Everyone measured once at a single point in time', sub: 'No selection based on exposure or outcome', next: 'crossSectional' },
      ],
      ns: 'q2',
    },
    q3: {
      q: 'Were participants followed over time after enrollment?',
      hint: 'Look for phrases like "followed for X years" or "incident cases identified during follow-up."',
      options: [
        { label: 'Yes — participants were followed forward from enrollment to the outcome', next: 'q3b' },
        { label: 'No — exposure and outcome measured at the same visit or time point', next: 'crossSectional' },
      ],
      ns: 'q3',
    },
    q3b: {
      q: 'How were data collected?',
      hint: 'Were researchers collecting new information, or using records that already existed?',
      options: [
        { label: 'Researchers enrolled participants and collected new data going forward', sub: 'Questionnaires, exams, labs taken at enrollment and follow-up', next: 'prospectiveCohort' },
        { label: 'Researchers used existing records to reconstruct what happened', sub: 'Medical records, employment files, registries', next: 'retrospectiveCohort' },
      ],
      ns: 'q3b',
    },
    q4: {
      q: 'What was the trial structure?',
      hint: 'Did each participant receive one treatment, or did participants receive both treatments in sequence?',
      options: [
        { label: 'Two (or more) separate groups — each participant in only one group', sub: 'Treatment group and control group run in parallel', next: 'parallelRCT' },
        { label: 'Same participants received both treatments in sequence', sub: 'With a washout period in between', next: 'crossoverRCT' },
      ],
      ns: 'q4',
    },
  }

  if (step === 'result') return <ResultCard designId={result} onRestart={restart} />

  const current = questions[step]
  if (!current) return null

  return (
    <div>
      {history.length > 0 && (
        <button onClick={back} style={{ fontSize: 12, color: C.dim, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14 }}>← Back</button>
      )}
      <div style={{ background: C.alt, borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Question {history.length + 1}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5, marginBottom: 6 }}>{current.q}</div>
        <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>{current.hint}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        {current.options.map((opt, i) => (
          <button key={i} onClick={() => go(opt.next)}
            style={{ textAlign: 'left', padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.purple; e.currentTarget.style.background = C.purpleSoft }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: opt.sub ? 3 : 0 }}>{opt.label}</div>
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
function PracticeSection() {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [showClues, setShowClues] = useState(false)
  const sc = PRACTICE[idx]
  const answered = picked !== null
  const correct = picked === sc.answer

  function next() { setIdx(i => (i + 1) % PRACTICE.length); setPicked(null); setShowClues(false) }

  return (
    <div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Paragraph {idx + 1} of {PRACTICE.length}</div>
      <div style={{ padding: '14px 16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 14, fontSize: 14, color: C.text, lineHeight: 1.75, fontStyle: 'italic' }}>
        "{sc.text}"
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Which study design is this?</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {Object.values(DESIGNS).map(d => {
          const isPicked = picked === d.id
          const isCorrect = d.id === sc.answer
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (isCorrect) { bg = d.soft; border = d.color; color = d.color }
            else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={d.id} onClick={() => !answered && setPicked(d.id)} disabled={answered}
              style={{ padding: '9px 12px', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 12, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
              {d.name}
              {answered && isCorrect && <span style={{ float: 'right' }}>✓</span>}
              {answered && isPicked && !isCorrect && <span style={{ float: 'right', color: C.coral }}>✗</span>}
            </button>
          )
        })}
      </div>

      {answered && (
        <div>
          <div style={{ padding: '12px 14px', background: correct ? C.tealSoft : C.coralSoft, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
            <strong style={{ color: correct ? C.teal : C.coral }}>{correct ? 'Correct.' : `Not quite — this is a ${DESIGNS[sc.answer].name}.`}</strong>
            {' '}{DESIGNS[sc.answer].tagline}
          </div>

          <button onClick={() => setShowClues(v => !v)} style={{ fontSize: 12, color: C.purple, background: 'none', border: `1px solid rgba(107,63,204,0.3)`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: showClues ? 10 : 0 }}>
            {showClues ? 'Hide' : 'Show the clues in this paragraph →'}
          </button>

          {showClues && (
            <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Clues that identify this design</div>
              {sc.clueMap.map((item, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.purple, marginBottom: 2 }}>"{item.phrase}"</div>
                  <div style={{ fontSize: 12, color: C.dim, paddingLeft: 8 }}>→ {item.clue}</div>
                </div>
              ))}
            </div>
          )}

          <button onClick={next} style={{ width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Next paragraph →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main ──
export default function StudyDesignHelper() {
  const [showTable, setShowTable] = useState(false)

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Which Study Design?</div>
      <div style={s.pageSub}>
        You are not choosing the best design. You are acting like a detective. Read the methods section and answer a few questions about what the researchers actually did.
      </div>

      {/* Opener */}
      <div style={{ padding: '14px 16px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 10, marginBottom: 20, fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
        <strong style={{ color: C.teal }}>How to use this tool:</strong> Open the methods section of the paper you're reading. Work through the questions below. By the end, you'll have identified the study design — and the reasoning that got you there.
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setShowTable(v => !v)} style={{ fontSize: 12, color: C.teal, background: 'none', border: `1px solid rgba(0,153,168,0.3)`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {showTable ? 'Hide' : 'See all six designs side-by-side →'}
          </button>
        </div>
      </div>

      {/* Comparison table */}
      {showTable && (
        <div style={{ marginBottom: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.alt }}>
                {['Design', 'Starts with', 'Time direction', 'Estimates incidence?', 'Good for rare disease?', 'Good for rare exposure?'].map((h, i) => (
                  <th key={i} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10, borderBottom: `2px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.surface : C.alt, borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '9px 12px', fontWeight: 700, color: row.color }}>{row.design}</td>
                  <td style={{ padding: '9px 12px', color: C.dim }}>{row.startsWith}</td>
                  <td style={{ padding: '9px 12px', color: C.dim }}>{row.direction}</td>
                  <td style={{ padding: '9px 12px', color: row.incidence === 'Yes' ? C.green : C.coral, fontWeight: 600 }}>{row.incidence}</td>
                  <td style={{ padding: '9px 12px', color: row.rareDisease === 'Excellent' ? C.green : row.rareDisease === 'Poor' ? C.coral : C.amber, fontWeight: 600 }}>{row.rareDisease}</td>
                  <td style={{ padding: '9px 12px', color: row.rareExposure === 'Good' ? C.green : row.rareExposure === 'Poor' ? C.coral : C.dim, fontWeight: 600 }}>{row.rareExposure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Walkthrough */}
      <Section icon="→" iconBg={C.purpleSoft} title="Decision Walkthrough" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <Walkthrough />
        </div>
      </Section>

      {/* Practice */}
      <Section icon="▶" iconBg={C.tealSoft} title="Practice — Identify the Design from a Methods Paragraph">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Read the methods paragraph as if it came from a published paper. Identify the study design, then reveal the clues.</p>
          <PracticeSection />
        </div>
      </Section>

      {/* Common mistakes */}
      <Section icon="!" iconBg={C.coralSoft} title="Common Mistakes">
        <div style={{ paddingTop: 20 }}>
          {[
            {
              wrong: 'Calling a cross-sectional study "prospective" because it involved a large number of participants or was conducted recently.',
              right: 'Sample size and recency have nothing to do with study design. Cross-sectional means exposure and outcome were measured at the same time — no follow-up, no temporal sequence.',
            },
            {
              wrong: 'Confusing retrospective cohort with case-control because both "look backward."',
              right: 'The distinction is how participants were selected. Retrospective cohort: selected based on exposure (exposed vs. unexposed), then records checked for outcomes. Case-control: selected based on outcome (cases vs. controls), then exposures asked about. Looking backward in time is not what makes something case-control.',
            },
            {
              wrong: 'Assuming "randomized" means any study where different people received different treatments.',
              right: 'Randomized means the researchers used a random mechanism to assign participants to groups. Patients naturally receiving different treatments — by physician preference, insurance, or personal choice — is observational, not randomized.',
            },
            {
              wrong: 'Thinking observational studies can never suggest causation.',
              right: 'Observational studies cannot establish causation the way RCTs can, but strong observational evidence (large effects, dose-response, biological plausibility, consistent replication) can support causal inference. This is how we know smoking causes lung cancer.',
            },
            {
              wrong: 'Assuming RCT is always the best or "right" answer.',
              right: 'RCTs are often ethically impossible (you cannot randomize people to smoke), logistically impractical (following participants for 30 years), or poorly generalizable (strict eligibility criteria). The best design is the strongest one that is both ethical and feasible.',
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

      {/* Cross-link */}
      <div style={{ marginTop: 20, padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
        <strong style={{ color: C.text }}>Want to go deeper?</strong> The <span style={{ color: C.amber, fontWeight: 600 }}>Study Design Selector</span> tool walks through the conceptual reasoning behind each design — not just identification, but why each design fits (or fails) for a given research question.
      </div>
    </div>
  )
}
