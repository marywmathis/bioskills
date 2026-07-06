import { useState, useRef } from 'react'

// Stat notation helpers — unicode combining diacritics render inconsistently across browsers
const XBar = ({ style }) => (
  <span style={{ display: 'inline-block', position: 'relative', ...style }}>
    <span style={{ position: 'absolute', top: '-0.45em', left: 0, right: 0, textAlign: 'center', fontSize: '0.7em', lineHeight: 1 }}>—</span>
    x
  </span>
)
const PHat = ({ style }) => (
  <span style={{ display: 'inline-block', position: 'relative', ...style }}>
    <span style={{ position: 'absolute', top: '-0.5em', left: 0, right: 0, textAlign: 'center', fontSize: '0.75em', lineHeight: 1 }}>^</span>
    p
  </span>
)

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
      {done && (
        <div style={{ marginTop: 10, fontSize: 13, color: C.dim, lineHeight: 1.7, padding: '10px 12px', background: correct ? C.tealSoft : C.coralSoft, borderRadius: 7, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}` }}>
          {feedback}
        </div>
      )}
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

  // Dynamic axis: scale based on expected SE
  const se = SIGMA / Math.sqrt(n)
  const span = Math.max(6, Math.ceil(se * 4))
  const plotMin = MU - span
  const plotMax = MU + span

  const plotW = 560, plotH = 140
  const toX = v => ((v - plotMin) / (plotMax - plotMin)) * plotW
  const muX = toX(MU)

  // Running average
  const runningAvg = dots.length > 0 ? (dots.reduce((a, b) => a + b, 0) / dots.length).toFixed(1) : null

  // Jitter dots vertically
  const DOT_R = 5
  const dotPositions = []
  dots.forEach((v, i) => {
    const x = toX(Math.max(plotMin, Math.min(plotMax, v)))
    let row = 0
    while (dotPositions.filter((_, j) => j < i).some((dp) => dp.row === row && Math.abs(dp.x - x) < DOT_R * 2.4)) row++
    dotPositions.push({ x, row, v })
  })
  const baseY = plotH - 20
  const maxRow = dotPositions.reduce((m, d) => Math.max(m, d.row), 0)
  const rowH = Math.min(DOT_R * 2.4, maxRow > 0 ? (baseY - 10) / (maxRow + 1) : DOT_R * 2.4)

  // Axis ticks
  const tickStep = span <= 8 ? 2 : span <= 15 ? 5 : 10
  const ticks = []
  for (let v = Math.ceil(plotMin / tickStep) * tickStep; v <= plotMax; v += tickStep) ticks.push(v)

  return (
    <div style={{ marginTop: 8 }}>
      {/* Live stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 130, background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Population mean (μ)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{MU}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>True value (known only in this simulation).</div>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Current sample mean (<XBar />)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.coral, fontFamily: "'JetBrains Mono', monospace" }}>{lastMean !== null ? lastMean : '—'}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Changes every draw.</div>
        </div>
        <div style={{ flex: 1, minWidth: 130, background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Avg of all sample means</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}>{runningAvg !== null ? runningAvg : '—'}</div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{dots.length} sample{dots.length !== 1 ? 's' : ''} drawn.</div>
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
          Sample means (<XBar />) — each dot is one sample {dots.length === 0 && '· draw your first sample below'}
        </div>
        <svg width={plotW} height={plotH} style={{ display: 'block', maxWidth: '100%' }}>
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
                fill={isLast ? C.coral : C.teal} fillOpacity={isLast ? 1 : 0.6}
                stroke={isLast ? C.coral : 'none'} strokeWidth={isLast ? 1.5 : 0}
              />
            )
          })}
          {/* Axis */}
          <line x1={0} y1={plotH - 20} x2={plotW} y2={plotH - 20} stroke={C.border} strokeWidth={1.5} />
          {ticks.map(v => (
            <g key={v}>
              <line x1={toX(v)} y1={plotH - 20} x2={toX(v)} y2={plotH - 14} stroke={C.muted} strokeWidth={1} />
              <text x={toX(v)} y={plotH - 4} textAnchor="middle" fontSize={10} fill={v === MU ? C.purple : C.muted} fontWeight={v === MU ? '700' : '400'}>{v}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Draw button */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleDraw} style={{
          flex: 1, padding: '11px 0', background: C.teal, color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit'
        }}>
          Draw Sample (n = {n})
        </button>
        {dots.length > 0 && (
          <button onClick={() => { setDots([]); setLastMean(null); setResetMsg('') }} style={{
            padding: '11px 18px', background: 'none', color: C.dim,
            border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>Clear</button>
        )}
      </div>

      {dots.length >= 5 && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
          <strong style={{ color: C.amber }}>Notice:</strong> The population mean stayed at {MU} — but each sample gave a different <XBar />. Sample means vary, but they tend to center around the true population mean.
          {dots.length >= 10 && runningAvg && <span> Watch the average of all sample means (currently {runningAvg}) — it keeps settling toward {MU}.</span>}
          {dots.length >= 10 && n <= 30 && <span> Now try moving n to 100 or 150 and draw again — watch the dots tighten.</span>}
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
        The definitions are easy. The hard part — and the idea that explains everything else here — is understanding why samples vary.
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
                What we <em>want</em> to know.<br/>
                Usually too large to measure completely.<br/>
                Described by <strong style={{ color: C.text }}>parameters</strong> (μ, σ, p).<br/>
                <strong style={{ color: C.text }}>One true value exists.</strong><br/>
                The challenge: we usually don't know what it is.
              </div>
            </div>
            <div style={{ background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Sample</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                What we <em>actually</em> measure.<br/>
                A subset drawn from the population.<br/>
                Described by <strong style={{ color: C.text }}>statistics</strong> (<XBar />, s, <PHat />).<br/>
                <strong style={{ color: C.text }}>Many possible values</strong> could be observed.<br/>
                We use statistics to estimate parameters.
              </div>
            </div>
          </div>

          {/* Hidden μ visual */}
          <div style={{ margin: '16px 0', padding: '16px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>What this looks like in practice</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              {/* Population box */}
              <div style={{ background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.25)`, borderRadius: 10, padding: '12px 24px', textAlign: 'center', width: '100%', maxWidth: 320 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Population</div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>True average cholesterol of all U.S. adults</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: C.purple }}>μ = <span style={{ background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 6, padding: '2px 10px' }}>?</span></div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>One true value exists — but we can't measure everyone.</div>
              </div>

              <div style={{ fontSize: 12, color: C.muted, margin: '8px 0', fontWeight: 600 }}>↓ draw different samples</div>

              {/* Three samples */}
              <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { n: 1, xbar: '194.2' },
                  { n: 2, xbar: '198.7' },
                  { n: 3, xbar: '191.5' },
                ].map(s => (
                  <div key={s.n} style={{ background: C.tealSoft, border: `1px solid rgba(0,153,168,0.25)`, borderRadius: 8, padding: '10px 16px', textAlign: 'center', flex: '1 1 80px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Sample {s.n}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: C.teal }}><XBar /> = {s.xbar}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6, width: '100%', textAlign: 'center' }}>
                The population mean didn't change. Our <em>estimate</em> changed because we drew different samples.<br/>
                <strong style={{ color: C.amber }}>This is the entire motivation for statistical inference.</strong>
              </div>
            </div>
          </div>

          <div style={s.example}>
            <div style={s.exampleLabel}>Public health example</div>
            Population: all adults in the United States with hypertension.<br/>
            Sample: 850 adults with hypertension enrolled in a clinical trial at three sites.<br/>
            <span style={{ marginTop: 6, display: 'block', color: C.teal, fontStyle: 'italic' }}>
              If we want to know μ (the true mean blood pressure), we estimate it with <XBar /> from our sample — and acknowledge we could be off.
            </span>
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
              { reason: 'Feasibility', icon: '🌐', example: 'The population is simply too large or difficult to reach completely. A national health survey cannot locate and measure every eligible adult.', color: C.purple },
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

        <p style={{ ...s.prose, padding: '10px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, color: C.dim }}>
          Because we cannot usually measure the entire population, we collect a sample and use it to estimate the population parameter. That's what the rest of these tools are about.
        </p>

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
            <strong style={{ color: C.text }}>The key question:</strong> Why does <XBar /> keep changing if the population hasn't changed?
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
              {
                param: <span>μ &nbsp;<span style={{color: C.muted, fontWeight:400}}>(population mean)</span></span>,
                stat: <span style={{display:'inline-flex',alignItems:'baseline',gap:2}}><span style={{position:'relative',display:'inline-block'}}><span style={{position:'absolute',top:-6,left:'50%',transform:'translateX(-50%)',fontSize:10,lineHeight:1}}>—</span>x</span><span style={{color:C.muted,fontWeight:400}}>&nbsp;(sample mean)</span></span>,
                purpose: 'Estimate average value'
              },
              {
                param: <span>σ² &nbsp;<span style={{color: C.muted, fontWeight:400}}>(population variance)</span></span>,
                stat: <span>s² &nbsp;<span style={{color:C.muted,fontWeight:400}}>(sample variance)</span></span>,
                purpose: 'Estimate spread (squared units)'
              },
              {
                param: <span>σ &nbsp;<span style={{color: C.muted, fontWeight:400}}>(population SD)</span></span>,
                stat: <span>s &nbsp;<span style={{color:C.muted,fontWeight:400}}>(sample SD)</span></span>,
                purpose: 'Estimate spread'
              },
              {
                param: <span>p &nbsp;<span style={{color: C.muted, fontWeight:400}}>(population proportion)</span></span>,
                stat: <span style={{display:'inline-flex',alignItems:'baseline',gap:2}}><span style={{position:'relative',display:'inline-block'}}><span style={{position:'absolute',top:-7,left:'50%',transform:'translateX(-50%)',fontSize:11,lineHeight:1}}>^</span>p</span><span style={{color:C.muted,fontWeight:400}}>&nbsp;(sample proportion)</span></span>,
                purpose: 'Estimate prevalence'
              },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 14px', borderTop: `1px solid ${C.border}`, fontSize: 13, background: i % 2 === 0 ? C.surface : C.alt, alignItems: 'center' }}>
                <span style={{ color: C.purple, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{row.param}</span>
                <span style={{ color: C.teal, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{row.stat}</span>
                <span style={{ color: C.dim }}>{row.purpose}</span>
              </div>
            ))}
          </div>

          <div style={{ margin: '12px 0 4px', borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', background: C.alt, padding: '8px 14px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Formula</span><span style={{ color: C.purple }}>Population</span><span style={{ color: C.teal }}>Sample</span>
            </div>
            {[
              {
                label: 'Variance',
                pop: <span>σ² = Σ(x<sub>i</sub> − μ)² / N</span>,
                samp: <span>s² = Σ(x<sub>i</sub> − <XBar />)² / (n − 1)</span>,
              },
              {
                label: 'Standard deviation',
                pop: <span>σ = √( Σ(x<sub>i</sub> − μ)² / N )</span>,
                samp: <span>s = √( Σ(x<sub>i</sub> − <XBar />)² / (n − 1) )</span>,
              },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', padding: '10px 14px', borderTop: `1px solid ${C.border}`, fontSize: 13, background: i % 2 === 0 ? C.surface : C.alt, alignItems: 'center', gap: 8 }}>
                <span style={{ color: C.dim, fontWeight: 600 }}>{row.label}</span>
                <span style={{ color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{row.pop}</span>
                <span style={{ color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}>{row.samp}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 0 }}>
            Population forms use μ and divide by N. Sample forms use <XBar /> and divide by n − 1. The section below explains why.
          </p>
        </Concept>

        <Quiz
          q={<span>You calculate <XBar /> = 142 mg/dL from a sample of 200 patients. Is this a parameter or a statistic?</span>}
          options={[
            "Parameter — it describes the population",
            "Statistic — it was calculated from a sample",
            "Both — it estimates the population mean",
            "Neither — it is just a number"
          ]}
          answer={1}
          explain={<span>Correct. <XBar /> is a statistic because it was calculated from a sample of 200 patients, not from the entire population. We use it to estimate the <strong>unknown</strong> population parameter μ — but estimating μ does not make it μ.</span>}
          wrongExplain={{
            0: <span>Not quite. A parameter describes the entire population, while a statistic is calculated from a sample. The value 142 mg/dL came from 200 patients — not everyone. We hope it is close to the population mean (μ), but it is not μ itself.</span>,
            2: <span>Close, but not quite. <XBar /> is a statistic because it was calculated from a sample. You're right that it estimates μ — but estimating a parameter does not make it a parameter. The distinction is where the number came from: a sample gives a statistic, the full population gives a parameter.</span>,
            3: <span>Any number calculated from a sample is a statistic. Since 142 mg/dL came from a sample of 200 patients, it is a sample statistic (<XBar />). Statistics are how we estimate population parameters when we can't measure everyone.</span>
          }}
        />

        <Concept title="Describing spread: variance and standard deviation">
          <p style={s.prose}>
            The mean tells you the center. <strong style={{ color: C.text }}>Standard deviation</strong> tells you the spread — how far values typically fall from that center. It is built from <strong style={{ color: C.text }}>variance</strong>, so start there.
          </p>
          <p style={s.prose}>
            Variance is the average of the squared distances from the mean. You square each distance so that values above and below the mean do not cancel out. The drawback: squaring also squares the units. Glucose measured in mg/dL produces a variance in mg/dL² — a number you can't read directly.
          </p>
          <p style={s.prose}>
            Standard deviation fixes that. Take the square root of the variance and you are back in the original units (mg/dL). That is why standard deviation, not variance, is usually the number reported: it reads as "a typical patient falls about this far from the average."
          </p>
          <p style={s.prose}>
            There are two versions, shown in the formula table above. When you have the whole population, variance divides by N — the full count. When you have only a sample, it divides by <strong style={{ color: C.text }}>n − 1</strong> instead.
          </p>
          <p style={s.prose}>
            Why one less? A sample's values sit a little closer to their own average than to the true population average, so dividing by the full count would make the spread look smaller than it really is. Subtracting one nudges the estimate up to compensate. σ is the population's true spread; s is your best estimate of it from a sample.
          </p>
          <div style={s.example}>
            <div style={s.exampleLabel}>Worked example — same data, two divisors</div>
            Five fasting glucose readings: 130, 138, 142, 150, 150 mg/dL. The mean is 142, and the squared distances from 142 add up to 288.
            <div style={{ marginTop: 8 }}>
              <div>Sample (÷ n − 1 = 4): 288 ÷ 4 = 72 &nbsp;→&nbsp; s = √72 ≈ <strong style={{ color: C.text }}>8.5 mg/dL</strong></div>
              <div>Population (÷ N = 5): 288 ÷ 5 = 57.6 &nbsp;→&nbsp; σ = √57.6 ≈ <strong style={{ color: C.text }}>7.6 mg/dL</strong></div>
            </div>
            <div style={{ marginTop: 8 }}>
              Since these came from a sample, you would report s ≈ 8.5. Dividing by n − 1 gives the slightly larger, more honest estimate of the population's spread.
            </div>
          </div>
        </Concept>

        <Quiz
          q="Which statement about spread is correct?"
          options={[
            "Standard deviation is variance squared.",
            "Standard deviation is the square root of variance, and the sample version divides by n − 1 to avoid understating the population's spread.",
            "Variance and standard deviation are two names for the same number.",
            "The sample standard deviation divides by n − 1 to make the value smaller."
          ]}
          answer={1}
          explain={<span>Correct. Standard deviation is the square root of variance — that is what returns it to the original units. And because a sample underestimates the population's spread, the sample version divides by n − 1, which nudges the estimate up.</span>}
          wrongExplain={{
            0: <span>Reversed. Variance comes first (the average of squared distances), and standard deviation is its square root — not the other way around. Squaring the standard deviation gives you back the variance.</span>,
            2: <span>Not quite. They are linked but not equal: variance is in squared units, and standard deviation is its square root, back in the original units. You report the standard deviation because it is directly readable.</span>,
            3: <span>The direction is backwards. Dividing by n − 1 instead of n makes the estimate slightly <em>larger</em>, not smaller. That correction exists because a sample's spread understates the population's, so the estimate needs to be nudged up.</span>
          }}
        />
      </Section>

      {/* 5. Inference bridge */}
      <Section icon="→" iconBg={C.greenSoft} title="The Inference Bridge">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            This diagram captures almost everything in the tools that follow.
            Every method you'll learn — confidence intervals, hypothesis tests, p-values — is a tool for crossing this bridge.
          </p>

          <div style={{ margin: '20px 0', padding: '24px', background: C.alt, borderRadius: 12, border: `1px solid ${C.border}` }}>
            {[
              { label: 'Population', sub: 'Unknown parameter (μ, σ, p)', color: C.purple, bg: C.purpleSoft, border: 'rgba(107,63,204,0.2)' },
              { label: 'Random Sample', sub: 'Subset drawn from population', color: C.teal, bg: C.tealSoft, border: 'rgba(0,153,168,0.2)', arrow: '↓ draw' },
              { label: 'Calculate Statistic', sub: (<span><XBar />, s, <PHat /> from sample data</span>), color: C.amber, bg: C.amberSoft, border: 'rgba(184,112,0,0.2)', arrow: '↓ compute' },
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
            <div style={s.exampleLabel}>What this means going forward</div>
            Every statistical method you'll learn this semester lives in the "Inference" box.
            Confidence intervals and hypothesis tests are different tools for doing the same thing: using sample statistics to make defensible claims about population parameters.
          </div>
        </div>
      </Section>

    </div>
  )
}
