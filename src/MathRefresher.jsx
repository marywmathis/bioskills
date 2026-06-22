import { useState } from 'react'

const C = {
  bg: "#0e1117",
  surface: "#1a1f2e",
  alt: "#222736",
  border: "#2d3348",
  teal: "#00d4c8",
  tealSoft: "#0a3330",
  tealDim: "rgba(0,212,200,0.12)",
  coral: "#ff6b6b",
  coralSoft: "#3a1a1a",
  coralDim: "rgba(255,107,107,0.12)",
  amber: "#ffd93d",
  amberSoft: "#3a2e0a",
  green: "#51cf66",
  greenSoft: "#1a3327",
  purple: "#cc5de8",
  purpleSoft: "#2a1040",
  text: "#f1f3f5",
  dim: "#8a9ab5",
  muted: "#4a5568",
}

const s = {
  page: {
    padding: '2rem 1.5rem 4rem',
    maxWidth: 760,
    margin: '0 auto',
  },
  pageTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    color: C.text,
    marginBottom: 6,
  },
  pageSub: {
    fontSize: 15,
    color: C.dim,
    marginBottom: 32,
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 12,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    overflow: 'hidden',
    background: C.surface,
  },
  sectionBtn: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    color: C.text,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    textAlign: 'left',
    gap: 12,
  },
  sectionBtnLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  chevron: {
    color: C.dim,
    fontSize: 12,
    transition: 'transform 0.2s',
    flexShrink: 0,
  },
  body: {
    padding: '0 20px 20px',
    borderTop: `1px solid ${C.border}`,
  },
  concept: {
    marginBottom: 24,
    paddingTop: 20,
  },
  conceptTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    color: C.teal,
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  prose: {
    fontSize: 14,
    color: C.dim,
    lineHeight: 1.75,
    marginBottom: 10,
  },
  formula: {
    background: C.alt,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    color: C.amber,
    marginBottom: 10,
  },
  example: {
    background: C.tealSoft,
    border: `1px solid rgba(0,212,200,0.2)`,
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: C.dim,
    lineHeight: 1.7,
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: C.teal,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  quizWrap: {
    marginTop: 24,
    padding: '16px',
    background: C.alt,
    borderRadius: 10,
    border: `1px solid ${C.border}`,
  },
  quizTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: C.amber,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  quizQ: {
    fontSize: 14,
    color: C.text,
    marginBottom: 10,
    lineHeight: 1.6,
  },
  optionBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '9px 13px',
    marginBottom: 6,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    color: C.dim,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    marginLeft: 8,
  },
}

function Quiz({ q, options, answer, explain }) {
  const [picked, setPicked] = useState(null)
  const done = picked !== null

  return (
    <div style={s.quizWrap}>
      <div style={s.quizTitle}>Quick check</div>
      <div style={s.quizQ}>{q}</div>
      {options.map((opt, i) => {
        let bg = C.surface, border = C.border, color = C.dim
        if (done) {
          if (i === answer) { bg = C.greenSoft; border = C.green; color = C.green }
          else if (i === picked) { bg = C.coralSoft; border = C.coral; color = C.coral }
        }
        return (
          <button
            key={i}
            style={{ ...s.optionBtn, background: bg, border: `1px solid ${border}`, color }}
            onClick={() => !done && setPicked(i)}
            disabled={done}
          >
            {opt}
            {done && i === answer && <span style={{ ...s.tag, background: C.greenSoft, color: C.green }}>✓ correct</span>}
            {done && i === picked && i !== answer && <span style={{ ...s.tag, background: C.coralSoft, color: C.coral }}>✗ wrong</span>}
          </button>
        )
      })}
      {done && (
        <div style={{ marginTop: 10, fontSize: 13, color: C.dim, lineHeight: 1.7, padding: '10px 12px', background: C.tealSoft, borderRadius: 7, border: `1px solid rgba(0,212,200,0.2)` }}>
          {explain}
        </div>
      )}
      {done && (
        <button
          style={{ ...s.optionBtn, marginTop: 8, marginBottom: 0, textAlign: 'center', color: C.teal, border: `1px solid rgba(0,212,200,0.3)` }}
          onClick={() => setPicked(null)}
        >
          Try again
        </button>
      )}
    </div>
  )
}

