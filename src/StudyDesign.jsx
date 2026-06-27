import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Mini visuals for each design ──
function CrossSectionalViz() {
  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>August 1, 2026 — one day only</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        {[
          { label: 'Smoker?', val: 'Yes ✓', c: C.coral },
          { label: 'Lung cancer?', val: 'No ✓', c: C.teal },
          { label: 'Smoker?', val: 'No ✓', c: C.teal },
          { label: 'Lung cancer?', val: 'Yes ✓', c: C.coral },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px', background: C.alt, borderRadius: 5, fontSize: 12 }}>
            <span style={{ color: C.dim }}>👤 {r.label}</span>
            <span style={{ color: r.c, fontWeight: 600 }}>{r.val}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
        {['📅 Aug 1 ✓', '📅 Aug 2 🚫', '📅 Next year 🚫'].map((d, i) => (
          <div key={i} style={{ flex: 1, padding: '5px 6px', background: i === 0 ? C.tealSoft : C.coralSoft, borderRadius: 5, textAlign: 'center', color: i === 0 ? C.teal : C.coral, fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontStyle: 'italic', textAlign: 'center' }}>One measurement. No follow-up. Cannot determine what came first.</div>
    </div>
  )
}

function CaseControlViz() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: '10px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Cases</div>
          {['🫁 Lung cancer', '🫁 Lung cancer', '🫁 Lung cancer'].map((p, i) => (
            <div key={i} style={{ fontSize: 12, color: C.dim, padding: '2px 0' }}>{p}</div>
          ))}
          <div style={{ marginTop: 8, fontSize: 12, color: C.coral, fontWeight: 600 }}>↑ Look backward</div>
          <div style={{ fontSize: 11, color: C.dim }}>Smoked? How much? How long?</div>
        </div>
        <div style={{ padding: '10px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Controls</div>
          {['🧑 No lung cancer', '🧑 No lung cancer', '🧑 No lung cancer'].map((p, i) => (
            <div key={i} style={{ fontSize: 12, color: C.dim, padding: '2px 0' }}>{p}</div>
          ))}
          <div style={{ marginTop: 8, fontSize: 12, color: C.teal, fontWeight: 600 }}>↑ Look backward</div>
          <div style={{ fontSize: 11, color: C.dim }}>Smoked? How much? How long?</div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontStyle: 'italic', textAlign: 'center' }}>Start with disease. Look backward at exposure.</div>
    </div>
  )
}

function ProspectiveCohortViz() {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {[
          { label: 'Smokers 🚬', color: C.coral, soft: C.coralSoft, outcome: '→ Who develops lung cancer?' },
          { label: 'Non-smokers 🚭', color: C.teal, soft: C.tealSoft, outcome: '→ Who develops lung cancer?' },
        ].map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ padding: '7px 12px', background: g.soft, border: `1px solid ${g.color}33`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: g.color, minWidth: 120 }}>{g.label}</div>
            <div style={{ flex: 1, height: 2, background: C.border }} />
            <div style={{ fontSize: 20, color: C.muted }}>→</div>
            <div style={{ flex: 1, height: 2, background: C.border, borderStyle: 'dashed' }} />
            <div style={{ padding: '7px 10px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 11, color: C.dim }}>{g.outcome}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, padding: '0 4px' }}>
        <span>Today — measure exposure</span>
        <span>20 years later — measure outcome</span>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontStyle: 'italic', textAlign: 'center' }}>Exposure first. Follow forward. Disease comes later.</div>
    </div>
  )
}

function RetrospectiveCohortViz() {
  return (
    <div>
      <div style={{ padding: '10px 12px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>📁 Employment records — 2005</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 12, color: C.dim }}>🚬 Smokers identified</div>
          <div style={{ flex: 1, fontSize: 12, color: C.dim }}>🚭 Non-smokers identified</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 18, color: C.muted, margin: '4px 0' }}>↓</div>
      <div style={{ padding: '10px 12px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>📋 Medical records — 2025</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, fontSize: 12, color: C.coral }}>Who developed lung cancer?</div>
          <div style={{ flex: 1, fontSize: 12, color: C.teal }}>Who stayed healthy?</div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontStyle: 'italic', textAlign: 'center' }}>Same logic as prospective — but the timeline already happened. Uses existing records.</div>
    </div>
  )
}

