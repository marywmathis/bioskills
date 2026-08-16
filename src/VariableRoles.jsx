import { useState } from 'react'
import { C, s, Section, Quiz } from './utils.jsx'

// Shared list of test families used in the practice questions
const TEST_OPTIONS = [
  'Independent-samples t test',
  'Paired t test',
  'ANOVA',
  'Correlation or linear regression',
  "Chi-square or Fisher's exact test",
  'Logistic regression',
]
const T = {
  indT: 0, pairT: 1, anova: 2, reg: 3, chi: 4, logistic: 5,
}

const SCENARIOS = [
  {
    title: 'Exercise and blood pressure',
    text: 'Researchers record how many minutes per week each adult exercises and their systolic blood pressure, then look at whether exercise is associated with blood pressure. Each adult is measured once.',
    questions: [
      {
        q: 'Which variable is the outcome — the response being explained?',
        options: ['Systolic blood pressure', 'Minutes of exercise per week', 'Both are outcomes'],
        answer: 0,
        explain: 'Correct — blood pressure is the response being explained, so it is the outcome (dependent variable). Exercise is the predictor.',
        wrongExplain: {
          1: 'Exercise is what we think affects blood pressure, so it is the predictor. The outcome is the response being explained — blood pressure.',
          2: 'There is one outcome here: blood pressure. Exercise is the predictor we think affects it.',
        },
      },
      {
        q: 'Which variable is the predictor?',
        options: ['Minutes of exercise per week', 'Systolic blood pressure', 'Neither — this is descriptive only'],
        answer: 0,
        explain: 'Correct — exercise is the predictor (independent variable) we think is associated with the outcome.',
        wrongExplain: {
          1: 'Blood pressure is the outcome being explained. The predictor is the variable we think affects it — exercise.',
          2: 'There is a predictor: exercise. The question asks whether it is associated with blood pressure.',
        },
      },
      {
        q: 'What are the variable types?',
        options: ['Outcome continuous, predictor continuous', 'Outcome continuous, predictor categorical', 'Outcome categorical, predictor continuous'],
        answer: 0,
        explain: 'Correct — both blood pressure and minutes of exercise are continuous measurements.',
        wrongExplain: {
          1: 'Minutes of exercise is a continuous measure, not a category.',
          2: 'Blood pressure is a continuous measurement, not a category.',
        },
      },
      {
        q: 'Are the observations independent or paired?',
        options: ['Independent — different people, each measured once', 'Paired — the same person measured twice'],
        answer: 0,
        explain: 'Correct — each adult is measured a single time, so the observations are independent.',
        wrongExplain: {
          1: 'There is no before/after or matching here; each adult is measured once, so the data are independent.',
        },
      },
      {
        q: 'Which test family is a reasonable starting point?',
        options: TEST_OPTIONS,
        answer: T.reg,
        explain: 'Correct — two continuous variables, asking whether they move together: correlation or linear regression is a reasonable start.',
        wrongExplain: {
          [T.indT]: 'A t test compares group means, but here the predictor is continuous, not two groups.',
          [T.anova]: 'ANOVA compares means across 3+ groups, but the predictor here is continuous, not categorical.',
          [T.chi]: 'Chi-square is for two categorical variables. Both variables here are continuous.',
          [T.logistic]: 'Logistic regression is for a binary outcome. Blood pressure is continuous.',
        },
      },
    ],
  },
  {
    title: 'Treatment group and recovery status',
    text: 'Patients are assigned to a new drug or a placebo. After treatment, each patient is recorded as recovered or not recovered. Researchers compare recovery between the two groups.',
    questions: [
      {
        q: 'Which variable is the outcome?',
        options: ['Recovery status (recovered / not recovered)', 'Treatment group (drug / placebo)', 'The number of patients'],
        answer: 0,
        explain: 'Correct — recovery status is the response being compared, so it is the outcome. Treatment group is the predictor.',
        wrongExplain: {
          1: 'Treatment is not the outcome simply because researchers control it. The outcome is the response they are trying to explain or compare — here, recovery.',
          2: 'The number of patients is the sample size, not a variable being analyzed. The outcome is recovery status.',
        },
      },
      {
        q: 'Which variable is the predictor?',
        options: ['Treatment group (drug / placebo)', 'Recovery status', 'Both are predictors'],
        answer: 0,
        explain: 'Correct — treatment group is the predictor. We ask whether it is associated with the recovery outcome.',
        wrongExplain: {
          1: 'Recovery is the outcome being compared. The predictor is the group assignment — drug versus placebo.',
          2: 'There is one predictor here: treatment group. Recovery is the outcome.',
        },
      },
      {
        q: 'What are the variable types?',
        options: ['Outcome binary categorical, predictor two-category categorical', 'Outcome continuous, predictor categorical', 'Both continuous'],
        answer: 0,
        explain: 'Correct — recovery is a yes/no (binary) outcome, and treatment group is a two-category predictor.',
        wrongExplain: {
          1: 'Recovery is a yes/no category, not a continuous measurement.',
          2: 'Neither variable is continuous — both are categories.',
        },
      },
      {
        q: 'Are the observations independent or paired?',
        options: ['Independent — different patients in each group', 'Paired — the same patients measured twice'],
        answer: 0,
        explain: 'Correct — each group contains different patients, so the observations are independent.',
        wrongExplain: {
          1: 'The drug and placebo groups contain different people; no one is measured in both, so the data are independent.',
        },
      },
      {
        q: 'Which test family is a reasonable starting point?',
        options: TEST_OPTIONS,
        answer: T.chi,
        explain: "Correct — a binary outcome compared across two independent groups points to a chi-square test (or Fisher's exact test for small counts).",
        wrongExplain: {
          [T.indT]: 'A t test compares means of a continuous outcome. Recovery is a yes/no category, not a mean.',
          [T.pairT]: 'A paired t test needs the same people measured twice on a continuous outcome. Neither applies here.',
          [T.reg]: 'Correlation and linear regression need a continuous outcome. Recovery is binary.',
          [T.logistic]: 'Logistic regression could model recovery too — a good instinct. For a simple two-group comparison, chi-square is the usual starting point; logistic regression fits when you add more predictors.',
        },
      },
    ],
  },
  {
    title: 'Blood pressure before and after treatment',
    text: 'The same patients have their blood pressure measured before starting a treatment and again after finishing it. Researchers ask whether blood pressure changed within these patients.',
    questions: [
      {
        q: 'Which variable is the outcome?',
        options: ['Systolic blood pressure', 'Whether it is the before or after measurement', 'The treatment itself'],
        answer: 0,
        explain: 'Correct — blood pressure is the response being explained, so it is the outcome. The before/after condition is the predictor.',
        wrongExplain: {
          1: 'Before-versus-after is the predictor (the condition), not the outcome. The outcome is what is measured — blood pressure.',
          2: 'The treatment is the intervention, not the measured response. The outcome is blood pressure.',
        },
      },
      {
        q: 'Which variable is the predictor?',
        options: ['Timing: before vs. after treatment', 'Blood pressure', 'The patient IDs'],
        answer: 0,
        explain: 'Correct — the before/after condition is the predictor. We ask whether it is associated with a change in the outcome.',
        wrongExplain: {
          1: 'Blood pressure is the outcome being compared. The predictor is the before/after condition.',
          2: 'Patient IDs identify who is measured; the predictor is the before/after timing.',
        },
      },
      {
        q: 'What are the variable types?',
        options: ['Outcome continuous, predictor two-category (before/after)', 'Outcome categorical, predictor continuous', 'Both continuous'],
        answer: 0,
        explain: 'Correct — blood pressure is continuous, and before/after is a two-category condition.',
        wrongExplain: {
          1: 'Blood pressure is a continuous measurement, not a category.',
          2: 'Before/after is a two-category condition, not a continuous variable.',
        },
      },
      {
        q: 'Are the observations independent or paired?',
        options: ['Paired — the same patients are measured twice', 'Independent — different patients each time'],
        answer: 0,
        explain: 'Correct — each patient supplies a before and an after value, so the two measurements are linked. The data are paired.',
        wrongExplain: {
          1: 'These are the same patients measured twice, so each pair of values is linked — that is paired, not independent. This is the step students most often miss.',
        },
      },
      {
        q: 'Which test family is a reasonable starting point?',
        options: TEST_OPTIONS,
        answer: T.pairT,
        explain: 'Correct — a continuous outcome measured twice on the same people calls for a paired t test.',
        wrongExplain: {
          [T.indT]: 'An independent-samples t test assumes different people in each group. Here the same patients are measured twice, so use the paired version.',
          [T.anova]: 'ANOVA compares 3+ independent groups. Here there are two linked measurements on the same people.',
          [T.reg]: 'Correlation/regression looks at association between two continuous variables; here the question is whether a paired measurement changed.',
          [T.chi]: 'Chi-square is for categorical variables. Blood pressure is continuous.',
        },
      },
    ],
  },
  {
    title: 'Age and the probability of hypertension',
    text: 'Researchers record each adult\u2019s age and whether they have hypertension (yes/no), then model how the probability of hypertension changes with age.',
    questions: [
      {
        q: 'Which variable is the outcome?',
        options: ['Whether the person has hypertension (yes/no)', 'Age in years', 'Both together'],
        answer: 0,
        explain: 'Correct — hypertension status is the response being explained, so it is the outcome. Age is the predictor.',
        wrongExplain: {
          1: 'Age is what we think affects the outcome, so it is the predictor. The outcome is hypertension status.',
          2: 'There is one outcome: hypertension status. Age is the predictor.',
        },
      },
      {
        q: 'Which variable is the predictor?',
        options: ['Age in years', 'Hypertension status', 'Neither'],
        answer: 0,
        explain: 'Correct — age is the predictor. Note it is observed, not assigned — predictors are often just measured, not manipulated.',
        wrongExplain: {
          1: 'Hypertension status is the outcome being explained. The predictor is age.',
          2: 'Age is the predictor here, even though no one assigns it. Predictors are often observed rather than manipulated.',
        },
      },
      {
        q: 'What are the variable types?',
        options: ['Outcome binary categorical, predictor continuous', 'Outcome continuous, predictor continuous', 'Outcome continuous, predictor categorical'],
        answer: 0,
        explain: 'Correct — hypertension is a yes/no (binary) outcome, and age is continuous.',
        wrongExplain: {
          1: 'Hypertension is a yes/no category, not a continuous measurement.',
          2: 'Hypertension is binary, and age is continuous — this pairing is reversed.',
        },
      },
      {
        q: 'Are the observations independent or paired?',
        options: ['Independent — each adult is measured once', 'Paired — the same adult measured twice'],
        answer: 0,
        explain: 'Correct — each adult contributes one observation, so the data are independent.',
        wrongExplain: {
          1: 'Each adult is measured a single time; there is no matching or repeat, so the data are independent.',
        },
      },
      {
        q: 'Which test family is a reasonable starting point?',
        options: TEST_OPTIONS,
        answer: T.logistic,
        explain: 'Correct — predicting the probability of a binary outcome from a predictor is exactly what logistic regression does.',
        wrongExplain: {
          [T.reg]: 'Linear regression predicts a continuous outcome. Hypertension is binary, so its probability is modeled with logistic regression.',
          [T.indT]: 'A t test compares group means of a continuous outcome. The outcome here is a yes/no probability.',
          [T.chi]: 'Chi-square could test age-group vs. hypertension if age were binned, but modeling probability across continuous age is logistic regression.',
          [T.anova]: 'ANOVA compares continuous means across groups. The outcome here is binary.',
        },
      },
    ],
  },
]

