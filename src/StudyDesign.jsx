import { useState } from 'react'
import { C, s, Section, Concept } from './utils'

// ── Design definitions ──
const DESIGNS = {
  crossSectional: {
    id: 'crossSectional',
    name: 'Cross-Sectional',
    color: C.teal,
    soft: C.tealSoft,
    border: 'rgba(0,153,168,0.25)',
    keyUse: 'Measuring how common a disease or risk factor is right now — a snapshot of the population at one point in time.',
    weakness: 'You cannot determine which came first — the exposure or the disease. Cannot establish temporality.',
    keyConceptLabel: 'Measures',
    keyConcept: 'Prevalence',
    icon: '📷',
  },
  caseControl: {
    id: 'caseControl',
    name: 'Case-Control',
    color: C.coral,
    soft: C.coralSoft,
    border: 'rgba(232,69,42,0.25)',
    keyUse: 'Studying rare diseases or conditions with long latency. Starts with the outcome and looks backward.',
    weakness: 'Cannot calculate incidence or relative risk directly. Susceptible to recall bias — cases may remember exposures differently than controls.',
    keyConceptLabel: 'Watch for',
    keyConcept: 'Recall bias; measures odds ratio, not risk',
    icon: '🔍',
  },
  prospectiveCohort: {
    id: 'prospectiveCohort',
    name: 'Prospective Cohort',
    color: C.purple,
    soft: C.purpleSoft,
    border: 'rgba(107,63,204,0.25)',
    keyUse: 'Following exposed and unexposed groups forward in time to see who develops disease. Best observational design for incidence and relative risk.',
    weakness: 'Expensive and time-consuming. Loss to follow-up can bias results. Cannot be used when exposure is unethical to assign.',
    keyConceptLabel: 'Measures',
    keyConcept: 'Incidence, RR — exposure first, then disease',
    icon: '→',
  },
  retrospectiveCohort: {
    id: 'retrospectiveCohort',
    name: 'Retrospective Cohort',
    color: C.amber,
    soft: C.amberSoft,
    border: 'rgba(184,112,0,0.25)',
    keyUse: 'Using existing records to compare disease outcomes between exposed and unexposed groups. Faster and cheaper than prospective designs.',
    weakness: 'Data quality depends entirely on historical records. Cannot control for variables that were not recorded. Still cannot establish causation.',
    keyConceptLabel: 'Key feature',
    keyConcept: 'Uses existing records; exposure already occurred',
    icon: '📁',
  },
  rct: {
    id: 'rct',
    name: 'Randomized Controlled Trial',
    color: C.green,
    soft: C.greenSoft,
    border: 'rgba(26,122,62,0.25)',
    keyUse: 'Testing an intervention when random assignment is ethical and feasible. Provides the strongest evidence that the intervention caused the outcome.',
    weakness: 'Expensive and logistically complex. Cannot be used when exposure is harmful. Results may not generalize beyond the trial population.',
    keyConceptLabel: 'Gold standard for',
    keyConcept: 'Causation — randomization balances unknown confounders',
    icon: '⚖',
  },
  ecological: {
    id: 'ecological',
    name: 'Ecological',
    color: C.muted,
    soft: C.alt,
    border: C.border,
    keyUse: 'Comparing disease rates or exposures across groups, regions, or time periods using aggregate data.',
    weakness: 'Cannot draw conclusions about individuals from group-level data. Risk of ecological fallacy: a pattern in groups may not hold for the individuals within them.',
    keyConceptLabel: 'Critical limitation',
    keyConcept: 'Ecological fallacy — group patterns ≠ individual risk',
    icon: '🌍',
  },
}

const DESIGN_KEYS = Object.keys(DESIGNS)