function RCTViz() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ display: 'inline-block', padding: '7px 18px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 7, fontSize: 12, color: C.purple, fontWeight: 600 }}>
          Eligible participants — smoking cessation trial
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 18, color: C.muted, margin: '4px 0' }}>↓</div>
      <div style={{ textAlign: 'center', padding: '8px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.amber, fontWeight: 700, marginBottom: 8 }}>
        🎲 Random assignment
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
        <div style={{ padding: '8px 10px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 7, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Treatment group</div>
          <div style={{ fontSize: 11, color: C.dim }}>Cessation program</div>
        </div>
        <div style={{ padding: '8px 10px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Control group</div>
          <div style={{ fontSize: 11, color: C.dim }}>No program</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: C.green, fontWeight: 600 }}>→ Compare quit rates</div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontStyle: 'italic', textAlign: 'center' }}>Note: Assigning people to smoke is unethical. RCTs test interventions, not harmful exposures.</div>
    </div>
  )
}

function EcologicalViz() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { county: 'County A', rate: 'Smoking rate: 28%', cancer: 'Lung cancer rate: 18/100k', color: C.coral, soft: C.coralSoft },
          { county: 'County B', rate: 'Smoking rate: 14%', cancer: 'Lung cancer rate: 9/100k', color: C.teal, soft: C.tealSoft },
        ].map((c, i) => (
          <div key={i} style={{ padding: '10px 12px', background: c.soft, border: `1px solid ${c.color}33`, borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 6 }}>🌍 {c.county}</div>
            <div style={{ fontSize: 12, color: C.dim, marginBottom: 3 }}>{c.rate}</div>
            <div style={{ fontSize: 12, color: C.dim }}>{c.cancer}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 12px', background: C.coralSoft, border: `2px solid ${C.coral}`, borderRadius: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.coral, marginBottom: 3 }}>🚫 Ecological Fallacy Warning</div>
        <div style={{ fontSize: 12, color: C.dim }}>Counties with higher smoking rates have higher cancer rates. But this does NOT mean every individual smoker in those counties has cancer. Group patterns ≠ individual risk.</div>
      </div>
    </div>
  )
}

// ── Design definitions ──
const DESIGNS = [
  {
    id: 'crossSectional',
    name: 'Cross-Sectional',
    color: C.teal,
    soft: C.tealSoft,
    icon: '📷',
    start: 'A population at one point in time — measuring both exposure and outcome simultaneously.',
    next: 'No follow-up. One measurement only.',
    conclude: 'Prevalence of disease or exposure. Cannot determine which came first.',
    bestWhen: 'You want to measure how common a disease or risk factor is right now.',
    weakness: 'Cannot determine temporality — whether exposure preceded disease. Cannot establish causation.',
    viz: <CrossSectionalViz />,
  },
  {
    id: 'caseControl',
    name: 'Case-Control',
    color: C.coral,
    soft: C.coralSoft,
    icon: '🔍',
    start: 'With the outcome — identifying people who already have disease (cases) and people who don\'t (controls).',
    next: 'Look backward at past exposures using interviews, records, or questionnaires.',
    conclude: 'Odds ratio. Efficient for rare diseases. Cannot calculate incidence.',
    bestWhen: 'The disease is rare or has a long latency period. You need results faster than a cohort allows.',
    weakness: 'Susceptible to recall bias — cases may remember past exposures differently than controls. Cannot calculate incidence.',
    viz: <CaseControlViz />,
  },
  {
    id: 'prospectiveCohort',
    name: 'Prospective Cohort',
    color: C.purple,
    soft: C.purpleSoft,
    icon: '→',
    start: 'With the exposure — enrolling people based on whether they are exposed (smokers) or unexposed (non-smokers) before disease develops.',
    next: 'Follow both groups forward over time and record who develops disease.',
    conclude: 'Incidence, relative risk, and risk difference. Strong evidence of association — but not causation.',
    bestWhen: 'You want to measure incidence and relative risk for a common disease with a manageable follow-up period.',
    weakness: 'Expensive and time-consuming. Loss to follow-up can bias results. Cannot be used when assigning exposure is unethical.',
    viz: <ProspectiveCohortViz />,
  },
  {
    id: 'retrospectiveCohort',
    name: 'Retrospective Cohort',
    color: C.amber,
    soft: C.amberSoft,
    icon: '📁',
    start: 'With the exposure — just like a prospective cohort. But the exposure already happened in the past.',
    next: 'Use existing records (employment files, medical records, registries) to determine who was exposed and what outcomes occurred.',
    conclude: 'Incidence and relative risk — same as prospective cohort, but faster and cheaper.',
    bestWhen: 'Good historical records exist and waiting for a prospective study would take too long.',
    weakness: 'Entirely dependent on the quality of existing records. Cannot control for variables that were not recorded.',
    viz: <RetrospectiveCohortViz />,
  },
  {
    id: 'rct',
    name: 'Randomized Controlled Trial',
    color: C.green,
    soft: C.greenSoft,
    icon: '⚖',
    start: 'With eligible participants who are randomly assigned to receive the treatment or intervention (or a control/placebo).',
    next: 'Follow both groups forward and compare outcomes.',
    conclude: 'Causation — randomization provides the strongest evidence that the intervention caused the outcome, because it balances known and unknown confounders between groups.',
    bestWhen: 'You want to test an intervention that is ethical to assign, and you need the highest quality evidence for causation.',
    weakness: 'Cannot be used when the exposure is harmful. Expensive and logistically complex. Results may not generalize beyond the trial population.',
    viz: <RCTViz />,
  },
  {
    id: 'ecological',
    name: 'Ecological',
    color: C.muted,
    soft: C.alt,
    icon: '🌍',
    start: 'With group-level data — counties, countries, time periods. No individual measurements are collected.',
    next: 'Compare aggregate rates of exposure and disease across groups.',
    conclude: 'Group-level associations only. Cannot draw conclusions about individuals.',
    bestWhen: 'Individual-level data are unavailable, or you are tracking trends across populations over time.',
    weakness: 'Ecological fallacy: a pattern seen at the group level may not hold for the individuals within those groups.',
    viz: <EcologicalViz />,
  },
]