function LinkBtn({ onNavigate, target, children }) {
  return (
    <button
      onClick={() => onNavigate && onNavigate(target)}
      style={{ color: C.teal, fontWeight: 600, background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
    >
      {children}
    </button>
  )
}

function ScenarioPractice() {
  const [idx, setIdx] = useState(0)
  const sc = SCENARIOS[idx]
  return (
    <div style={{ paddingTop: 20 }}>
      <p style={s.prose}>
        Four scenarios, getting harder. For each, work the full sequence — outcome, predictor, types, independent or paired, then the likely test. Every answer gives feedback.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scenario {idx + 1} of {SCENARIOS.length}</span>
        <span style={{ fontSize: 12, color: C.teal, fontWeight: 600 }}>{sc.title}</span>
      </div>

      <div key={idx}>
        <div style={{ ...s.example, marginBottom: 14 }}>
          <div style={s.exampleLabel}>Scenario</div>
          {sc.text}
        </div>
        {sc.questions.map((qq, i) => (
          <Quiz key={i} q={qq.q} options={qq.options} answer={qq.answer} explain={qq.explain} wrongExplain={qq.wrongExplain} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          style={{ flex: 1, padding: '9px 0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', cursor: idx === 0 ? 'default' : 'pointer', background: C.surface, border: `1px solid ${C.border}`, color: idx === 0 ? C.muted : C.dim, opacity: idx === 0 ? 0.5 : 1 }}
        >
          ← Previous scenario
        </button>
        <button
          onClick={() => setIdx(i => Math.min(SCENARIOS.length - 1, i + 1))}
          disabled={idx === SCENARIOS.length - 1}
          style={{ flex: 1, padding: '9px 0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', cursor: idx === SCENARIOS.length - 1 ? 'default' : 'pointer', background: idx === SCENARIOS.length - 1 ? C.surface : C.teal, border: `1px solid ${idx === SCENARIOS.length - 1 ? C.border : C.teal}`, color: idx === SCENARIOS.length - 1 ? C.muted : '#fff', fontWeight: 600, opacity: idx === SCENARIOS.length - 1 ? 0.5 : 1 }}
        >
          Next scenario →
        </button>
      </div>
    </div>
  )
}

export default function VariableRoles({ onNavigate }) {
  const roleRows = [
    { role: 'Outcome', color: C.teal, syn: 'dependent variable, response, y', what: 'The thing you measure and want to explain, compare, or predict.' },
    { role: 'Predictor', color: C.purple, syn: 'independent variable, exposure, x', what: 'The thing you think affects or distinguishes the outcome.' },
  ]

  const tableRows = [
    ['Continuous', 'Two-category categorical', 'Do two groups have different means?', 'Independent-samples t test'],
    ['Continuous', 'Two-category categorical, paired', 'Did values change within participants?', 'Paired t test'],
    ['Continuous', 'Categorical with 3+ groups', 'Do group means differ?', 'ANOVA'],
    ['Continuous', 'Continuous', 'Are the variables associated?', 'Correlation or linear regression'],
    ['Binary categorical', 'Categorical', 'Are the variables associated?', "Chi-square or Fisher's exact test"],
    ['Binary categorical', 'One or more predictors', 'What predicts the probability of the outcome?', 'Logistic regression'],
  ]

  const steps = [
    'Identify the outcome (dependent variable).',
    'Identify the predictor (independent variable).',
    'Determine each variable\u2019s type.',
    'Ask whether the observations are independent or paired.',
    'Consider the study design and the number of groups.',
    'Select the test.',
  ]

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Variable Roles and Statistical Test Selection</div>
      <div style={s.pageSub}>Two variables, two roles — and a short sequence that turns those roles into the right test.</div>

      {/* 1. The two roles */}
      <Section icon="⇄" iconBg={C.tealSoft} title="The Two Roles" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            Almost every analysis has two kinds of variable. One is the <strong style={{ color: C.text }}>outcome</strong> — the response you are trying to explain. The other is the <strong style={{ color: C.text }}>predictor</strong> — the thing you think affects it. Getting these two roles straight is the first step in choosing a test.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {roleRows.map((r, i) => (
              <div key={i} style={{ padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.role}</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6, marginBottom: 6 }}>{r.what}</div>
                <div style={{ fontSize: 11, color: C.muted }}>Also called: {r.syn}</div>
              </div>
            ))}
          </div>

          <p style={s.prose}>
            The synonyms trip people up: epidemiology says <em>exposure</em> and <em>outcome</em>, statistics says <em>independent</em> and <em>dependent variable</em> (or predictor and response), and algebra says <em>x</em> and <em>y</em>. Same two roles, different words.
          </p>

          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
            <strong style={{ color: C.amber }}>"Dependent" does not mean "caused by."</strong> A dependent variable is the response being explained or compared — nothing more. Whether the predictor actually causes it is a separate question, and only the study design can answer it.
          </div>

          <div style={{ padding: '12px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.teal }}>Predictors are often observed, not manipulated.</strong> Smoking status, age, and neighborhood are all predictors even though no one assigns them. A predictor is simply the variable you think is related to the outcome — not something the researcher has to control.
          </div>
        </div>
      </Section>

      {/* 2. The decision sequence */}
      <Section icon="↧" iconBg={C.purpleSoft} title="The Decision Sequence">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            Roles matter, but roles alone do not pick the test. Work this short sequence in order:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {steps.map((st, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 12px', background: i % 2 ? C.alt : C.surface, border: `1px solid ${C.border}`, borderRadius: 7 }}>
                <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: C.purple, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: C.dim, lineHeight: 1.6, paddingTop: 1 }}>{st}</span>
              </div>
            ))}
          </div>
          <p style={{ ...s.prose, marginBottom: 0 }}>
            The roles come first, but the type of each variable, the pairing of the data, and the number of groups all feed the final choice.
          </p>
        </div>
      </Section>

      {/* 3. The decision table */}
      <Section icon="▦" iconBg={C.tealSoft} title="Common Starting Points">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            Once you know the roles and types, this table gives a reasonable first test for the most common pairings. Treat these as <strong style={{ color: C.text }}>starting points, not automatic answers</strong> — assumptions and study design can change what is appropriate.
          </p>
          <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <div style={{ minWidth: 620 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1.8fr 1.6fr', background: C.alt, padding: '8px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ color: C.teal }}>Outcome</span>
                <span style={{ color: C.purple }}>Predictor</span>
                <span>Typical question</span>
                <span>Possible test</span>
              </div>
              {tableRows.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1.8fr 1.6fr', padding: '10px 12px', borderTop: `1px solid ${C.border}`, fontSize: 12.5, color: C.dim, lineHeight: 1.5, background: i % 2 ? C.surface : C.alt, alignItems: 'center', gap: 8 }}>
                  <span style={{ color: C.teal, fontWeight: 600 }}>{row[0]}</span>
                  <span style={{ color: C.purple, fontWeight: 600 }}>{row[1]}</span>
                  <span>{row[2]}</span>
                  <span style={{ color: C.text, fontWeight: 600 }}>{row[3]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 4. Practice */}
      <Section icon="▶" iconBg={C.coralSoft} title="Practice: Work the Whole Sequence">
        <ScenarioPractice />
      </Section>

      {/* 5. Why it matters */}
      <Section icon="◎" iconBg={C.purpleSoft} title="Why the Roles Matter">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            Getting the roles right is what makes the rest of the pipeline work:
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 13, color: C.dim, lineHeight: 1.8 }}>
            <li>The <strong style={{ color: C.text }}>types</strong> of the outcome and predictor, together, point to the test — the full tree lives in the <LinkBtn onNavigate={onNavigate} target="hypothesis-testing">Hypothesis Test Selector</LinkBtn>.</li>
            <li>Regression predicts an <strong style={{ color: C.text }}>outcome</strong> from one or more <strong style={{ color: C.text }}>predictors</strong> — see the <LinkBtn onNavigate={onNavigate} target="regression-interpreter">Regression Interpreter</LinkBtn>.</li>
            <li>Calling something a predictor does <strong style={{ color: C.text }}>not</strong> make it a cause. Whether an association is causal is decided by the <LinkBtn onNavigate={onNavigate} target="study-design">Study Design Selector</LinkBtn>, not by the roles.</li>
          </ul>

          <Quiz
            q="A study measures hours of sleep per night and each person's fasting blood glucose, asking whether sleep is associated with glucose. Which is the outcome?"
            options={['Fasting blood glucose', 'Hours of sleep', 'Whichever the researcher measured first']}
            answer={0}
            explain="Correct — glucose is the response being explained, so it is the outcome. Sleep is the predictor. (Order of measurement does not decide the roles.)"
            wrongExplain={{
              1: 'Sleep is what we think affects glucose, so it is the predictor. The outcome is the response being explained — glucose.',
              2: 'The order things are measured does not set the roles. The outcome is the response being explained: glucose.',
            }}
          />
        </div>
      </Section>
    </div>
  )
}
