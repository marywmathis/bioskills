import { useState, useEffect, useRef, useCallback } from 'react'
import { C, s, Section, XBar, PHat } from './utils'

// ── Constants ──
const TRUE_P = 0.40
const DEFAULT_N = 100
const DEFAULT_CONF = 0.95

// ── Math helpers ──
const Z_VALUES = { 0.90: 1.645, 0.95: 1.96, 0.99: 2.576 }

function calcCI(n, x, conf) {
  const p = x / n
  const z = Z_VALUES[conf] || 1.96
  const se = Math.sqrt(p * (1 - p) / n)
  const me = z * se
  return { p, se, me, lo: Math.max(0, p - me), hi: Math.min(1, p + me), z }
}

function drawSample(n, trueP) {
  let x = 0
  for (let i = 0; i < n; i++) if (Math.random() < trueP) x++
  return x
}

function coversTrue(lo, hi, trueP) { return lo <= trueP && hi >= trueP }

// ── Number line for a single CI ──
function CILine({ lo, hi, p, trueP, color, width = 340, showTrue = true }) {
  const PAD = 20, W = width, H = 44
  const toX = v => PAD + v * (W - PAD * 2)
  const covers = coversTrue(lo, hi, trueP)
  const lineColor = color || (covers ? C.green : C.coral)

  return (
    <svg width={W} height={H} style={{ display: 'block', maxWidth: '100%' }}>
      {/* Axis */}
      <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke={C.border} strokeWidth={1.5} />
      {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => (
        <g key={v}>
          <line x1={toX(v)} y1={H / 2 - 4} x2={toX(v)} y2={H / 2 + 4} stroke={C.muted} strokeWidth={1} />
          <text x={toX(v)} y={H - 3} textAnchor="middle" fontSize={9} fill={C.muted}>{v.toFixed(1)}</text>
        </g>
      ))}
      {/* CI bar */}
      <line x1={toX(lo)} y1={H / 2} x2={toX(hi)} y2={H / 2} stroke={lineColor} strokeWidth={3} />
      <line x1={toX(lo)} y1={H / 2 - 6} x2={toX(lo)} y2={H / 2 + 6} stroke={lineColor} strokeWidth={2} />
      <line x1={toX(hi)} y1={H / 2 - 6} x2={toX(hi)} y2={H / 2 + 6} stroke={lineColor} strokeWidth={2} />
      {/* Point estimate */}
      <circle cx={toX(p)} cy={H / 2} r={4} fill={lineColor} />
      {/* True p line */}
      {showTrue && (
        <>
          <line x1={toX(trueP)} y1={4} x2={toX(trueP)} y2={H - 12} stroke={C.purple} strokeWidth={2} strokeDasharray="3 2" />
          <text x={toX(trueP)} y={12} textAnchor="middle" fontSize={9} fill={C.purple} fontWeight="700">p=0.40</text>
        </>
      )}
    </svg>
  )
}

