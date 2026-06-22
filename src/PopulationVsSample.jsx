import { useState, useRef } from 'react'

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
          <button key={i} style={{ ...s.optionBtn, background: bg, border: `1px solid ${border}`, color }} onClick={() => !done && setPicked(i)} disabled={done}>
            {opt}
            {done && i === answer && <span style={{ ...s.tag, background: C.greenSoft, color: C.green }}>✓ correct</span>}
            {done && i === picked && i !== answer && <span style={{ ...s.tag, background: C.coralSoft, color: C.coral }}>✗ wrong</span>}
          </button>
        )
      })}
      {done && <div style={{ marginTop: 10, fontSize: 13, color: C.dim, lineHeight: 1.7, padding: '10px 12px', background: C.tealSoft, borderRadius: 7, border: `1px solid rgba(0,153,168,0.2)` }}>{explain}</div>}
      {done && <button style={{ ...s.optionBtn, marginTop: 8, marginBottom: 0, textAlign: 'center', color: C.teal, border: `1px solid rgba(0,153,168,0.3)` }} onClick={() => setPicked(null)}>Try again</button>}
    </div>
  )
}

function Section({ icon, iconBg, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
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

// Normal random number generator (Box-Muller)
function randn() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function drawSample(n, mu = 100, sigma = 15) {
  let sum = 0
  for (let i = 0; i < n; i++) sum += mu + sigma * randn()
  return +(sum / n).toFixed(1)
}

// ── Sampling Variability Simulator ──
function Simulator() {
  const MU = 100
  const SIGMA = 15
  const [n, setN] = useState(20)
  const [dots, setDots] = useState([])
  const [lastMean, setLastMean] = useState(null)
  const [resetMsg, setResetMsg] = useState('')
  const prevN = useRef(20)

  function handleNChange(newN) {
    if (newN !== prevN.current) {
      setDots([])
      setLastMean(null)
      setResetMsg(`Sample size changed to ${newN}. Starting a new set of samples.`)
      prevN.current = newN
    }
    setN(newN)
  }

  function handleDraw() {
    setResetMsg('')
    const mean = drawSample(n, MU, SIGMA)
    setLastMean(mean)
    setDots(d => [...d, mean])
  }

  // Plot config
  const plotMin = 70, plotMax = 130, plotW = 560, plotH = 140
  const toX = v => ((v - plotMin) / (plotMax - plotMin)) * plotW
  const muX = toX(MU)

  // Jitter dots vertically by index so they don't stack
  const DOT_R = 5
  const rows = []
  dots.forEach((v, i) => {
    const x = toX(v)
    let row = 0
    while (rows[row] && rows[row].some(rx => Math.abs(rx - x) < DOT_R * 2.4)) row++
    if (!rows[row]) rows[row] = []
    rows[row].push(x)
  })
  const dotPositions = []
  let ri = 0
  dots.forEach((v, i) => {
    const x = toX(v)
    let row = 0
    while (dotPositions.filter((_, j) => j < i).some((dp, j) => dp.row === row && Math.abs(dp.x - x) < DOT_R * 2.4)) row++
    dotPositions.push({ x, row, v })
  })
  const maxRow = dotPositions.reduce((m, d) => Math.max(m, d.row), 0)
  const baseY = plotH - 20
  const rowH = Math.min(DOT_R * 2.4, maxRow > 0 ? (baseY - 10) / (maxRow + 1) : DOT_R * 2.4)

  return (
    <div style={{ marginTop: 8 }}>
      {/* Live stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 130, background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Population mean (μ)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{MU}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Fixed. Always 100.</div>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Current sample mean (x̄)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.coral, fontFamily: "'JetBrains Mono', monospace" }}>{lastMean !== null ? lastMean : '—'}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Changes every draw.</div>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Samples drawn</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{dots.length}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>n = {n} per sample</div>
        </div>
      </div>

      {/* n slider */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
          <span>Sample size (n)</span>
          <span style={{ fontWeight: 600, color: C.text }}>{n}</span>
        </div>
        <input type="range" min={5} max={200} step={5} value={n}
          onChange={e => handleNChange(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: C.teal, cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginTop: 2 }}>
          <span>n = 5 (scattered)</span><span>n = 200 (tight)</span>
        </div>
      </div>

      {/* Reset message */}
      {resetMsg && (
        <div style={{ fontSize: 12, color: C.amber, background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 6, padding: '7px 12px', marginBottom: 10 }}>
          {resetMsg}
        </div>
      )}

      {/* Dot plot */}
      <div style={{ background: C.alt, borderRadius: 10, border: `1px solid ${C.border}`, padding: '12px 12px 8px', marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Sample means (x̄) — each dot is one sample
        </div>
        <svg width={plotW} height={plotH} style={{ display: 'block', maxWidth: '100%' }}>
          {/* Background zones */}
          <rect x={0} y={0} width={plotW} height={plotH - 20} fill={C.surface} rx={6} />

          {/* μ line */}
          <line x1={muX} y1={0} x2={muX} y2={plotH - 20} stroke={C.purple} strokeWidth={2} strokeDasharray="4 3" />
          <text x={muX + 4} y={13} fontSize={11} fill={C.purple} fontWeight="600">μ = {MU}</text>

          {/* Dots */}
          {dotPositions.map((dp, i) => {
            const y = baseY - dp.row * rowH - DOT_R
            const isLast = i === dots.length - 1
            return (
              <circle key={i} cx={dp.x} cy={Math.max(DOT_R + 2, y)} r={DOT_R}
                fill={isLast ? C.coral : C.teal}
                fillOpacity={isLast ? 1 : 0.6}
                stroke={isLast ? C.coral : 'none'}
                strokeWidth={isLast ? 1.5 : 0}
              />
            )
          })}

          {/* Axis */}
          <line x1={0} y1={plotH - 20} x2={plotW} y2={plotH - 20} stroke={C.border} strokeWidth={1.5} />
          {[70, 80, 90, 100, 110, 120, 130].map(v => (
            <g key={v}>
              <line x1={toX(v)} y1={plotH - 20} x2={toX(v)} y2={plotH - 14} stroke={C.muted} strokeWidth={1} />
              <text x={toX(v)} y={plotH - 4} textAnchor="middle" fontSize={10} fill={C.muted}>{v}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Draw button */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleDraw} style={{
          flex: 1, padding: '11px 0', background: C.teal, color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s'
        }}>
          Draw Sample (n = {n})
        </button>
        {dots.length > 0 && (
          <button onClick={() => { setDots([]); setLastMean(null); setResetMsg('') }} style={{
            padding: '11px 18px', background: 'none', color: C.dim,
            border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Clear
          </button>
        )}
      </div>

      {dots.length >= 5 && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
          <strong style={{ color: C.amber }}>Notice:</strong> The population hasn't changed — μ is still {MU}. But every sample gives a different x̄. This is <strong style={{ color: C.text }}>sampling variability</strong>, and it's the reason every estimate in statistics comes with uncertainty.
          {dots.length >= 15 && n <= 30 && <span> Now try increasing n to 100 or more and draw again — watch what happens to the spread.</span>}
        </div>
      )}
    </div>
  )
}

export default function PopulationVsSample() {
  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Population vs. Sample</div>
      <div style={s.pageSub}>
        The definitions are easy. The hard part — and the idea that explains everything else in the course — is understanding why samples vary.
      </div>

      {/* 1. Core distinction */}
      <Section icon="○" iconBg={C.coralSoft} title="Population vs. Sample" defaultOpen={true}>
        <Concept title="The core distinction">
          <p style={s.prose}>
            A <strong style={{ color: C.text }}>population</strong> is the entire group you want to draw conclusions about.
            A <strong style={{ color: C.text }}>sample</strong> is the subset you actually measure.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '14px 0' }}>
            <div style={{ background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Population</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                What we <em>want</em> to know about.<br/>
                Usually too large to measure fully.<br/>
                Described by <strong style={{ color: C.text }}>parameters</strong>.<br/>
                Parameters are <strong style={{ color: C.text }}>fixed</strong> — they don't change.
              </div>
            </div>
            <div style={{ background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Sample</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                What we <em>actually</em> measure.<br/>
                A subset drawn from the population.<br/>
                Described by <strong style={{ color: C.text }}>statistics</strong>.<br/>
                Statistics <strong style={{ color: C.text }}>vary</strong> from sample to sample.
              </div>
            </div>
          </div>
          <div style={s.example}>
            <div style={s.exampleLabel}>Public health example</div>
            Population: all adults in the United States with hypertension.<br/>
            Sample: 850 adults with hypertension enrolled in a clinical trial at three sites.
          </div>
        </Concept>

        <Quiz
          q="A researcher wants to estimate average blood pressure among all adults in Georgia. She measures 300 volunteers at a community health fair. What is the population?"
          options={[
            "The 300 volunteers at the health fair",
            "All adults in Georgia",
            "All adults in the United States",
            "Adults with high blood pressure"
          ]}
          answer={1}
          explain="The population is the group the researcher wants to draw conclusions about — all adults in Georgia. The 300 volunteers are the sample."
        />
      </Section>

      {/* 2. Why we sample */}
      <Section icon="?" iconBg={C.amberSoft} title="Why We Sample">
        <Concept title="Three reasons we never measure everyone">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '10px 0' }}>
            {[
              { reason: 'Cost', icon: '$', example: 'Measuring blood lead levels in every child in the United States would cost billions of dollars.', color: C.coral },
              { reason: 'Time', icon: '⏱', example: 'Interviewing every adult about vaccine attitudes would take years — too slow to be useful.', color: C.teal },
              { reason: 'Destructive testing', icon: '⚗', example: 'Testing every blood sample until it is exhausted leaves nothing for the patient.', color: C.purple },
            ].map(item => (
              <div key={item.reason} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: C.alt, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 20, width: 28, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: item.color, marginBottom: 3 }}>{item.reason}</div>
                  <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{item.example}</div>
                </div>
              </div>
            ))}
          </div>
        </Concept>

        <Concept title="Big enough is not the same as representative">
          <p style={s.prose}>
            A common misconception: <em>"if my sample is large, it's good."</em> Size alone doesn't make a sample trustworthy.
            A large biased sample still gives a biased answer.
          </p>
          <div style={{ ...s.example, background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)` }}>
            <div style={{ ...s.exampleLabel, color: C.coral }}>Classic example</div>
            In 1936, a poll of 2.4 million people incorrectly predicted the presidential election — because the sample came from telephone directories and car registration lists, which overrepresented wealthy voters. A random sample of 50,000 got it right.
          </div>
        </Concept>

        <Quiz
          q="Which sample is likely to produce a better estimate of average physical activity among all college students?"
          options={[
            "10,000 volunteers recruited from campus fitness centers",
            "500 students selected at random from the full enrollment list"
          ]}
          answer={1}
          explain="The 500 randomly selected students are more likely to represent all college students. The 10,000 fitness center volunteers are a biased sample — people who go to the gym are not typical of all students, regardless of how many you recruit."
        />
      </Section>

      {/* 3. Simulator */}
      <Section icon="~" iconBg={C.tealSoft} title="Sampling Variability Simulator" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            The population mean is fixed at <strong style={{ color: C.text }}>μ = 100</strong> (think: average systolic blood pressure in a population).
            Each time you draw a sample, you get a different estimate. Watch what happens.
          </p>
          <p style={{ ...s.prose, marginBottom: 16 }}>
            <strong style={{ color: C.text }}>The key question:</strong> Why does x̄ keep changing if the population hasn't changed?
          </p>
          <Simulator />
        </div>
      </Section>

      {/* 4. Parameters vs Statistics */}
      <Section icon="μ" iconBg={C.purpleSoft} title="Parameters vs. Statistics">
        <Concept title="The notation, connected to its purpose">
          <p style={s.prose}>
            Parameters describe populations. Statistics describe samples. We use statistics to <em>estimate</em> parameters — that's the entire point.
          </p>
          <div style={{ margin: '12px 0', borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: C.alt, padding: '8px 14px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>What we want</span><span>What we calculate</span><span>Purpose</span>
            </div>
            {[
              { param: 'μ (population mean)', stat: 'x̄ (sample mean)', purpose: 'Estimate average value' },
              { param: 'σ (population SD)', stat: 's (sample SD)', purpose: 'Estimate spread' },
              { param: 'p (population proportion)', stat: 'p̂ (sample proportion)', purpose: 'Estimate prevalence' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 14px', borderTop: `1px solid ${C.border}`, fontSize: 13, background: i % 2 === 0 ? C.surface : C.alt }}>
                <span style={{ color: C.purple, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{row.param}</span>
                <span style={{ color: C.teal, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{row.stat}</span>
                <span style={{ color: C.dim }}>{row.purpose}</span>
              </div>
            ))}
          </div>
        </Concept>

        <Quiz
          q="You calculate x̄ = 142 mg/dL from a sample of 200 patients. Is this a parameter or a statistic?"
          options={[
            "Parameter — it describes the population",
            "Statistic — it describes the sample",
            "Both — it estimates the population mean",
            "Neither — it is just a number"
          ]}
          answer={1}
          explain="x̄ is a statistic. It was calculated from a sample of 200 patients, not from the entire population. We use it to estimate the unknown population parameter μ."
        />
      </Section>

      {/* 5. Inference bridge */}
      <Section icon="→" iconBg={C.greenSoft} title="The Inference Bridge">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            This diagram captures almost everything in the rest of the course.
            Every method you'll learn — confidence intervals, hypothesis tests, p-values — is a tool for crossing this bridge.
          </p>

          <div style={{ margin: '20px 0', padding: '24px', background: C.alt, borderRadius: 12, border: `1px solid ${C.border}` }}>
            {[
              { label: 'Population', sub: 'Unknown parameter (μ, σ, p)', color: C.purple, bg: C.purpleSoft, border: 'rgba(107,63,204,0.2)' },
              { label: 'Random Sample', sub: 'Subset drawn from population', color: C.teal, bg: C.tealSoft, border: 'rgba(0,153,168,0.2)', arrow: '↓ draw' },
              { label: 'Calculate Statistic', sub: 'x̄, s, p̂ from sample data', color: C.amber, bg: C.amberSoft, border: 'rgba(184,112,0,0.2)', arrow: '↓ compute' },
              { label: 'Inference', sub: 'CI, hypothesis test, p-value', color: C.coral, bg: C.coralSoft, border: 'rgba(232,69,42,0.2)', arrow: '↓ apply' },
              { label: 'Estimate Parameter', sub: 'Best guess at μ, σ, p', color: C.green, bg: C.greenSoft, border: 'rgba(26,122,62,0.2)', arrow: '↓ conclude' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {step.arrow && <div style={{ fontSize: 12, color: C.muted, margin: '4px 0', fontWeight: 600 }}>{step.arrow}</div>}
                <div style={{ width: '100%', maxWidth: 380, background: step.bg, border: `1px solid ${step.border}`, borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: step.color }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: C.dim, marginTop: 3 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={s.example}>
            <div style={s.exampleLabel}>What this means for the course</div>
            Every statistical method you'll learn this semester lives in the "Inference" box.
            Confidence intervals and hypothesis tests are different tools for doing the same thing: using sample statistics to make defensible claims about population parameters.
          </div>
        </div>
      </Section>

    </div>
  )
}
