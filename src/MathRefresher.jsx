import { useState } from 'react'

const C = {
  bg: "#f8f9fc",
  surface: "#ffffff",
  alt: "#f0f2f7",
  border: "#e2e6ef",
  teal: "#0099a8",
  tealSoft: "#e0f5f7",
  coral: "#e8452a",
  coralSoft: "#fdecea",
  amber: "#b87000",
  amberSoft: "#fef3e0",
  green: "#1a7a3e",
  greenSoft: "#e6f4ec",
  purple: "#6b3fcc",
  purpleSoft: "#f0ebfa",
  text: "#0f1117",
  dim: "#4a5268",
  muted: "#9aa0b4",
}

const s = {
  page: { padding: '2rem 1.5rem 4rem', maxWidth: 760, margin: '0 auto' },
  pageTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 6 },
  pageSub: { fontSize: 15, color: C.dim, marginBottom: 32, lineHeight: 1.6 },
  section: { marginBottom: 12, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  sectionBtn: { width: '100%', background: 'none', border: 'none', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: C.text, fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, textAlign: 'left', gap: 12 },
  sectionBtnLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  sectionIcon: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  chevron: { color: C.muted, fontSize: 12, transition: 'transform 0.2s', flexShrink: 0 },
  body: { padding: '0 20px 20px', borderTop: `1px solid ${C.border}` },
  concept: { marginBottom: 24, paddingTop: 20 },
  conceptTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: C.teal, marginBottom: 10 },
  prose: { fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 10 },
  formula: { background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.amber, marginBottom: 10 },
  example: { background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.dim, lineHeight: 1.7 },
  exampleLabel: { fontSize: 11, fontWeight: 600, color: C.teal, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 },
  quizWrap: { marginTop: 24, padding: '16px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` },
  quizTitle: { fontSize: 12, fontWeight: 600, color: C.amber, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 },
  quizQ: { fontSize: 14, color: C.text, marginBottom: 10, lineHeight: 1.6 },
  optionBtn: { display: 'block', width: '100%', textAlign: 'left', padding: '9px 13px', marginBottom: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, color: C.dim, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' },
  tag: { display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, marginLeft: 8 },
}

function Quiz({ q, options, answer, explain, wrongExplain }) {
  const [picked, setPicked] = useState(null)
  const done = picked !== null
  const correct = picked === answer
  const feedback = done ? (correct ? explain : (wrongExplain && wrongExplain[picked]) || explain) : null
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
          <button key={i} style={{ ...s.optionBtn, background: bg, border: `1px solid ${border}`, color }} onClick={() => !done && setPicked(i)} disabled={done}>
            {opt}
            {done && i === answer && <span style={{ ...s.tag, background: C.greenSoft, color: C.green }}>✓ correct</span>}
            {done && i === picked && i !== answer && <span style={{ ...s.tag, background: C.coralSoft, color: C.coral }}>✗ not quite</span>}
          </button>
        )
      })}
      {done && <div style={{ marginTop: 10, fontSize: 13, color: C.dim, lineHeight: 1.7, padding: '10px 12px', background: correct ? C.tealSoft : C.coralSoft, borderRadius: 7, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}` }}>{feedback}</div>}
      {done && <button style={{ ...s.optionBtn, marginTop: 8, marginBottom: 0, textAlign: 'center', color: C.teal, border: `1px solid rgba(0,153,168,0.3)` }} onClick={() => setPicked(null)}>Try again</button>}
    </div>
  )
}

function Section({ icon, iconBg, title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={s.section}>
      <button style={{ ...s.sectionBtn, background: open ? C.alt : C.surface }} onClick={() => setOpen(o => !o)}>
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
      <div style={s.pageSub}>The math in biostatistics is not advanced — but a few core ideas trip students up early. Work through what you need; skip what you already know.</div>

      <Section icon="%" iconBg={C.tealSoft} title="Fractions, Proportions & Percentages">
        <Concept title="Fractions vs. proportions">
          <p style={s.prose}>A <strong style={{ color: C.text }}>fraction</strong> is part over whole: 3/10 means 3 out of 10. A <strong style={{ color: C.text }}>proportion</strong> is the same thing expressed as a decimal between 0 and 1. A <strong style={{ color: C.text }}>percentage</strong> multiplies that by 100.</p>
          <div style={s.formula}>3/10 = 0.30 = 30%</div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Public health example</div>
            30 out of 200 patients developed hypertension → 30/200 = 0.15 = 15% prevalence
          </div>
        </Concept>
        <Concept title="Why proportions must be between 0 and 1">
          <p style={s.prose}>A proportion answers "what fraction of the whole?" The smallest possible answer is 0 (none) and the largest is 1 (all). If you calculate a proportion and get 1.4, something is wrong — usually the denominator is too small.</p>
          <div style={s.example}>
            <div style={s.exampleLabel}>Common mistake</div>
            Using the exposed group as both numerator and denominator gives a ratio, not a proportion. Always check: is the denominator the total group you're describing?
          </div>
        </Concept>
        <Quiz q="In a sample of 400 people, 60 have diabetes. What is the proportion with diabetes?" options={["60", "0.15", "15", "0.60"]} answer={1} explain="60 ÷ 400 = 0.15. A proportion is always a decimal between 0 and 1. To express as a percentage: 0.15 × 100 = 15%." />
      </Section>

      <Section icon="×" iconBg={C.coralSoft} title="Multiplication & Order of Operations">
        <Concept title="PEMDAS in statistics formulas">
          <p style={s.prose}>Statistical formulas look intimidating but follow the same order of operations: Parentheses → Exponents → Multiply/Divide → Add/Subtract. When in doubt, work inside-out.</p>
          <div style={s.formula}>{"SE = √(p × (1 - p) / n)\nStep 1: (1 - p)   Step 2: p × result   Step 3: ÷ n   Step 4: √"}</div>
        </Concept>
        <Concept title="Complements">
          <p style={s.prose}>Complements appear everywhere in probability: if P(A) = 0.3, then P(not A) = 1 − 0.3 = 0.7. Always subtract from 1, never from 0.</p>
          <div style={s.formula}>P(A') = 1 − P(A)</div>
        </Concept>
        <Quiz q="Evaluate: √(0.4 × (1 − 0.4) / 100)" options={["0.049", "0.24", "0.0024", "0.49"]} answer={0} explain="1 − 0.4 = 0.6 → 0.4 × 0.6 = 0.24 → 0.24 / 100 = 0.0024 → √0.0024 ≈ 0.049" />
      </Section>

      <Section icon="²" iconBg={C.amberSoft} title="Squares, Square Roots & Exponents">
        <Concept title="Squaring vs. square root">
          <p style={s.prose}>Squaring a number means multiplying it by itself. The square root reverses that. In statistics, you square to get variance, then take the square root to get standard deviation — which puts the result back in the original units.</p>
          <div style={s.formula}>{"Variance = (sum of squared deviations) / n\nSD = √Variance"}</div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Why this matters</div>
            If blood pressure is measured in mmHg, variance is in mmHg². Taking √ gives SD back in mmHg — interpretable in the same units as the original data.
          </div>
        </Concept>
        <Concept title="Negative numbers under a square root">
          <p style={s.prose}>You cannot take the square root of a negative number in real statistics. If you get a negative value under a square root, you made an arithmetic error — most likely subtracted in the wrong order.</p>
        </Concept>
        <Quiz q="A dataset has variance = 25. What is the standard deviation?" options={["625", "12.5", "5", "√25%"]} answer={2} explain="SD = √variance = √25 = 5. The SD is always in the same units as the original variable." />
      </Section>

      <Section icon="ln" iconBg={C.purpleSoft} title="Why Biostatistics Uses Logarithms">
        <Concept title="Reason 1: Ratios multiply, but models add">
          <p style={s.prose}>
            Most measures in epidemiology are <strong style={{ color: C.text }}>ratios</strong>: Risk Ratio (RR), Odds Ratio (OR), Hazard Ratio (HR).
            Ratios combine by multiplying, not adding.
          </p>
          <div style={s.example}>
            <div style={s.exampleLabel}>Example</div>
            Smoking doubles risk: RR = 2. Occupational exposure triples risk: RR = 3.<br/>
            Combined effect: RR = 2 × 3 = 6 — they multiply.
          </div>
          <p style={s.prose} style={{...s.prose, marginTop: 10}}>
            Statistical models are built around addition, not multiplication. The natural log converts multiplication into addition:
          </p>
          <div style={s.formula}>{"ln(2 × 3) = ln(2) + ln(3)\n0.693 + 1.099 = 1.792\ne^1.792 ≈ 6  ← convert back at the end"}</div>
          <p style={s.prose}>
            That's why logistic regression, Poisson regression, and Cox regression all model ln(ratio) rather than the ratio itself.
            When the analysis is done, the computer converts back using e.
          </p>

          {/* Pipeline visual */}
          <div style={{ margin: '14px 0', padding: '16px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>How the computer thinks</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', rowGap: 8 }}>
              {[
                { label: 'Your RRs', values: ['1.5', '2', '4', '8'], color: C.coral },
                { label: 'Take ln', values: ['0.41', '0.69', '1.39', '2.08'], color: C.purple, arrow: true },
                { label: 'Model adds', values: ['effects add here'], color: C.teal, arrow: true },
                { label: 'Take eˣ', values: ['back to RR/OR/HR'], color: C.green, arrow: true },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {step.arrow && <div style={{ fontSize: 18, color: C.muted, margin: '0 6px' }}>→</div>}
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', minWidth: 90 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: step.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.label}</div>
                    {step.values.map((v, j) => (
                      <div key={j} style={{ fontSize: 12, color: C.dim, fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Concept>

        <Concept title="Reason 2: Ratio scales are asymmetric — logs fix that">
          <p style={s.prose}>
            Look at an odds ratio scale. OR = 0.5 and OR = 2 are conceptually symmetric — one halves the odds, the other doubles it.
            But numerically they're not:
          </p>
          <div style={s.formula}>{"OR scale:  0.25  0.5  1  2  4\n           ←0.75→  ←1→  ←3→\n           (unequal gaps from 1)"}</div>
          <p style={s.prose}>Take the natural log and the scale becomes perfectly symmetric around zero:</p>
          <div style={s.formula}>{"ln(0.25) = -1.39    ln(0.5) = -0.69\nln(1)    =  0\nln(2)    = +0.69    ln(4)   = +1.39"}</div>

          {/* Symmetry visual */}
          <div style={{ margin: '12px 0', padding: '14px', background: C.purpleSoft, borderRadius: 8, border: `1px solid rgba(107,63,204,0.15)` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>On the log scale</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, position: 'relative' }}>
              {[
                { or: '0.25', ln: '-1.39', label: '¼× odds' },
                { or: '0.5', ln: '-0.69', label: '½× odds' },
                { or: '1', ln: '0', label: 'no effect', highlight: true },
                { or: '2', ln: '+0.69', label: '2× odds' },
                { or: '4', ln: '+1.39', label: '4× odds' },
              ].map((item, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 2px', background: item.highlight ? C.surface : 'transparent', borderRadius: 6, border: item.highlight ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 11, color: C.purple, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{item.ln}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>OR={item.or}</div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: C.dim }}>
              Harmful effects → positive &nbsp;|&nbsp; No effect = 0 &nbsp;|&nbsp; Protective effects → negative
            </div>
          </div>
        </Concept>

        <Concept title="Reason 3: Models need an unrestricted scale">
          <p style={s.prose}>
            Regression models need an outcome that can range from −∞ to +∞. An OR or RR can't go below zero — that breaks the math.
            But ln(OR) can be any number: negative, zero, or positive. That's what makes it work as a regression outcome.
          </p>
          <div style={s.formula}>{"OR range:    0 to +∞  (can't go negative)\nln(OR) range: -∞ to +∞  (unrestricted — works in regression)"}</div>
        </Concept>

        <Quiz q="A logistic regression output shows ln(OR) = -0.693. What does this mean?" options={["The OR is negative — a protective effect", "The OR ≈ 0.5 — the exposure halves the odds", "The OR ≈ 2 — the exposure doubles the odds", "The result is not statistically significant"]} answer={1} explain="e^(-0.693) ≈ 0.5. A negative ln(OR) means OR < 1, which is a protective association. ln(0.5) = -0.693 is the mirror of ln(2) = +0.693." />
      </Section>

      <Section icon="Σ" iconBg={C.tealSoft} title="Summation Notation (Σ)">
        <Concept title="Reading Sigma notation">
          <p style={s.prose}>Σ (sigma) means "add these up." In most biostat formulas, you're summing over all observations in your dataset.</p>
          <div style={s.formula}>{"Σᵢ xᵢ  =  x₁ + x₂ + x₃ + ... + xₙ\nx̄ = (Σ xᵢ) / n  ← the sample mean"}</div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Plain language</div>
            "Sum of all x-values, divided by how many there are" = the average. Σ is shorthand for "add them all up."
          </div>
        </Concept>
        <Quiz q="If x₁=5, x₂=10, x₃=15 and n=3, what is x̄?" options={["10", "30", "5", "15"]} answer={0} explain="Σxᵢ = 5 + 10 + 15 = 30. x̄ = 30/3 = 10." />
      </Section>

      <Section icon="≥" iconBg={C.greenSoft} title="Inequalities & Number Lines">
        <Concept title="The cutoff rule">
          <p style={s.prose}>
            Think of α = 0.05 as a <strong style={{ color: C.text }}>cutoff on a number line</strong>.
            Your p-value is a number between 0 and 1. Where it falls relative to the cutoff determines your decision.
          </p>

          {/* Number line visual */}
          <div style={{ margin: '14px 0', padding: '16px 20px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ position: 'relative', margin: '24px 0 32px' }}>
              {/* Line */}
              <div style={{ height: 3, background: C.border, borderRadius: 2, position: 'relative' }}>
                {/* Reject zone */}
                <div style={{ position: 'absolute', left: 0, width: '10%', height: '100%', background: C.coral, borderRadius: '2px 0 0 2px', opacity: 0.7 }} />
                {/* Fail to reject zone */}
                <div style={{ position: 'absolute', left: '10%', right: 0, height: '100%', background: C.teal, borderRadius: '0 2px 2px 0', opacity: 0.3 }} />
                {/* Cutoff marker */}
                <div style={{ position: 'absolute', left: '10%', top: -10, width: 3, height: 23, background: C.amber, borderRadius: 2 }} />
              </div>
              {/* Labels below line */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
                <span style={{ color: C.text, fontWeight: 600 }}>0</span>
                <span style={{ color: C.amber, fontWeight: 700, marginLeft: '-2%' }}>α = 0.05 ↑</span>
                <span style={{ color: C.text, fontWeight: 600 }}>1</span>
              </div>
              {/* Zone labels */}
              <div style={{ display: 'flex', marginTop: 6, fontSize: 12 }}>
                <div style={{ width: '10%', color: C.coral, fontWeight: 600, fontSize: 11 }}>Reject H₀</div>
                <div style={{ flex: 1, color: C.teal, fontWeight: 600, fontSize: 11, paddingLeft: 8 }}>Fail to reject H₀</div>
              </div>
              <div style={{ display: 'flex', marginTop: 2, fontSize: 11 }}>
                <div style={{ width: '10%', color: C.dim }}>p &lt; 0.05</div>
                <div style={{ flex: 1, color: C.dim, paddingLeft: 8 }}>p ≥ 0.05</div>
              </div>
            </div>

            {/* Examples */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Examples</div>
              {[
                { p: 'p = 0.03', decision: 'Reject H₀', note: 'below the cutoff', color: C.coral },
                { p: 'p = 0.05', decision: 'Fail to reject H₀', note: 'exactly at the cutoff — not below it', color: C.teal },
                { p: 'p = 0.12', decision: 'Fail to reject H₀', note: 'above the cutoff', color: C.teal },
              ].map((ex, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.text, minWidth: 70 }}>{ex.p}</span>
                  <span style={{ fontSize: 13, color: ex.color, fontWeight: 600, minWidth: 160 }}>{ex.decision}</span>
                  <span style={{ fontSize: 12, color: C.dim }}>{ex.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...s.example, background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)` }}>
            <div style={{ ...s.exampleLabel, color: C.coral }}>Common mistake</div>
            p = 0.05 is <strong>not</strong> less than 0.05 — it is equal to 0.05. The rule is p &lt; α, so p = 0.05 does not cross the threshold. Many students assume 0.05 counts as significant. It doesn't.
          </div>
        </Concept>

        <Concept title="Reading the symbols">
          <p style={s.prose}>These four symbols appear throughout hypothesis testing and confidence intervals. They're worth knowing cold.</p>
          <div style={s.formula}>{"<   strictly less than       (0.03 < 0.05 ✓)\n>   strictly greater than    (0.08 > 0.05 ✓)\n≤   less than or equal to    (0.05 ≤ 0.05 ✓)\n≥   greater than or equal to (0.05 ≥ 0.05 ✓)"}</div>
        </Concept>

        <Quiz
          q="Your test gives p = 0.03 and α = 0.05. Where does the p-value fall on the number line?"
          options={["Above the cutoff", "Exactly at the cutoff", "Below the cutoff"]}
          answer={2}
          explain="0.03 is less than 0.05, so it falls below the cutoff. Because p < α, reject H₀."
        />
        <Quiz
          q="If p = 0.08 and α = 0.05, which statement is true?"
          options={["0.08 < 0.05", "0.08 = 0.05", "0.08 > 0.05"]}
          answer={2}
          explain="0.08 is greater than 0.05. Because p > α, fail to reject H₀. Students often reverse this — a larger p-value means less evidence against H₀, not more."
        />
      </Section>
    </div>
  )
}