// ── Repeated sampling simulation ──
function SimSection() {
  const [intervals, setIntervals] = useState([])
  const [phase, setPhase] = useState('intro') // intro | revealed | running | paused | done
  const [autoRunning, setAutoRunning] = useState(false)
  const [reflectPick, setReflectPick] = useState(null)
  const [advanced, setAdvanced] = useState(false)
  const [simN, setSimN] = useState(DEFAULT_N)
  const [simConf, setSimConf] = useState(DEFAULT_CONF)
  const intervalRef = useRef(null)

  const addSamples = useCallback((count) => {
    setIntervals(prev => {
      const next = [...prev]
      for (let i = 0; i < count; i++) {
        const x = drawSample(simN, TRUE_P)
        const ci = calcCI(simN, x, simConf)
        next.push({ ...ci, x, n: simN, covers: coversTrue(ci.lo, ci.hi, TRUE_P) })
      }
      return next
    })
  }, [simN, simConf])

  // Auto-draw 10 after reveal
  useEffect(() => {
    if (phase === 'revealed') {
      let count = 0
      const timer = setInterval(() => {
        addSamples(1)
        count++
        if (count >= 10) {
          clearInterval(timer)
          setPhase('paused')
        }
      }, 180)
      return () => clearInterval(timer)
    }
  }, [phase, addSamples])

  // Manual auto-run
  useEffect(() => {
    if (autoRunning) {
      intervalRef.current = setInterval(() => {
        setIntervals(prev => {
          const x = drawSample(simN, TRUE_P)
          const ci = calcCI(simN, x, simConf)
          return [...prev, { ...ci, x, n: simN, covers: coversTrue(ci.lo, ci.hi, TRUE_P) }]
        })
      }, 60)
      return () => clearInterval(intervalRef.current)
    }
  }, [autoRunning, simN, simConf])

  function reset() {
    setIntervals([])
    setPhase('intro')
    setAutoRunning(false)
    setReflectPick(null)
    clearInterval(intervalRef.current)
  }

  const covered = intervals.filter(i => i.covers).length
  const missed = intervals.length - covered

  // Stack display — show last 50
  const displayIntervals = intervals.slice(-50)
  const CI_H = 7, CI_GAP = 2
  const stackH = Math.max(60, displayIntervals.length * (CI_H + CI_GAP) + 20)
  const PAD = 20, PLOT_W = 460

  function toX(v) { return PAD + v * (PLOT_W - PAD * 2) }

  return (
    <div>
      {/* Phase: intro */}
      {phase === 'intro' && (
        <div style={{ padding: '20px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10, marginBottom: 14 }}>
          <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 12 }}>
            Imagine you are studying adult vaccination rates in a large population. The true vaccination rate exists right now — some specific number — but <strong style={{ color: C.text }}>you don't know it.</strong> That's exactly why you collected a sample.
          </p>
          <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.75, marginBottom: 16 }}>
            In this simulation, we'll make the invisible visible. You'll see the true population proportion — and then watch what happens when you draw repeated samples and build a confidence interval from each one.
          </p>
          <button onClick={() => setPhase('revealed')}
            style={{ padding: '11px 24px', background: C.purple, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Reveal the population truth →
          </button>
        </div>
      )}

      {/* Phase: revealed + running */}
      {phase !== 'intro' && (
        <div>
          {/* True p callout */}
          <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              True population proportion (hidden in real studies)
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Mini dot grid: 100 dots, 40 purple, 60 gray */}
              <div style={{ flexShrink: 0 }}>
                <svg width={110} height={55} style={{ display: 'block' }}>
                  {Array.from({ length: 100 }, (_, i) => {
                    const col = i % 10, row = Math.floor(i / 10)
                    return (
                      <circle key={i} cx={6 + col * 10} cy={6 + row * 10} r={4}
                        fill={i < 40 ? C.purple : C.muted} fillOpacity={i < 40 ? 0.8 : 0.3} />
                    )
                  })}
                </svg>
                <div style={{ fontSize: 10, color: C.purple, fontWeight: 600, textAlign: 'center', marginTop: 2 }}>40 of 100 = 40%</div>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: C.purple, marginBottom: 6 }}>p = 0.40</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                  40% of the entire population has the characteristic we're studying (e.g., 40% are vaccinated).
                </div>
                <div style={{ fontSize: 12, color: C.purple, marginTop: 6, fontStyle: 'italic' }}>
                  We know p only because we created this simulation. In a real study, p is unknown — that's exactly why we collect a sample and calculate a confidence interval.
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {intervals.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 100, padding: '10px 12px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Contained p = 0.40</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.green, fontFamily: "'JetBrains Mono', monospace" }}>{covered}</div>
              </div>
              <div style={{ flex: 1, minWidth: 100, padding: '10px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Missed p = 0.40</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.coral, fontFamily: "'JetBrains Mono', monospace" }}>{missed}</div>
              </div>
              <div style={{ flex: 1, minWidth: 100, padding: '10px 12px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Coverage rate</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{intervals.length > 0 ? (covered / intervals.length * 100).toFixed(0) : '—'}%</div>
              </div>
            </div>
          )}

          {/* Stack plot */}
          <div style={{ background: C.alt, borderRadius: 10, padding: '12px', border: `1px solid ${C.border}`, marginBottom: 12, overflowX: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
              Each row = one 95% CI from one sample (n={simN}) &nbsp;|&nbsp;
              <span style={{ color: C.green }}>■ contains p=0.40</span> &nbsp;
              <span style={{ color: C.coral }}>■ misses p=0.40</span> &nbsp;
              <span style={{ color: C.purple }}>| p=0.40</span>
            </div>
            <svg width={PLOT_W} height={Math.max(60, stackH)} style={{ display: 'block' }}>
              {/* True p line */}
              <line x1={toX(TRUE_P)} y1={0} x2={toX(TRUE_P)} y2={stackH} stroke={C.purple} strokeWidth={1.5} strokeDasharray="4 2" />
              <text x={toX(TRUE_P)} y={10} textAnchor="middle" fontSize={9} fill={C.purple} fontWeight="700">p=0.40</text>
              {/* Axis */}
              <line x1={PAD} y1={stackH - 12} x2={PLOT_W - PAD} y2={stackH - 12} stroke={C.border} strokeWidth={1} />
              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => (
                <g key={v}>
                  <line x1={toX(v)} y1={stackH - 14} x2={toX(v)} y2={stackH - 10} stroke={C.muted} strokeWidth={1} />
                  <text x={toX(v)} y={stackH - 2} textAnchor="middle" fontSize={8} fill={C.muted}>{v.toFixed(1)}</text>
                </g>
              ))}
              {/* Intervals */}
              {displayIntervals.map((ci, i) => {
                const y = 16 + i * (CI_H + CI_GAP)
                const col = ci.covers ? C.green : C.coral
                return (
                  <g key={i}>
                    <line x1={toX(ci.lo)} y1={y + CI_H / 2} x2={toX(ci.hi)} y2={y + CI_H / 2} stroke={col} strokeWidth={CI_H} strokeLinecap="round" strokeOpacity={0.7} />
                    <circle cx={toX(ci.p)} cy={y + CI_H / 2} r={2} fill={col} />
                  </g>
                )
              })}
              {intervals.length === 0 && (
                <text x={PLOT_W / 2} y={stackH / 2} textAnchor="middle" fontSize={12} fill={C.muted}>Samples will appear here...</text>
              )}
            </svg>
          </div>

          {/* Pause prompt */}
          {phase === 'paused' && intervals.length > 0 && (
            <div style={{ padding: '14px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.amber, marginBottom: 8 }}>What do you notice?</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                Most intervals contain the true population proportion (p = 0.40) — but not all. Each interval was calculated from a different random sample of the same population. The population itself never changed. The confidence intervals changed because the <em>samples</em> changed. That's sampling variability in action.
              </div>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {phase === 'paused' && (
              <>
                <button onClick={() => { setPhase('running'); addSamples(1) }} style={{ padding: '8px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: C.dim }}>Draw 1 sample</button>
                <button onClick={() => { setPhase('running'); addSamples(10) }} style={{ padding: '8px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: C.dim }}>Draw 10 samples</button>
                <button onClick={() => { setPhase('running'); addSamples(40) }} style={{ padding: '8px 14px', background: C.teal, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Draw 50 samples</button>
              </>
            )}
            {phase === 'running' && (
              <>
                <button onClick={() => addSamples(1)} style={{ padding: '8px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: C.dim }}>+1</button>
                <button onClick={() => addSamples(10)} style={{ padding: '8px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: C.dim }}>+10</button>
                <button onClick={() => addSamples(40)} style={{ padding: '8px 14px', background: C.teal, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+50</button>
                <button onClick={() => setAutoRunning(r => !r)} style={{ padding: '8px 14px', background: autoRunning ? C.coralSoft : C.surface, border: `1px solid ${autoRunning ? C.coral : C.border}`, borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: autoRunning ? C.coral : C.dim }}>
                  {autoRunning ? '⏸ Pause auto' : '▶ Auto-draw'}
                </button>
              </>
            )}
            <button onClick={reset} style={{ padding: '8px 14px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: C.dim }}>↺ Reset</button>
          </div>

          {/* Reflection — after 20+ intervals */}
          {intervals.length >= 20 && !reflectPick && (
            <div style={{ padding: '14px 16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Which interpretation is correct?</div>
              {[
                { val: 0, label: 'There is a 95% chance the true proportion is inside any one of these intervals.' },
                { val: 1, label: 'Each interval either contains the true proportion or it doesn\'t. The 95% refers to the long-run success rate of the procedure.' },
              ].map(opt => (
                <button key={opt.val} onClick={() => setReflectPick(opt.val)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 13px', marginBottom: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, color: C.dim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {reflectPick !== null && (
            <div style={{ padding: '12px 14px', background: reflectPick === 1 ? C.tealSoft : C.coralSoft, border: `1px solid ${reflectPick === 1 ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, marginBottom: 12, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              {reflectPick === 1
                ? <><strong style={{ color: C.teal }}>Correct.</strong> Look at the red intervals — they do not contain the true population proportion (p = 0.40), even though each was built correctly from its sample. The population never changed. The samples changed, producing different intervals. The 95% describes the long-run success rate of the procedure, not the probability for any one interval.</>
                : <><strong style={{ color: C.coral }}>Not quite.</strong> Look at the red intervals. They miss the true population proportion (p = 0.40) — yet they were built using exactly the same procedure as the green ones. Once an interval is computed from a sample, the true value is either inside it or it isn't. The 95% describes how often the procedure succeeds across many repeated samples, not the probability for any individual interval.</>
              }
            </div>
          )}

          {/* Advanced mode */}
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => setAdvanced(a => !a)} style={{ fontSize: 12, color: C.dim, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {advanced ? 'Hide' : 'Advanced: adjust simulation parameters'}
            </button>
            {advanced && (
              <div style={{ marginTop: 10, padding: '12px', background: C.alt, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                    <span>Sample size (n)</span><span style={{ fontWeight: 600, color: C.text }}>{simN}</span>
                  </div>
                  <input type="range" min={20} max={500} step={10} value={simN} onChange={e => setSimN(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0.90, 0.95, 0.99].map(c => (
                    <button key={c} onClick={() => { setSimConf(c); reset() }}
                      style={{ flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: simConf === c ? C.tealSoft : C.surface, border: `1px solid ${simConf === c ? C.teal : C.border}`, color: simConf === c ? C.teal : C.dim, fontWeight: simConf === c ? 700 : 400 }}>
                      {(c * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── CI Builder interactive ──
function BuilderSection() {
  const [n, setN] = useState(200)
  const [x, setX] = useState(86)
  const [conf, setConf] = useState(0.95)

  const ci = calcCI(n, x, conf)

  return (
    <div>
      <p style={s.prose}>Adjust the sliders and watch every piece of the confidence interval update in real time.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
              <span>Sample size (n)</span><span style={{ fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{n}</span>
            </div>
            <input type="range" min={20} max={1000} step={10} value={n} onChange={e => setN(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
              <span>Number with outcome (x)</span><span style={{ fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{Math.min(x, n)}</span>
            </div>
            <input type="range" min={1} max={n} step={1} value={Math.min(x, n)} onChange={e => setX(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Confidence level</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0.90, 0.95, 0.99].map(c => (
                <button key={c} onClick={() => setConf(c)}
                  style={{ flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: conf === c ? C.teal : C.surface, border: `1px solid ${conf === c ? C.teal : C.border}`, color: conf === c ? '#fff' : C.dim, fontWeight: conf === c ? 700 : 400 }}>
                  {(c * 100).toFixed(0)}%
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Point estimate (p̂)', val: ci.p.toFixed(3), color: C.teal, note: `${Math.min(x, n)} / ${n}` },
            { label: 'Standard error (SE)', val: ci.se.toFixed(4), color: C.amber, note: '√(p̂(1−p̂)/n)' },
            { label: `Critical value (z* for ${(conf*100).toFixed(0)}%)`, val: ci.z.toFixed(3), color: C.purple, note: '' },
            { label: 'Margin of error', val: ci.me.toFixed(4), color: C.coral, note: 'z* × SE' },
          ].map(item => (
            <div key={item.label} style={{ padding: '8px 12px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 1 }}>{item.label}</div>
                {item.note && <div style={{ fontSize: 10, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>{item.note}</div>}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{(conf * 100).toFixed(0)}% Confidence Interval</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: C.purple }}>({ci.lo.toFixed(3)}, {ci.hi.toFixed(3)})</div>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Width: {(ci.hi - ci.lo).toFixed(3)} &nbsp;|&nbsp; ME: ±{ci.me.toFixed(3)}</div>
      </div>

      {/* Number line */}
      <div style={{ background: C.alt, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.border}` }}>
        <CILine lo={ci.lo} hi={ci.hi} p={ci.p} trueP={TRUE_P} color={C.purple} showTrue={false} />
      </div>
    </div>
  )
}

// ── What affects width ──
function WidthSection() {
  const [n, setN] = useState(100)
  const [conf, setConf] = useState(0.95)
  const [history, setHistory] = useState([])
  const baseP = 0.43

  const ci = calcCI(n, Math.round(n * baseP), conf)
  const width = ci.hi - ci.lo

  function handleAction(action) {
    setHistory(h => [...h, { n, conf, width }])
    if (action === 'nUp') setN(v => Math.min(v * 4, 4000))
    if (action === 'nDown') setN(v => Math.max(Math.round(v / 4), 25))
    if (action === 'confUp') setConf(v => v === 0.90 ? 0.95 : v === 0.95 ? 0.99 : 0.99)
    if (action === 'confDown') setConf(v => v === 0.99 ? 0.95 : v === 0.95 ? 0.90 : 0.90)
  }

  const revealed = history.length >= 2

  return (
    <div>
      <p style={s.prose}>Click the buttons below to change the sample size or confidence level. Watch what happens to the interval width.</p>

      <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Current {(conf * 100).toFixed(0)}% CI (n={n}, p̂≈{baseP})</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: C.purple }}>({ci.lo.toFixed(3)}, {ci.hi.toFixed(3)})</div>
        <div style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>Width: <strong style={{ color: C.purple }}>{width.toFixed(3)}</strong></div>
      </div>

      <div style={{ background: C.alt, borderRadius: 8, padding: '10px 12px', border: `1px solid ${C.border}`, marginBottom: 14 }}>
        <CILine lo={ci.lo} hi={ci.hi} p={ci.p} trueP={TRUE_P} color={C.purple} showTrue={false} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: '↑ Increase n', action: 'nUp', color: C.teal },
          { label: '↓ Decrease n', action: 'nDown', color: C.coral },
          { label: '↑ Increase confidence level', action: 'confUp', color: C.amber },
          { label: '↓ Decrease confidence level', action: 'confDown', color: C.green },
        ].map(btn => (
          <button key={btn.action} onClick={() => handleAction(btn.action)}
            style={{ padding: '10px 8px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: btn.color, lineHeight: 1.4 }}>
            {btn.label}
          </button>
        ))}
      </div>

      {revealed && (
        <div style={{ padding: '14px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 8 }}>The tradeoff:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 6, fontSize: 13, color: C.dim }}>
              <strong style={{ color: C.teal }}>Larger n → narrower interval.</strong> Quadrupling the sample size cuts the standard error in half — and halves the interval width. This is why precision is expensive: going from n=100 to n=400 requires four times as many participants to halve the margin of error.
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 6, fontSize: 13, color: C.dim }}>
              <strong style={{ color: C.amber }}>Higher confidence level → wider interval.</strong> Wanting to be 99% confident instead of 95% confident forces a wider net to catch the true value. You can't have both high confidence and high precision without a larger sample.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export ──
export default function CIBuilder() {
  return (
    <div style={s.page}>
      <div style={s.pageTitle}>CI Builder</div>
      <div style={s.pageSub}>
        Confidence intervals are one of the most misunderstood concepts in statistics. Start by watching what they actually do — then learn how they're built.
      </div>

      {/* 1. Simulation first */}
      <Section icon="~" iconBg={C.purpleSoft} title="Watch 95% Confidence in Action" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <SimSection />
        </div>
      </Section>

      {/* 2. What a CI means */}
      <Section icon="?" iconBg={C.tealSoft} title="What a Confidence Interval Actually Means">
        <div style={{ paddingTop: 20 }}>
          <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>The most common misconception</div>
            <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
              "There is a 95% chance the true value is between 0.31 and 0.49."
            </div>
            <div style={{ fontSize: 13, color: C.coral, marginTop: 6, fontWeight: 600 }}>This is not correct. Once an interval is calculated, the true value either is inside it or it isn't.</div>
          </div>
          <div style={{ padding: '14px 16px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>The correct interpretation</div>
            <div style={{ fontSize: 14, color: C.dim, lineHeight: 1.7 }}>
              "This interval was produced by a procedure that, in repeated sampling, would generate intervals containing the true value 95% of the time."
            </div>
            <div style={{ fontSize: 13, color: C.green, marginTop: 6, fontWeight: 600 }}>The 95% describes the method — not the probability that this particular interval is correct.</div>
          </div>
          <div style={{ padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.text }}>In plain language:</strong> If you ran your study 100 times and built a 95% CI each time, about 95 of those 100 intervals would contain the true population value. You saw this in the simulation above — some intervals were red (missed the truth), even though they were built correctly.
          </div>
        </div>
      </Section>

      {/* 3. Formula — narrative build */}
      <Section icon="=" iconBg={C.amberSoft} title="How a Confidence Interval Is Built">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Let's build one step by step, starting with a concrete example.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                step: 'What did we observe?',
                content: '200 adults were surveyed about influenza vaccination. 86 reported receiving the vaccine.',
                formula: null,
                extra: null,
                color: C.teal,
              },
              {
                step: 'What is our best guess about the population?',
                content: <span>Because we selected a random sample, the sample should resemble the population. That makes the sample proportion our best estimate of the unknown population proportion (p). It won't be exactly right — but it's usually close.</span>,
                formula: 'p̂ = 86/200 = 0.43',
                extra: (
                  <div style={{ marginTop: 10, display: 'flex', gap: 16, alignItems: 'center', padding: '10px 14px', background: C.tealSoft, borderRadius: 7, border: `1px solid rgba(0,153,168,0.15)`, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>Population (unknown)</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.purple, fontWeight: 700 }}>p = ?</div>
                    </div>
                    <div style={{ fontSize: 20, color: C.muted }}>↑</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>Sample of 200</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: C.teal, fontWeight: 700 }}>p̂ = 0.43</div>
                    </div>
                    <div style={{ fontSize: 13, color: C.dim, flex: 1, minWidth: 120 }}>The entire purpose of a confidence interval is to use p̂ to learn about p.</div>
                  </div>
                ),
                color: C.teal,
              },
              {
                step: "Why can't we trust that guess exactly?",
                content: "If we drew another random sample of 200 adults, we probably wouldn't get exactly 43% again. Sampling naturally produces different results each time, even when the population hasn't changed. We need to account for that variability.",
                formula: null,
                extra: null,
                color: C.amber,
              },
              {
                step: 'How much do random samples typically vary?',
                content: 'The standard error measures the typical amount of random variation in sample estimates. Small SE = estimates stay close together. Large SE = estimates bounce around more. Larger samples produce smaller standard errors.',
                formula: 'SE = √(p̂(1−p̂)/n) = √(0.43 × 0.57 / 200) = 0.035',
                extra: (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: C.alt, borderRadius: 7, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>If we drew many samples of 200, the estimates might look like:</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['41%', '44%', '39%', '45%', '42%', '43%'].map((v, i) => (
                        <span key={i} style={{ padding: '3px 10px', background: C.tealSoft, borderRadius: 4, fontSize: 12, color: C.teal, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{v}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>The SE (≈3.5%) tells us the typical spread of these estimates around the truth.</div>
                  </div>
                ),
                color: C.amber,
              },
              {
                step: 'How much should we extend the interval for 95% confidence?',
                content: "If we extend too narrowly, we'll miss the true value too often. If we extend too widely, the interval becomes uninformative. For 95% confidence, we extend 1.96 standard errors in each direction — this width captures the true value in about 95% of repeated samples.",
                formula: 'z* = 1.96  (for 95% confidence)',
                extra: null,
                color: C.purple,
              },
              {
                step: 'How wide is the interval?',
                content: 'The margin of error tells us how far above and below our estimate we extend. Here: 43% ± 6.9 percentage points.',
                formula: 'ME = z* × SE = 1.96 × 0.035 = 0.069',
                extra: null,
                color: C.coral,
              },
              {
                step: 'What is our final estimate?',
                content: 'Extend the margin of error in both directions from the point estimate to get our range of plausible values.',
                formula: 'CI = p̂ ± ME = 0.43 ± 0.069 = (0.361, 0.499)',
                extra: null,
                color: C.green,
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: item.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 16 }}>{i + 1}</div>
                  {i < 6 && <div style={{ width: 2, flex: 1, background: C.border, minHeight: 16 }} />}
                </div>
                <div style={{ flex: 1, padding: '14px 14px 14px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{item.step}</div>
                  <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: item.formula ? 8 : 0 }}>{item.content}</div>
                  {item.formula && (
                    <div style={{ background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.amber }}>{item.formula}</div>
                  )}
                  {item.extra}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14, padding: '12px 14px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.green }}>Interpretation:</strong> Based on this sample, we estimate that 43% of adults received the flu vaccine (95% CI: 36.1% to 49.9%). We are confident that if we used this procedure repeatedly, 95% of our intervals would capture the true vaccination rate.
          </div>
        </div>
      </Section>

      {/* 4. Builder */}
      <Section icon="⚙" iconBg={C.tealSoft} title="Build Your Own Confidence Interval">
        <div style={{ paddingTop: 20 }}>
          <BuilderSection />
        </div>
      </Section>

      {/* 5. Width */}
      <Section icon="↔" iconBg={C.amberSoft} title="Can You Make a Confidence Interval Narrower?">
        <div style={{ paddingTop: 20 }}>
          <WidthSection />
        </div>
      </Section>

      {/* 6. Interpretation examples */}
      <Section icon="📋" iconBg={C.coralSoft} title="Interpreting CIs in Public Health">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Practice reading confidence intervals the way they appear in published research.</p>
          {[
            {
              finding: 'Adult smoking prevalence: 14.0% (95% CI: 13.2%, 14.8%)',
              q: 'What does this interval tell us?',
              answer: 'The sample estimate is 14.0%. The interval (13.2% to 14.8%) is our range of plausible values for the true population smoking rate. The relatively narrow width (1.6 percentage points) indicates a precise estimate — suggesting a large sample was used.',
              color: C.teal,
            },
            {
              finding: 'Childhood vaccination coverage: 72% (95% CI: 58%, 86%)',
              q: 'What does the wide interval tell us?',
              answer: 'The 28-percentage-point width suggests considerable uncertainty — likely due to a small sample size. We cannot be confident whether coverage is near 58% (alarmingly low) or near 86% (quite good). More data are needed before drawing conclusions.',
              color: C.coral,
            },
            {
              finding: 'Hypertension prevalence: 45.4% (95% CI: 44.8%, 46.0%)',
              q: 'Two studies report 45.4%. Study A\'s CI is (44.8%, 46.0%). Study B\'s CI is (38%, 53%). Which provides stronger evidence?',
              answer: 'Study A — by a wide margin. Both point estimates are identical, but Study A\'s CI is far narrower (1.2 percentage points vs. 15 percentage points). Study A\'s precision allows actionable conclusions; Study B\'s wide interval is consistent with almost any true prevalence from very low to very high.',
              color: C.purple,
            },
          ].map((item, i) => {
            const [shown, setShown] = useState(false)
            return (
              <div key={i} style={{ marginBottom: 14, padding: '14px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: item.color, fontWeight: 700, marginBottom: 8 }}>{item.finding}</div>
                <div style={{ fontSize: 13, color: C.text, marginBottom: 10 }}>{item.q}</div>
                {shown
                  ? <div style={{ padding: '10px 12px', background: item.color === C.teal ? C.tealSoft : item.color === C.coral ? C.coralSoft : C.purpleSoft, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{item.answer}</div>
                  : <button onClick={() => setShown(true)} style={{ padding: '7px 16px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, color: C.dim, cursor: 'pointer', fontFamily: 'inherit' }}>Reveal interpretation</button>
                }
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