// ── Practice scenarios ──
const SCENARIOS = [
  {
    q: 'Researchers want to test whether a new influenza vaccine reduces hospitalization. Adults are randomly assigned to receive the vaccine or a saline injection. Hospitalization rates are compared over one flu season.',
    answer: 'rct',
    tree: [
      { q: 'Did the researcher assign the exposure (or treatment)?', a: 'Yes — participants were randomly assigned to vaccine or placebo.', dir: 'Experimental study.' },
      { q: 'Was assignment random?', a: 'Yes.', dir: 'Randomized Controlled Trial.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study observes but does not intervene. Here the researcher actively assigns a treatment.',
      caseControl: 'Case-control studies are observational — they do not randomly assign exposures.',
      prospectiveCohort: 'A cohort study observes naturally occurring exposures. Here the researcher assigns the intervention, making it experimental.',
      retrospectiveCohort: 'Retrospective cohorts use existing records of past exposures with no random assignment.',
      ecological: 'An ecological study uses group-level aggregate data with no intervention or random assignment.',
    },
    commonConfusions: ['prospectiveCohort', 'caseControl'],
  },
  {
    q: 'A state health department surveys 8,000 randomly selected adults about their vaping habits and current respiratory symptoms. All data are collected on the same day.',
    answer: 'crossSectional',
    tree: [
      { q: 'Did the researcher assign the exposure (or treatment)?', a: 'No — they are observing naturally occurring vaping habits.', dir: 'Observational study.' },
      { q: 'Are participants followed over time?', a: 'No — data are collected at one point in time.', dir: 'Cross-sectional study.' },
    ],
    whyWrong: {
      caseControl: 'A case-control study selects participants based on disease status (cases vs. controls). This study does not select based on respiratory disease.',
      prospectiveCohort: 'A cohort study follows participants over time. This is a single measurement with no follow-up.',
      retrospectiveCohort: 'A retrospective cohort compares exposed and unexposed groups using existing records. This is a same-day survey of a general population.',
      rct: 'An RCT assigns an intervention. No intervention is assigned here.',
      ecological: 'An ecological study uses group-level aggregate data. This study collects individual-level data from 8,000 people.',
    },
    commonConfusions: ['prospectiveCohort', 'ecological'],
  },
  {
    q: 'Researchers identify 300 patients recently diagnosed with mesothelioma and 300 patients without mesothelioma matched by age and industry. Both groups are asked about their occupational asbestos exposure over the past 40 years.',
    answer: 'caseControl',
    tree: [
      { q: 'Did the researcher assign the exposure (or treatment)?', a: 'No — asking about past occupational exposure.', dir: 'Observational study.' },
      { q: 'Does the study begin with the disease or the exposure?', a: 'Disease — researchers start by identifying mesothelioma cases and controls.', dir: 'Case-control design.' },
      { q: 'Why case-control instead of cohort?', a: 'Mesothelioma is rare and has a very long latency — making a cohort design impractical.', dir: 'Case-control study.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study does not select participants based on disease status. Here cases are specifically chosen because they have mesothelioma.',
      prospectiveCohort: 'A cohort study starts with exposure and follows forward. This study starts with the disease outcome and looks backward.',
      retrospectiveCohort: 'A retrospective cohort starts with exposure groups (exposed vs. unexposed). This study starts with disease status (cases vs. controls) — a key distinction.',
      rct: 'No intervention is assigned here.',
      ecological: 'An ecological study uses group-level data. This study interviews 600 individual people.',
    },
    commonConfusions: ['retrospectiveCohort', 'prospectiveCohort'],
  },
  {
    q: 'A research team pulls 15 years of medical records from a large hospital system and compares rates of Type 2 diabetes between employees who reported low physical activity and those who reported high physical activity. The activity data were recorded in annual health screenings.',
    answer: 'retrospectiveCohort',
    tree: [
      { q: 'Did the researcher assign the exposure (or treatment)?', a: 'No — physical activity was not assigned. Researchers are reviewing existing records.', dir: 'Observational study.' },
      { q: 'Does the study begin with the disease or the exposure?', a: 'Exposure — groups are defined by activity level (exposed = low activity vs. unexposed = high activity).', dir: 'Cohort design.' },
      { q: 'Are participants followed into the future or is existing data used?', a: 'Existing records from the past 15 years are used.', dir: 'Retrospective cohort.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study collects all data at one time point. This study uses 15 years of records tracking exposure and outcome over time.',
      caseControl: 'A case-control study starts by identifying diabetes cases and selecting controls. This study starts with exposure groups (active vs. inactive).',
      prospectiveCohort: 'A prospective cohort follows participants into the future. This study uses records of events that already happened.',
      rct: 'Physical activity level was not randomly assigned by researchers.',
      ecological: 'An ecological study uses group-level aggregate data. This study uses individual health records.',
    },
    commonConfusions: ['prospectiveCohort', 'caseControl'],
  },
  {
    q: 'In 1982, researchers enrolled 250,000 adults and recorded their diet and lifestyle. Participants have been surveyed every two years since then, and new cancer diagnoses are recorded as they occur.',
    answer: 'prospectiveCohort',
    tree: [
      { q: 'Did the researcher assign the exposure (or treatment)?', a: 'No — diet and lifestyle are observed as they naturally occur.', dir: 'Observational study.' },
      { q: 'Does the study begin with the disease or the exposure?', a: 'Exposure — participants enrolled before disease developed.', dir: 'Cohort design.' },
      { q: 'Are participants followed into the future?', a: 'Yes — surveyed every two years going forward since 1982.', dir: 'Prospective cohort.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study is a single snapshot. This study has followed the same participants for over 40 years.',
      caseControl: 'Case-control studies start with disease. This study enrolled participants before disease developed and followed them forward.',
      retrospectiveCohort: 'A retrospective cohort uses existing records of past exposures. Here researchers actively collected new data going forward from enrollment in 1982.',
      rct: 'Diet and lifestyle were not randomly assigned.',
      ecological: 'An ecological study uses group-level data. This study follows 250,000 individual participants.',
    },
    commonConfusions: ['retrospectiveCohort', 'caseControl'],
  },
  {
    q: 'A researcher compares county-level childhood asthma rates with county-level air quality index scores across all U.S. counties. No individual-level data are collected.',
    answer: 'ecological',
    tree: [
      { q: 'What is the unit of analysis?', a: 'Counties — not individual children.', dir: 'Group-level data.' },
      { q: 'Is individual-level exposure or outcome recorded?', a: 'No — only county-level aggregate statistics.', dir: 'Ecological study.' },
      { q: 'Key warning:', a: 'You cannot conclude that the individual children with asthma in high-pollution counties are the ones most exposed to poor air quality.', dir: '' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study collects individual-level data at one point in time. This study uses county-level aggregate data only.',
      caseControl: 'Case-control studies select individuals based on disease status. This study uses county-level rates with no individual selection.',
      prospectiveCohort: 'A cohort study follows individual participants over time. This study compares counties, not individuals.',
      retrospectiveCohort: 'A retrospective cohort compares individuals with different exposures. This study compares counties.',
      rct: 'No random assignment occurs here.',
    },
    commonConfusions: ['crossSectional', 'prospectiveCohort'],
  },
  {
    q: 'Researchers want to know whether heavy alcohol use increases heart disease risk. They identify 500 adults with diagnosed heart disease and 500 adults without heart disease, then interview both groups about their alcohol consumption over the past 20 years.',
    answer: 'caseControl',
    tree: [
      { q: 'Did the researcher assign the exposure (or treatment)?', a: 'No — asking about past alcohol use.', dir: 'Observational study.' },
      { q: 'Does the study begin with the disease or the exposure?', a: 'Disease — 500 heart disease cases and 500 controls are identified first.', dir: 'Case-control design.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study does not select based on disease status. Here cases are specifically chosen because they have heart disease.',
      prospectiveCohort: 'A cohort study starts with alcohol use groups and follows forward. This study starts with heart disease and looks backward.',
      retrospectiveCohort: 'A retrospective cohort starts with exposure groups (drinkers vs. non-drinkers). This study starts with disease groups (cases vs. controls).',
      rct: 'No intervention is assigned here.',
      ecological: 'An ecological study uses group-level data. This study interviews 1,000 specific individuals.',
    },
    commonConfusions: ['retrospectiveCohort', 'prospectiveCohort'],
  },
  {
    q: 'A research team uses insurance claims data from 2010–2024 to compare rates of Type 2 diabetes between adults who were obese in 2010 and adults who had normal weight in 2010. Obesity status was recorded during routine health visits.',
    answer: 'retrospectiveCohort',
    tree: [
      { q: 'Did the researcher assign the exposure (or treatment)?', a: 'No — obesity status was not assigned; it is taken from past records.', dir: 'Observational study.' },
      { q: 'Does the study begin with the disease or the exposure?', a: 'Exposure — groups defined by obesity status in 2010.', dir: 'Cohort design.' },
      { q: 'Are participants followed into the future or is existing data used?', a: 'Existing insurance records from 2010–2024 are used.', dir: 'Retrospective cohort.' },
    ],
    whyWrong: {
      crossSectional: 'A cross-sectional study collects all data at one point in time. This study tracks exposure and outcome across 14 years of records.',
      caseControl: 'A case-control study starts by identifying diabetes cases and selecting controls. This study starts with exposure groups (obese vs. normal weight in 2010).',
      prospectiveCohort: 'A prospective cohort collects new data going forward. This study uses records that already exist from 2010 to 2024.',
      rct: 'Obesity status was not randomly assigned.',
      ecological: 'An ecological study uses group-level aggregate data. This study uses individual insurance records.',
    },
    commonConfusions: ['prospectiveCohort', 'caseControl'],
  },
]

const DESIGN_MAP = Object.fromEntries(DESIGNS.map(d => [d.id, d]))

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

// ── Practice ──
function Practice() {
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

  function next() {
    if (idx < SCENARIOS.length - 1) { setIdx(i => i + 1); setPicked(null); setShowAll(false) }
    else setDone(true)
  }

  if (done) {
    const pct = Math.round((score / SCENARIOS.length) * 100)
    return (
      <div style={{ textAlign: 'center', padding: '28px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: pct >= 75 ? C.green : pct >= 50 ? C.amber : C.coral, fontFamily: "'Space Grotesk', sans-serif" }}>{score}/{SCENARIOS.length}</div>
        <div style={{ fontSize: 15, color: C.dim, marginTop: 6, marginBottom: 20 }}>
          {pct >= 75 ? 'Strong reasoning — the decision process is clicking.' : pct >= 50 ? 'Getting there. Review the decision tree after each scenario.' : 'Focus on the three-question process: assign? disease or exposure first? forward or backward?'}
        </div>
        <button onClick={() => { setIdx(0); setPicked(null); setShowAll(false); setScore(0); setDone(false) }}
          style={{ padding: '10px 24px', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Try again
        </button>
      </div>
    )
  }

  const answerDesign = DESIGN_MAP[sc.answer]
  const confusions = sc.commonConfusions.filter(id => id !== picked)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 8 }}>
        <span>Scenario {idx + 1} of {SCENARIOS.length}</span>
        <span>Score: <strong style={{ color: C.text }}>{score}</strong></span>
      </div>
      <div style={{ height: 4, background: C.alt, borderRadius: 2, marginBottom: 18 }}>
        <div style={{ height: '100%', width: `${(idx / SCENARIOS.length) * 100}%`, background: C.teal, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>

      <div style={{ background: C.alt, borderRadius: 10, padding: '16px 18px', marginBottom: 16, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>How would an epidemiologist answer this question?</div>
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.65 }}>{sc.q}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {DESIGNS.map(d => {
          const isAnswer = d.id === sc.answer
          const isPicked = d.id === picked
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (isAnswer) { bg = d.soft; border = d.color; color = d.color }
            else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={d.id} onClick={() => handlePick(d.id)} disabled={answered}
              style={{ padding: '10px 8px', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 12, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all 0.15s', lineHeight: 1.3 }}
              onMouseEnter={e => { if (!answered) { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.background = d.soft } }}
              onMouseLeave={e => { if (!answered) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface } }}>
              <span style={{ display: 'block', fontSize: 16, marginBottom: 3 }}>{d.icon}</span>
              {d.name}
              {answered && isAnswer && <span style={{ display: 'block', fontSize: 10, marginTop: 2 }}>✓ correct</span>}
              {answered && isPicked && !isAnswer && <span style={{ display: 'block', fontSize: 10, marginTop: 2, color: C.coral }}>✗</span>}
            </button>
          )
        })}
      </div>

      {answered && (
        <div>
          <div style={{ padding: '12px 14px', background: answerDesign.soft, border: `1px solid ${answerDesign.color}44`, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: answerDesign.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              ✓ {answerDesign.name} — {correct ? 'correct' : 'this was the answer'}
            </div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{answerDesign.bestWhen}</div>
            <DecisionTree steps={sc.tree} />
          </div>

          {!correct && picked && (
            <div style={{ padding: '12px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>✗ Why not {DESIGN_MAP[picked].name}?</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{sc.whyWrong[picked]}</div>
            </div>
          )}

          {confusions.filter(id => id !== sc.answer).map(id => (
            <div key={id} style={{ padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.dim, marginBottom: 4 }}>Also commonly confused: {DESIGN_MAP[id].name}</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>{sc.whyWrong[id]}</div>
            </div>
          ))}

          <button onClick={() => setShowAll(a => !a)} style={{ fontSize: 12, color: C.teal, background: 'none', border: `1px solid rgba(0,153,168,0.3)`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>
            {showAll ? 'Hide' : 'See why all other designs don\'t fit →'}
          </button>

          {showAll && Object.keys(sc.whyWrong).filter(id => id !== sc.answer && id !== picked && !confusions.includes(id)).map(id => (
            <div key={id} style={{ padding: '8px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 3 }}>{DESIGN_MAP[id].name}</div>
              <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>{sc.whyWrong[id]}</div>
            </div>
          ))}

          <button onClick={next} style={{ width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
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
      <div style={s.pageSub}>The research question determines the study design. Learn to think like an epidemiologist.</div>

      {/* First fork */}
      <Section icon="?" iconBg={C.tealSoft} title="The First Question to Ask" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Every study design begins with one question about how participants became exposed:</p>
          <div style={{ padding: '16px 20px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: C.amber }}>
              Did the researcher assign the exposure (or treatment)?
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '16px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.green, marginBottom: 8 }}>Yes → Experimental</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>The researcher assigns participants to receive the exposure or treatment. The only experimental design in this course is the randomized controlled trial.</div>
              <div style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Example: Vaccine vs. placebo trial</div>
            </div>
            <div style={{ padding: '16px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.teal, marginBottom: 8 }}>No → Observational</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>The researcher watches naturally occurring exposures. Most epidemiological research is observational because random assignment is often unethical or impractical.</div>
              <div style={{ fontSize: 12, color: C.teal, fontWeight: 600 }}>Examples: Cohort, Case-Control, Cross-Sectional, Ecological</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.purple }}>Why randomization matters:</strong> Randomization provides the strongest evidence that differences between groups are caused by the intervention — because it balances both known and unknown confounding factors between groups. Without it, observed differences could reflect who chose (or was assigned) to receive the exposure rather than the exposure's effect.
          </div>
        </div>
      </Section>

      {/* Six designs — consistent smoking/lung cancer narrative */}
      <Section icon="≡" iconBg={C.amberSoft} title="The Six Study Designs — One Example, Six Approaches">
        <div style={{ paddingTop: 16 }}>
          <p style={s.prose}>Each design below uses the same research question — smoking and lung cancer — so you can focus on the design, not the disease.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DESIGNS.map(d => {
              const open = expandedDesign === d.id
              return (
                <div key={d.id} style={{ borderRadius: 10, border: `1.5px solid ${open ? d.color : C.border}`, overflow: 'hidden', transition: 'border-color 0.15s', background: C.surface }}>
                  <button onClick={() => setExpandedDesign(open ? null : d.id)}
                    style={{ width: '100%', padding: '13px 16px', background: open ? d.soft : C.surface, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit', transition: 'background 0.15s' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{d.icon}</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: d.color }}>{d.name}</span>
                    </span>
                    <span style={{ color: C.muted, fontSize: 12, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {open && (
                    <div style={{ padding: '14px 16px 18px', borderTop: `1px solid ${C.border}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                        {/* Visual */}
                        <div style={{ padding: '12px', background: C.alt, borderRadius: 8, border: `1px solid ${C.border}` }}>
                          {d.viz}
                        </div>
                        {/* Three questions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ padding: '10px 12px', background: d.soft, border: `1px solid ${d.color}33`, borderRadius: 7 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: d.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Where do you start?</div>
                            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>{d.start}</div>
                          </div>
                          <div style={{ padding: '10px 12px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>What happens next?</div>
                            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>{d.next}</div>
                          </div>
                          <div style={{ padding: '10px 12px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.15)`, borderRadius: 7 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>What can you conclude?</div>
                            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>{d.conclude}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{ padding: '10px 12px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.15)`, borderRadius: 7 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Best used when...</div>
                          <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>{d.bestWhen}</div>
                        </div>
                        <div style={{ padding: '10px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.15)`, borderRadius: 7 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Weakness...</div>
                          <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>{d.weakness}</div>
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
          <p style={s.prose}>These scenarios use different diseases and exposures — testing whether you can apply the decision process to new contexts, not just recall the smoking example.</p>
          <Practice />
        </div>
      </Section>

      {/* Common misconceptions */}
      <Section icon="!" iconBg={C.coralSoft} title="Common Misconceptions">
        <div style={{ paddingTop: 20 }}>
          {[
            {
              wrong: 'Cross-sectional studies can tell us which came first — the exposure or the disease.',
              right: 'Cross-sectional studies collect exposure and disease data at the same point in time. Because both are measured simultaneously, you cannot determine temporal order. This is why cross-sectional studies cannot establish causation.',
            },
            {
              wrong: 'A large cohort study proves causation.',
              right: 'No observational study — regardless of size — can fully rule out confounding. Only randomization can balance all unknown differences between groups. Large cohort studies provide strong evidence of association, but establishing causation requires additional reasoning (replication, biological plausibility, dose-response).',
            },
            {
              wrong: 'Case-control studies measure disease incidence.',
              right: 'Case-control studies start with existing cases — you cannot calculate how many new cases developed per unit of time from people at risk. They measure odds ratios, not risk ratios. Incidence requires a cohort design with a defined at-risk population followed over time.',
            },
            {
              wrong: 'Prospective and retrospective cohort studies are fundamentally different designs.',
              right: 'Both are cohort studies — they both start with exposure and compare outcomes between exposed and unexposed groups. The only difference is timing: prospective studies collect new data going forward; retrospective studies use existing records. The logic, the measures of effect (RR), and the direction (exposure → outcome) are the same.',
            },
            {
              wrong: 'If counties with more fast food restaurants have higher obesity rates, then individuals who eat fast food are more likely to be obese.',
              right: 'This is the ecological fallacy: inferring individual-level relationships from group-level data. The obese individuals in those counties may not be the ones eating at fast food restaurants. Group patterns do not necessarily apply to individuals within those groups.',
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