// ── Scenarios ──
const SCENARIOS = [
  {
    id: 'smoking-lc',
    q: 'Researchers want to know whether long-term smoking increases the risk of lung cancer. They recruit 50,000 adults, record their smoking habits, and follow them for 20 years to see who develops lung cancer.',
    answer: 'prospectiveCohort',
    ethicsTrap: false,
    decisionTree: [
      { q: 'Can the researcher decide who smokes?', a: 'No — assigning people to smoke would be unethical.', dir: 'Observational study.' },
      { q: 'Does the study begin with the disease or the exposure?', a: 'The exposure (smoking habits). Participants are enrolled before disease develops.', dir: 'Cohort design.' },
      { q: 'Are participants followed into the future?', a: 'Yes — 20 years of follow-up.', dir: 'Prospective cohort.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study takes a single snapshot and cannot follow participants over time to observe new cases of disease.',
      caseControl: 'Case-control studies begin with disease — they identify lung cancer patients and look backward. Here we start with exposure and follow forward.',
      retrospectiveCohort: 'A retrospective cohort uses existing records from the past. Here researchers are enrolling participants now and collecting new data going forward.',
      rct: 'An RCT would require randomly assigning people to smoke — which is unethical. A prospective cohort is the strongest ethical alternative.',
      ecological: 'An ecological study compares groups, not individuals. This study tracks individual smoking habits and individual outcomes.',
    },
    commonConfusions: ['caseControl', 'retrospectiveCohort', 'rct'],
  },
  {
    id: 'diabetes-prev',
    q: 'A state health department wants to estimate the current prevalence of diabetes among adults in Georgia. They survey 5,000 randomly selected adults at a single point in time.',
    answer: 'crossSectional',
    ethicsTrap: false,
    decisionTree: [
      { q: 'Can the researcher decide who has diabetes?', a: 'No — they are simply observing.', dir: 'Observational study.' },
      { q: 'Is the researcher following participants over time?', a: 'No — data collected at one point in time.', dir: 'Cross-sectional design.' },
      { q: 'What is being measured?', a: 'How many people have diabetes right now — prevalence.', dir: 'Cross-sectional study.' },
    ],
    whyWrong: {
      caseControl: 'Case-control studies begin with disease cases and identify controls. This study does not select participants based on disease status.',
      prospectiveCohort: 'Cohort studies follow participants forward over time. This is a single snapshot with no follow-up.',
      retrospectiveCohort: 'Retrospective cohorts use existing records to compare exposed and unexposed groups. This is a survey at one time point.',
      rct: 'An RCT tests an intervention with random assignment. No intervention is being tested here.',
      ecological: 'An ecological study uses group-level aggregate data. This study collects individual-level data from 5,000 people.',
    },
    commonConfusions: ['prospectiveCohort', 'ecological'],
  },
  {
    id: 'vaccine-rct',
    q: 'A pharmaceutical company develops a new flu vaccine. Volunteers are randomly assigned to receive either the vaccine or a placebo, and hospitalization rates are compared over one flu season.',
    answer: 'rct',
    ethicsTrap: false,
    decisionTree: [
      { q: 'Can the researcher decide who gets the intervention?', a: 'Yes — participants are randomly assigned to vaccine or placebo.', dir: 'Experimental study.' },
      { q: 'Is assignment random?', a: 'Yes — random assignment is explicitly stated.', dir: 'Randomized Controlled Trial.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study observes but does not intervene. Here, the researcher is assigning participants to a treatment.',
      caseControl: 'Case-control studies observe — they do not randomly assign exposures. This study actively intervenes with random assignment.',
      prospectiveCohort: 'A cohort study observes exposure that occurs naturally. Here, the researcher is assigning the exposure — making it an experiment, not an observation.',
      retrospectiveCohort: 'Retrospective cohorts use existing records and observe past exposures. This study actively assigns a new intervention going forward.',
      ecological: 'An ecological study compares groups using aggregate data, with no intervention or random assignment.',
    },
    commonConfusions: ['prospectiveCohort', 'caseControl'],
  },
  {
    id: 'lc-cc',
    q: 'Researchers identify 200 patients recently diagnosed with lung cancer and 200 patients without lung cancer matched by age and sex. Both groups are asked about their smoking history over the past 30 years.',
    answer: 'caseControl',
    ethicsTrap: false,
    decisionTree: [
      { q: 'Can the researcher assign the exposure?', a: 'No — they are asking about past smoking history.', dir: 'Observational study.' },
      { q: 'Does the study begin with disease or exposure?', a: 'Disease — researchers start by identifying lung cancer cases.', dir: 'Case-control design.' },
      { q: 'Is this disease rare and with long latency?', a: 'Yes — makes case-control efficient since disease is already present.', dir: 'Case-control study.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study collects exposure and disease data at the same time without selecting participants based on disease status. Here, cases are specifically selected because they have lung cancer.',
      prospectiveCohort: 'A cohort study starts with exposure and follows forward. This study starts with the disease outcome and looks backward.',
      retrospectiveCohort: 'A retrospective cohort starts with exposure status (exposed vs. unexposed) and looks at records. This study starts with disease status (cases vs. controls).',
      rct: 'An RCT randomly assigns an intervention. No intervention is assigned here — researchers are observing past exposures.',
      ecological: 'An ecological study uses group-level data. This study collects individual smoking histories from 400 specific people.',
    },
    commonConfusions: ['prospectiveCohort', 'retrospectiveCohort'],
  },
  {
    id: 'obesity-fastfood',
    q: 'A researcher compares county-level obesity rates with the number of fast food restaurants per 10,000 residents across all U.S. counties. No individual data are collected.',
    answer: 'ecological',
    ethicsTrap: false,
    decisionTree: [
      { q: 'What is the unit of analysis?', a: 'Counties — not individual people.', dir: 'Group-level data.' },
      { q: 'Is individual-level exposure or outcome recorded?', a: 'No — only aggregate county-level statistics.', dir: 'Ecological study.' },
      { q: 'Key warning:', a: 'You cannot conclude that individuals who eat at fast food restaurants are more likely to be obese — that would be the ecological fallacy.', dir: '' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study collects individual-level data at one point in time. This study uses county-level aggregate data with no individual measurements.',
      caseControl: 'Case-control studies select individuals based on disease status. This study uses county-level rates with no individual selection.',
      prospectiveCohort: 'A cohort study follows individual participants over time. This study compares counties, not individuals.',
      retrospectiveCohort: 'A retrospective cohort compares individuals with different exposures. This study compares counties.',
      rct: 'An RCT randomly assigns individuals to an intervention. No assignment occurs here.',
    },
    commonConfusions: ['crossSectional', 'prospectiveCohort'],
  },
  {
    id: 'nurses-cohort',
    q: 'In 1976, 121,700 registered nurses completed a questionnaire about diet, lifestyle, and health. Researchers have continued collecting data every two years and tracking new disease diagnoses ever since.',
    answer: 'prospectiveCohort',
    ethicsTrap: false,
    decisionTree: [
      { q: 'Can the researcher assign the exposure (diet, lifestyle)?', a: 'No — researchers observe naturally occurring exposures.', dir: 'Observational study.' },
      { q: 'Does the study begin with exposure or disease?', a: 'Exposure — nurses enrolled before disease developed.', dir: 'Cohort design.' },
      { q: 'Are participants followed into the future?', a: 'Yes — data collected every two years going forward.', dir: 'Prospective cohort.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study is a single snapshot. This study has followed the same participants for decades.',
      caseControl: 'Case-control studies start with disease. This study enrolled participants before disease developed and followed them forward.',
      retrospectiveCohort: 'A retrospective cohort uses records of exposures that already occurred. Here, researchers are actively collecting new data going forward from enrollment.',
      rct: 'An RCT randomly assigns an intervention. Diet and lifestyle here are not assigned — they are observed as they naturally occur.',
      ecological: 'An ecological study uses group-level data. This study follows 121,700 individual nurses.',
    },
    commonConfusions: ['retrospectiveCohort', 'caseControl'],
  },
  {
    id: 'occupational-retro',
    q: 'A hospital system pulls 10 years of employee health records to compare cancer rates between workers who were exposed to a chemical solvent and those who were not. The exposure occurred in the past.',
    answer: 'retrospectiveCohort',
    ethicsTrap: false,
    decisionTree: [
      { q: 'Can the researcher assign the exposure?', a: 'No — exposure already occurred in the past.', dir: 'Observational study.' },
      { q: 'Does the study begin with disease or exposure?', a: 'Exposure — groups are defined by past exposure status.', dir: 'Cohort design.' },
      { q: 'Are participants followed into the future or is existing data used?', a: 'Existing records from the past 10 years are used.', dir: 'Retrospective cohort.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study collects all data at one time point. This study uses 10 years of historical records with a defined exposure and outcome over time.',
      caseControl: 'A case-control study starts with cancer cases and selects controls. This study starts with exposure groups (exposed vs. unexposed workers).',
      prospectiveCohort: 'A prospective cohort follows participants into the future. This study uses records of events that already happened.',
      rct: 'An RCT randomly assigns an intervention. The exposure here (solvent) was not assigned by researchers.',
      ecological: 'An ecological study uses group-level aggregate data. This study uses individual health records.',
    },
    commonConfusions: ['prospectiveCohort', 'caseControl'],
  },
  {
    id: 'smoking-ideal',
    q: 'Theoretically, what would be the ideal study design to definitively prove that smoking causes lung cancer — if there were no ethical constraints?',
    answer: 'rct',
    ethicsTrap: true,
    ethicsNote: 'In reality, randomly assigning people to smoke is unethical and will never be done. Epidemiologists instead rely on prospective cohort studies, which provide the strongest ethical evidence. This is a case where the ideal design and the feasible design are different things.',
    decisionTree: [
      { q: 'What kind of evidence would definitively establish causation?', a: 'Random assignment — removing all other explanations for the difference.', dir: 'Experimental design.' },
      { q: 'What specific experimental design assigns participants randomly?', a: 'A randomized controlled trial.', dir: 'RCT — if ethical constraints did not exist.' },
      { q: 'But ethics matter:', a: 'Assigning people to smoke is harmful and would never be approved. Prospective cohort is the strongest ethical alternative.', dir: '' },
    ],
    whyWrong: {
      crossSectional: 'Cross-sectional studies cannot establish temporality — they cannot prove which came first. They cannot establish causation.',
      caseControl: 'Case-control studies are observational — they cannot rule out confounding as well as an RCT can.',
      prospectiveCohort: 'A prospective cohort is the best available observational design — but confounding can never be fully eliminated without randomization.',
      retrospectiveCohort: 'A retrospective cohort relies on existing records and has less control over data quality than a prospective design.',
      ecological: 'An ecological study uses group-level data and is subject to ecological fallacy — the weakest design for establishing causation.',
    },
    commonConfusions: ['prospectiveCohort', 'caseControl'],
  },
]

// ── Decision tree display ──
function DecisionTree({ steps }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
        How an epidemiologist reasons through this:
      </div>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.purple, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
            {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: C.border, marginTop: 3 }} />}
          </div>
          <div style={{ paddingBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{step.q}</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6, marginBottom: step.dir ? 3 : 0 }}>{step.a}</div>
            {step.dir && <div style={{ fontSize: 12, color: C.purple, fontWeight: 600 }}>→ {step.dir}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Scenario practice ──
function ScenarioPractice() {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const sc = SCENARIOS[idx]
  const answered = picked !== null
  const correct = picked === sc?.answer

  function handlePick(id) {
    if (answered) return
    setPicked(id)
    if (id === sc.answer) setScore(s => s + 1)
  }

  function handleNext() {
    if (idx < SCENARIOS.length - 1) {
      setIdx(i => i + 1)
      setPicked(null)
      setShowAll(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    const pct = Math.round((score / SCENARIOS.length) * 100)
    return (
      <div style={{ textAlign: 'center', padding: '28px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: pct >= 75 ? C.green : pct >= 50 ? C.amber : C.coral, fontFamily: "'Space Grotesk', sans-serif" }}>{score}/{SCENARIOS.length}</div>
        <div style={{ fontSize: 15, color: C.dim, marginTop: 6, marginBottom: 20 }}>
          {pct >= 75 ? 'Strong reasoning — study design selection is clicking.' : pct >= 50 ? 'Getting there. Focus on the decision tree logic after each scenario.' : 'Keep practicing — the decision tree process is what to internalize.'}
        </div>
        <button onClick={() => { setIdx(0); setPicked(null); setShowAll(false); setScore(0); setDone(false) }}
          style={{ padding: '10px 24px', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Try again
        </button>
      </div>
    )
  }

  const answerDesign = DESIGNS[sc.answer]
  const pickedDesign = picked ? DESIGNS[picked] : null
  const confusions = sc.commonConfusions.filter(id => id !== picked && id !== sc.answer)

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 8 }}>
        <span>Scenario {idx + 1} of {SCENARIOS.length}</span>
        <span>Score: <strong style={{ color: C.text }}>{score}</strong></span>
      </div>
      <div style={{ height: 4, background: C.alt, borderRadius: 2, marginBottom: 18 }}>
        <div style={{ height: '100%', width: `${(idx / SCENARIOS.length) * 100}%`, background: C.teal, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      {/* Scenario */}
      <div style={{ background: C.alt, borderRadius: 10, padding: '16px 18px', marginBottom: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          How would an epidemiologist answer this question?
        </div>
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.65 }}>{sc.q}</div>
        {sc.ethicsTrap && (
          <div style={{ marginTop: 10, padding: '7px 12px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 6, fontSize: 12, color: C.amber, fontWeight: 600 }}>
            💡 Hint: This scenario asks about the theoretically ideal design — not necessarily the one used in practice.
          </div>
        )}
      </div>

      {/* Design buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {DESIGN_KEYS.map(id => {
          const d = DESIGNS[id]
          const isAnswer = id === sc.answer
          const isPicked = id === picked
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (isAnswer) { bg = d.soft; border = d.color; color = d.color }
            else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={id} onClick={() => handlePick(id)} disabled={answered}
              style={{ padding: '10px 8px', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 12, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s', lineHeight: 1.3 }}
              onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.background = d.soft } }}
              onMouseLeave={e => { if (!answered) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface } }}
            >
              {d.icon && <span style={{ display: 'block', fontSize: 16, marginBottom: 3 }}>{d.icon}</span>}
              {d.name}
              {answered && isAnswer && <span style={{ display: 'block', fontSize: 10, marginTop: 2 }}>✓ correct</span>}
              {answered && isPicked && !isAnswer && <span style={{ display: 'block', fontSize: 10, marginTop: 2, color: C.coral }}>✗</span>}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {answered && (
        <div>
          {/* Ethics trap explanation */}
          {sc.ethicsTrap && (
            <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
              <strong style={{ color: C.amber }}>The ethics lesson:</strong> {sc.ethicsNote}
            </div>
          )}

          {/* Correct answer */}
          <div style={{ padding: '12px 14px', background: answerDesign.soft, border: `1px solid ${answerDesign.border}`, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: answerDesign.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              ✓ {answerDesign.name} — {correct ? 'correct' : 'this was the answer'}
            </div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{answerDesign.keyUse}</div>
            <DecisionTree steps={sc.decisionTree} />
          </div>

          {/* Wrong choice feedback */}
          {!correct && pickedDesign && (
            <div style={{ padding: '12px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                ✗ Why not {pickedDesign.name}?
              </div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{sc.whyWrong[picked]}</div>
            </div>
          )}

          {/* Common confusions */}
          {confusions.map(id => (
            <div key={id} style={{ padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.dim, marginBottom: 4 }}>Also commonly confused: {DESIGNS[id].name}</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>{sc.whyWrong[id]}</div>
            </div>
          ))}

          {/* See all toggle */}
          <button onClick={() => setShowAll(a => !a)} style={{ fontSize: 12, color: C.teal, background: 'none', border: `1px solid rgba(0,153,168,0.3)`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>
            {showAll ? 'Hide' : 'See why all other designs don\'t fit →'}
          </button>

          {showAll && (
            <div style={{ marginBottom: 12 }}>
              {DESIGN_KEYS.filter(id => id !== sc.answer && id !== picked && !confusions.includes(id)).map(id => (
                <div key={id} style={{ padding: '8px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 3 }}>{DESIGNS[id].name}</div>
                  <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>{sc.whyWrong[id]}</div>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleNext}
            style={{ width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {idx < SCENARIOS.length - 1 ? 'Next scenario →' : 'See results'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main export ──
export default function StudyDesign() {
  const [expandedDesign, setExpandedDesign] = useState(null)

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Study Design Selector</div>
      <div style={s.pageSub}>
        The research question determines the study design — not the other way around. Learn to think like an epidemiologist.
      </div>

      {/* First fork */}
      <Section icon="?" iconBg={C.tealSoft} title="The First Question Every Epidemiologist Asks" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Before choosing a study design, ask one question:</p>
          <div style={{ padding: '16px 20px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: C.amber }}>Can the researcher decide who gets the exposure?</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '16px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>Yes → Experimental</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>The researcher assigns participants to receive the exposure or intervention. Random assignment (randomization) is what separates experimental from observational studies.</div>
              <div style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Example design: Randomized Controlled Trial</div>
            </div>
            <div style={{ padding: '16px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 8 }}>No → Observational</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>The researcher watches what happens naturally — they do not assign the exposure. Most epidemiological research is observational because random assignment is often unethical or impractical.</div>
              <div style={{ fontSize: 12, color: C.teal, fontWeight: 600 }}>Example designs: Cohort, Case-Control, Cross-Sectional, Ecological</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.purple }}>Why randomization matters:</strong> Randomization provides the strongest evidence that differences between groups are caused by the intervention — because it helps balance known and unknown confounding factors between groups. Without it, observed differences could be due to other characteristics of who chose (or was chosen) to receive the exposure.
          </div>
        </div>
      </Section>

      {/* Design reference */}
      <Section icon="≡" iconBg={C.amberSoft} title="The Six Study Designs">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Click any design to expand its details.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DESIGN_KEYS.map(id => {
              const d = DESIGNS[id]
              const open = expandedDesign === id
              return (
                <div key={id} style={{ borderRadius: 9, border: `1px solid ${open ? d.color : C.border}`, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                  <button onClick={() => setExpandedDesign(open ? null : id)}
                    style={{ width: '100%', padding: '12px 16px', background: open ? d.soft : C.surface, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{d.icon}</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: d.color }}>{d.name}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', background: d.soft, border: `1px solid ${d.color}`, borderRadius: 4, color: d.color, fontWeight: 600 }}>{d.keyConceptLabel}: {d.keyConcept.split(';')[0]}</span>
                    </span>
                    <span style={{ color: C.muted, fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {open && (
                    <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${C.border}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: '10px 12px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.15)`, borderRadius: 7 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Best used when...</div>
                          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>{d.keyUse}</div>
                        </div>
                        <div style={{ padding: '10px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.15)`, borderRadius: 7 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Weakness...</div>
                          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>{d.weakness}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Practice */}
      <Section icon="▶" iconBg={C.purpleSoft} title="Scenario Practice" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            Read each research scenario and select the most appropriate study design. After answering, you'll see how an epidemiologist reasons through the decision — and why other designs don't fit.
          </p>
          <ScenarioPractice />
        </div>
      </Section>

      {/* Common misconceptions */}
      <Section icon="!" iconBg={C.coralSoft} title="Common Misconceptions">
        <div style={{ paddingTop: 20 }}>
          {[
            {
              wrong: 'Cross-sectional studies can tell us which came first — the exposure or the disease.',
              right: 'Cross-sectional studies collect exposure and disease data at the same point in time. You cannot determine temporal order from a snapshot. This is why cross-sectional studies cannot establish causation.',
              color: C.teal,
            },
            {
              wrong: 'A large cohort study proves causation.',
              right: 'No observational study — regardless of size — can fully rule out confounding. Only randomization can balance all unknown differences between groups. Large cohort studies provide strong evidence of association, but causation requires additional reasoning (Hill\'s criteria, replication, biological plausibility).',
              color: C.purple,
            },
            {
              wrong: 'Case-control studies measure disease incidence.',
              right: 'Case-control studies start with existing cases — you cannot calculate how many new cases developed per unit of time from people at risk. They measure odds ratios, not risk ratios. Incidence requires a cohort design with a defined at-risk population followed over time.',
              color: C.coral,
            },
            {
              wrong: 'If counties with more fast food restaurants have higher obesity rates, then people who eat fast food are more likely to be obese.',
              right: 'This is the ecological fallacy: inferring individual-level relationships from group-level data. The obese individuals in those counties may not be the ones eating at fast food restaurants. Group patterns do not necessarily reflect individual patterns.',
              color: C.amber,
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
    </div>
  )
}