function Section({ icon, iconBg, title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={s.section}>
      <button style={s.sectionBtn} onClick={() => setOpen(o => !o)}>
        <span style={s.sectionBtnLeft}>
          <span style={{ ...s.sectionIcon, background: iconBg }}>{icon}</span>
          {title}
        </span>
        <span style={{ ...s.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      {open && <div style={s.body}>{children}</div>}
    </div>
  )
}

function Concept({ title, children }) {
  return (
    <div style={s.concept}>
      <div style={s.conceptTitle}>◆ {title}</div>
      {children}
    </div>
  )
}

export default function MathRefresher() {
  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Math Refresher</div>
      <div style={s.pageSub}>
        The math in biostatistics is not advanced — but a few core ideas trip students up early.
        Work through what you need; skip what you already know.
      </div>

      <Section icon="%" iconBg="rgba(0,212,200,0.15)" title="Fractions, Proportions & Percentages">
        <Concept title="Fractions vs. proportions">
          <p style={s.prose}>
            A <strong style={{ color: C.text }}>fraction</strong> is part over whole: 3/10 means 3 out of 10.
            A <strong style={{ color: C.text }}>proportion</strong> is the same thing expressed as a decimal between 0 and 1.
            A <strong style={{ color: C.text }}>percentage</strong> multiplies that by 100.
          </p>
          <div style={s.formula}>3/10 = 0.30 = 30%</div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Public health example</div>
            30 out of 200 patients developed hypertension → 30/200 = 0.15 = 15% prevalence
          </div>
        </Concept>

        <Concept title="Why proportions must be between 0 and 1">
          <p style={s.prose}>
            A proportion answers "what fraction of the whole?" The smallest possible answer is 0 (none) and the largest is 1 (all).
            If you calculate a proportion and get 1.4, something is wrong — usually the denominator is too small.
          </p>
          <div style={s.example}>
            <div style={s.exampleLabel}>Common mistake</div>
            Using the exposed group as both numerator and denominator gives a ratio, not a proportion. Always check: is the denominator the total group you're describing?
          </div>
        </Concept>

        <Quiz
          q="In a sample of 400 people, 60 have diabetes. What is the proportion with diabetes?"
          options={["60", "0.15", "15", "0.60"]}
          answer={1}
          explain="60 ÷ 400 = 0.15. A proportion is always a decimal between 0 and 1. To express as a percentage: 0.15 × 100 = 15%."
        />
      </Section>

      <Section icon="×" iconBg="rgba(255,107,107,0.15)" title="Multiplication & Order of Operations">
        <Concept title="PEMDAS in statistics formulas">
          <p style={s.prose}>
            Statistical formulas look intimidating but follow the same order of operations:
            Parentheses → Exponents → Multiply/Divide → Add/Subtract.
            When in doubt, work inside-out.
          </p>
          <div style={s.formula}>
            {"SE = √(p × (1 - p) / n)"}
            {"\n"}
            {"Step 1: (1 - p)   Step 2: p × result   Step 3: ÷ n   Step 4: √"}
          </div>
        </Concept>

        <Concept title="Multiplying by a negative">
          <p style={s.prose}>
            Complements appear everywhere in probability: if P(A) = 0.3, then P(not A) = 1 − 0.3 = 0.7.
            Always subtract from 1, never from 0.
          </p>
          <div style={s.formula}>P(A') = 1 − P(A)</div>
        </Concept>

        <Quiz
          q="Evaluate: √(0.4 × (1 − 0.4) / 100)"
          options={["0.049", "0.24", "0.0024", "0.49"]}
          answer={0}
          explain="1 − 0.4 = 0.6 → 0.4 × 0.6 = 0.24 → 0.24 / 100 = 0.0024 → √0.0024 ≈ 0.049"
        />
      </Section>

      <Section icon="²" iconBg="rgba(255,217,61,0.15)" title="Squares, Square Roots & Exponents">
        <Concept title="Squaring vs. square root">
          <p style={s.prose}>
            Squaring a number means multiplying it by itself. The square root reverses that.
            In statistics, you square to get variance, then take the square root to get standard deviation — which puts the result back in the original units.
          </p>
          <div style={s.formula}>
            {"Variance = (sum of squared deviations) / n"}
            {"\n"}
            {"SD = √Variance"}
          </div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Why this matters</div>
            If blood pressure is measured in mmHg, variance is in mmHg². Taking √ gives SD back in mmHg — interpretable in the same units as the original data.
          </div>
        </Concept>

        <Concept title="Negative numbers under a square root">
          <p style={s.prose}>
            You cannot take the square root of a negative number in real statistics.
            If you get a negative value under a square root, you made an arithmetic error — most likely subtracted in the wrong order.
          </p>
        </Concept>

        <Quiz
          q="A dataset has variance = 25. What is the standard deviation?"
          options={["625", "12.5", "5", "√25%"]}
          answer={2}
          explain="SD = √variance = √25 = 5. The SD is always in the same units as the original variable."
        />
      </Section>

      <Section icon="ln" iconBg="rgba(204,93,232,0.15)" title="Logarithms & the Natural Log">
        <Concept title="What a logarithm is">
          <p style={s.prose}>
            A logarithm answers: "what power do I raise the base to in order to get this number?"
            In public health, you'll mostly see the <strong style={{ color: C.text }}>natural log (ln)</strong>, which uses base <em>e</em> ≈ 2.718.
          </p>
          <div style={s.formula}>
            {"ln(x) asks: e^? = x"}
            {"\n"}
            {"ln(1) = 0   ln(e) = 1   ln(10) ≈ 2.30"}
          </div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Where you'll see this</div>
            Logistic regression, Cox regression, odds ratios, and relative risk all use the natural log under the hood. You don't calculate these by hand — but you need to know that ln(OR) is how the computer stores the result before converting it back.
          </div>
        </Concept>

        <Concept title="Key log rules you'll actually use">
          <p style={s.prose}>Logs turn multiplication into addition and division into subtraction:</p>
          <div style={s.formula}>
            {"ln(a × b) = ln(a) + ln(b)"}
            {"\n"}
            {"ln(a / b) = ln(a) − ln(b)"}
            {"\n"}
            {"e^(ln x) = x  ← undoes the log"}
          </div>
        </Concept>

        <Quiz
          q="If ln(OR) = 0.693, what is OR?"
          options={["0.693", "2.0", "1.96", "e"]}
          answer={1}
          explain="e^0.693 ≈ 2.0. To convert from ln(OR) back to OR, raise e to that power. ln(2) ≈ 0.693 is worth memorizing."
        />
      </Section>

      <Section icon="Σ" iconBg="rgba(0,212,200,0.15)" title="Summation Notation (Σ)">
        <Concept title="Reading Sigma notation">
          <p style={s.prose}>
            Σ (sigma) means "add these up." The subscript tells you where to start, the superscript tells you where to stop.
            In most biostat formulas, you're summing over all observations in your dataset.
          </p>
          <div style={s.formula}>
            {"Σᵢ xᵢ  =  x₁ + x₂ + x₃ + ... + xₙ"}
            {"\n"}
            {"x̄ = (Σ xᵢ) / n  ← the sample mean"}
          </div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Plain language</div>
            "Sum of all x-values, divided by how many there are" = the average.
            Σ is just shorthand for "add them all up."
          </div>
        </Concept>

        <Quiz
          q="If x₁=5, x₂=10, x₃=15 and n=3, what is x̄?"
          options={["10", "30", "5", "15"]}
          answer={0}
          explain="Σxᵢ = 5 + 10 + 15 = 30. x̄ = 30/3 = 10."
        />
      </Section>

      <Section icon="≥" iconBg="rgba(81,207,102,0.15)" title="Inequalities & Number Lines">
        <Concept title="Reading inequality symbols">
          <p style={s.prose}>
            These appear in hypothesis testing decision rules and confidence intervals.
          </p>
          <div style={s.formula}>
            {"p < 0.05   → p is less than 0.05 (reject H₀)"}
            {"\n"}
            {"p ≥ 0.05   → p is 0.05 or greater (fail to reject H₀)"}
            {"\n"}
            {"|z| > 1.96 → the absolute value of z exceeds 1.96"}
          </div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Common confusion</div>
            p &lt; 0.05 means the p-value is small — not that it is negative or that something is "less likely."
            A p-value of 0.001 is smaller than 0.05, which is stronger evidence against H₀.
          </div>
        </Concept>

        <Quiz
          q="Your test gives p = 0.03. Using α = 0.05, which is correct?"
          options={[
            "Fail to reject H₀ because 0.03 < 0.05",
            "Reject H₀ because 0.03 < 0.05",
            "Reject H₀ because 0.03 > 0.05",
            "Cannot determine without sample size"
          ]}
          answer={1}
          explain="When p < α, reject H₀. Here 0.03 < 0.05, so we reject. The p-value being small means the data are unlikely under H₀."
        />
      </Section>

    </div>
  )
}
