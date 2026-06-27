import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Z critical values lookup ──
const Z_TABLE = {
  0.80: 0.842, 0.85: 1.036, 0.90: 1.282, 0.95: 1.645,
  0.975: 1.960, 0.99: 2.326, 0.995: 2.576
}
function zCrit(p) { return Z_TABLE[p] || 1.960 }

// erf approximation
function erfApprox(x) {
  const sign = x >= 0 ? 1 : -1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  return sign * (1 - poly * Math.exp(-ax * ax))
}
function normCdf(z) { return 0.5 * (1 + erfApprox(z / Math.sqrt(2))) }
function normPdf(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI) }

function computePower(n, delta, sigma, alpha) {
  const cpSe = sigma / Math.sqrt(n)
  const cpZa = zCrit(1 - alpha / 2)
  const ncp = delta / cpSe
  return 1 - normCdf(cpZa - ncp) + normCdf(-cpZa - ncp)
}

function computeN(delta, sigma, alpha, power) {
  const cnZa = zCrit(1 - alpha / 2)
  const cnZb = zCrit(power)
  return Math.ceil(Math.pow((cnZa + cnZb) * sigma / delta, 2))
}

// ── Distribution curve SVG ──
function DistCurve({ n, delta, sigma, alpha }) {
  const W = 500, H = 160, PL = 20, PR = 20, PT = 16, PB = 24
  const PW = W - PL - PR, PH = H - PT - PB
  const dcSe = sigma / Math.sqrt(n)
  const xMin = -4 * dcSe
  const xMax = delta + 4 * dcSe
  const xRange = xMax - xMin
  const peak = normPdf(0) / dcSe
  const toX = v => PL + ((v - xMin) / xRange) * PW
  const toY = v => PT + PH - (v / (peak * 1.1)) * PH
  const dcZa = zCrit(1 - alpha / 2)
  const critR = dcZa * dcSe
  const pwr = computePower(n, delta, sigma, alpha)

  const pts0 = [], pts1 = []
  for (let i = 0; i <= 200; i++) {
    const x = xMin + (i / 200) * xRange
    pts0.push([x, normPdf((x) / dcSe) / dcSe])
    pts1.push([x, normPdf((x - delta) / dcSe) / dcSe])
  }

  const line = arr => arr.map(([x, y], i) => `${i ? 'L' : 'M'}${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(' ')
  const shade = (arr, minX, maxX) => {
    const seg = arr.filter(([x]) => x >= minX && x <= maxX)
    if (seg.length < 2) return ''
    return line(seg) + ` L${toX(seg[seg.length-1][0]).toFixed(1)},${toY(0).toFixed(1)} L${toX(seg[0][0]).toFixed(1)},${toY(0).toFixed(1)} Z`
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block', maxWidth: '100%' }}>
        <rect width={W} height={H} fill={C.alt} rx={8} />
        <line x1={PL} y1={toY(0)} x2={W-PR} y2={toY(0)} stroke={C.border} strokeWidth={1} />
        <path d={shade(pts1, xMin, critR)} fill={C.coral} fillOpacity={0.2} />
        <path d={shade(pts1, critR, xMax)} fill={C.green} fillOpacity={0.35} />
        <path d={shade(pts0, critR, xMax)} fill={C.amber} fillOpacity={0.3} />
        <path d={line(pts0)} fill="none" stroke={C.muted} strokeWidth={2} />
        <path d={line(pts1)} fill="none" stroke={C.teal} strokeWidth={2.5} />
        <line x1={toX(critR)} y1={PT} x2={toX(critR)} y2={toY(0)} stroke={C.amber} strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={toX(0)} y={PT+12} textAnchor="middle" fontSize={10} fill={C.muted} fontWeight="600">H₀</text>
        <text x={Math.min(toX(delta), W-PR-10)} y={PT+12} textAnchor="middle" fontSize={10} fill={C.teal} fontWeight="600">Hₐ</text>
        <text x={Math.min(toX(critR + dcSe*0.6), W-PR-20)} y={PT+28} fontSize={11} fill={C.green} fontWeight="700">Power={(pwr*100).toFixed(0)}%</text>
        <text x={toX(0)} y={H-4} textAnchor="middle" fontSize={9} fill={C.muted}>H₀ mean</text>
        <text x={Math.min(toX(delta), W-PR-10)} y={H-4} textAnchor="middle" fontSize={9} fill={C.teal}>True mean</text>
      </svg>
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: C.dim, marginTop: 6, flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 3, background: C.muted, verticalAlign: 'middle', marginRight: 4 }} />Null (H₀)</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 3, background: C.teal, verticalAlign: 'middle', marginRight: 4 }} />Alternative (Hₐ)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: C.green, opacity: 0.5, verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }} />Power</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: C.coral, opacity: 0.4, verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }} />β (miss)</span>
      </div>
    </div>
  )
}

export default function PowerSampleSize() {
  const [activeSlider, setActiveSlider] = useState('n')
  const [slN, setSlN] = useState(50)
  const [slDelta, setSlDelta] = useState(5)
  const [slSigma, setSlSigma] = useState(15)
  const [slAlpha, setSlAlpha] = useState(0.05)
  const curPower = computePower(slN, slDelta, slSigma, slAlpha)

  const [calcP1, setCalcP1] = useState(0.30)
  const [calcDiff, setCalcDiff] = useState(0.10)
  const [calcAlpha, setCalcAlpha] = useState(0.05)
  const [calcPwr, setCalcPwr] = useState(0.80)
  const p2safe = Math.min(calcP1 + calcDiff, 0.99)
  const poolSigma = Math.sqrt((calcP1*(1-calcP1) + p2safe*(1-p2safe)) / 2)
  const neededN = isNaN(poolSigma) || poolSigma <= 0 ? 0 : computeN(calcDiff, poolSigma, calcAlpha, calcPwr)

  const msgs = {
    n: 'As n increases, both distributions get narrower — less overlap, easier to detect the real effect.',
    delta: 'As the true effect grows larger, the distributions move further apart — the signal stands out more.',
    sigma: 'As σ increases, both distributions widen — more overlap, harder to detect the effect.',
    alpha: 'A higher α moves the critical value left — easier to reject H₀, but more false positives.',
  }

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Power & Sample Size</div>
      <div style={s.pageSub}>Every sample size calculation asks one question: How many participants do we need so that, if the effect we're looking for is real, our study is likely to detect it?</div>

      <Section icon="?" iconBg={C.coralSoft} title="Can You Miss a Real Effect?" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Suppose a new blood pressure medication truly lowers systolic blood pressure by 8 mmHg. Two research teams study the exact same medication.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Study A', n: 30, result: 'p = 0.21', sig: false, conclusion: '"The medication doesn\'t appear to work."', note: 'Wrong. The effect is real — the study was too small to detect it.' },
              { label: 'Study B', n: 500, result: 'p = 0.003', sig: true, conclusion: '"The medication significantly lowers blood pressure."', note: 'Correct. Same medication. Same true effect. Larger sample.' },
            ].map((st, i) => (
              <div key={i} style={{ padding: '14px 16px', background: st.sig ? C.greenSoft : C.coralSoft, border: `1px solid ${st.sig ? 'rgba(26,122,62,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: st.sig ? C.green : C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{st.label}</div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Sample size: <strong>n = {st.n}</strong></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: st.sig ? C.green : C.coral, marginBottom: 8 }}>{st.result} → {st.sig ? 'Significant ✓' : 'Not significant ✗'}</div>
                <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic', marginBottom: 6 }}>Researcher concludes: {st.conclusion}</div>
                <div style={{ fontSize: 12, color: st.sig ? C.green : C.coral, fontWeight: 600 }}>{st.note}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>The key question:</strong> Did the treatment stop working between Study A and Study B? No — the only thing that changed was sample size. A non-significant result doesn't mean no effect. It may mean the study wasn't large enough to detect one. That's the problem power is designed to solve.
          </div>
        </div>
      </Section>

      <Section icon="=" iconBg={C.purpleSoft} title="What Is Statistical Power?">
        <div style={{ paddingTop: 20 }}>
          <div style={{ padding: '14px 18px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: C.purple, marginBottom: 4 }}>Power = the probability of detecting a real effect when one truly exists</div>
            <div style={{ fontSize: 13, color: C.dim }}>The chance your study finds a significant result when the treatment actually works.</div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>What These Four Boxes Really Mean</div>
          <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 14 }}>
            Every hypothesis test produces one of four possible outcomes. The problem is that when you analyze real data, <strong style={{ color: C.text }}>you never know which box you're actually in</strong> — because you don't know the truth about the population. You only have a sample.
          </p>

          <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: C.alt, padding: '9px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${C.border}` }}>
              <span></span>
              <span style={{ color: C.teal }}>H₀ True (no real effect)</span>
              <span style={{ color: C.coral }}>H₀ False (real effect exists)</span>
            </div>
            {[
              { row: 'Reject H₀ (significant result)', cells: [
                { label: 'Possible Type I Error (α)', sub: "False positive — concluded an effect exists when it doesn't", color: C.amber },
                { label: 'Correctly detected a real effect ✓', sub: 'Power = 1 − β', color: C.green }
              ]},
              { row: 'Fail to reject H₀ (not significant)', cells: [
                { label: 'Correct decision ✓', sub: 'No significant result, and no real effect', color: C.teal },
                { label: 'Possible Type II Error (β)', sub: 'Missed a real effect — false negative', color: C.coral }
              ]},
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${C.border}` }}>
                <div style={{ padding: '10px 12px', fontSize: 12, color: C.dim, fontWeight: 600, borderRight: `1px solid ${C.border}` }}>{row.row}</div>
                {row.cells.map((cell, j) => (
                  <div key={j} style={{ padding: '10px 12px', background: cell.color + '15', borderLeft: j > 0 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: cell.color, marginBottom: 2 }}>{cell.label}</div>
                    <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{cell.sub}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* In a real study callout */}
          <div style={{ padding: '14px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 10 }}>In a real study, you never know which box you're in.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                <strong style={{ color: C.text }}>Your study finds a significant result.</strong><br />Did you discover a real effect? Or did random chance produce a false positive (Type I error)?<br /><strong style={{ color: C.amber }}>You don't know.</strong>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                <strong style={{ color: C.text }}>Your study finds no significant result.</strong><br />Is there really no effect? Or did your study miss a real effect because it was underpowered (Type II error)?<br /><strong style={{ color: C.amber }}>You don't know.</strong>
              </div>
            </div>
          </div>

          {/* What researchers can control */}
          <div style={{ padding: '14px 16px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 10 }}>What researchers can — and cannot — control</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 13, color: C.coral, fontWeight: 600 }}>✗ Cannot control whether a Type I or Type II error occurs in a particular study.</div>
              <div style={{ fontSize: 13, color: C.teal, fontWeight: 600, marginTop: 4 }}>✓ Can design studies that make those errors less likely:</div>
              {['Choose an appropriate significance level (α = 0.05 is standard)', 'Enroll enough participants to achieve adequate power', 'Reduce measurement error and variability', 'Use the correct statistical test for the outcome and design'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: C.dim }}>
                  <span style={{ color: C.teal, flexShrink: 0 }}>•</span>{item}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: C.dim, fontStyle: 'italic', lineHeight: 1.7 }}>
              Even then, every study carries some uncertainty. Everything you've learned in this course — choosing the right study design, selecting the appropriate test, enrolling enough participants, computing confidence intervals — helps reduce the chance of these errors. But no statistical method eliminates uncertainty completely.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 14px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
              <strong style={{ color: C.green }}>Power = 1 − β.</strong> A study with 80% power has an 80% chance of detecting the effect — and a 20% chance of missing it.
            </div>
            <div style={{ padding: '10px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
              <strong style={{ color: C.coral }}>β = chance of missing.</strong> "Probability of missing a real effect" is more intuitive than β — they mean the same thing.
            </div>
          </div>
        </div>
      </Section>

      <Section icon="~" iconBg={C.tealSoft} title="What Moves Power?" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Select a factor, move its slider, and watch the distributions change.</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {[{ key: 'n', label: 'Sample size (n)' }, { key: 'delta', label: 'Effect size' }, { key: 'sigma', label: 'Variability (σ)' }, { key: 'alpha', label: 'Alpha (α)' }].map(btn => (
              <button key={btn.key} onClick={() => setActiveSlider(btn.key)}
                style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, background: activeSlider === btn.key ? C.teal : C.surface, color: activeSlider === btn.key ? '#fff' : C.dim, border: `1px solid ${activeSlider === btn.key ? C.teal : C.border}` }}>
                {btn.label}
              </button>
            ))}
          </div>
          <DistCurve n={slN} delta={slDelta} sigma={slSigma} alpha={slAlpha} />
          <div style={{ marginTop: 14 }}>
            {activeSlider === 'n' && <div style={{ marginBottom: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}><span>Sample size (n)</span><span style={{ fontWeight: 700 }}>{slN}</span></div><input type="range" min={10} max={300} step={5} value={slN} onChange={e => setSlN(+e.target.value)} style={{ width: '100%', accentColor: C.teal }} /></div>}
            {activeSlider === 'delta' && <div style={{ marginBottom: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}><span>Effect size (mmHg)</span><span style={{ fontWeight: 700 }}>{slDelta}</span></div><input type="range" min={1} max={25} step={1} value={slDelta} onChange={e => setSlDelta(+e.target.value)} style={{ width: '100%', accentColor: C.teal }} /></div>}
            {activeSlider === 'sigma' && <div style={{ marginBottom: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}><span>Variability (σ)</span><span style={{ fontWeight: 700 }}>{slSigma}</span></div><input type="range" min={5} max={30} step={1} value={slSigma} onChange={e => setSlSigma(+e.target.value)} style={{ width: '100%', accentColor: C.teal }} /></div>}
            {activeSlider === 'alpha' && <div style={{ marginBottom: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}><span>Alpha (α)</span><span style={{ fontWeight: 700 }}>{slAlpha}</span></div><input type="range" min={0.01} max={0.20} step={0.01} value={slAlpha} onChange={e => setSlAlpha(+e.target.value)} style={{ width: '100%', accentColor: C.teal }} /></div>}
          </div>
          <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: C.dim }}>Current power: </span>
            <strong style={{ fontSize: 20, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{(curPower * 100).toFixed(1)}%</strong>
            <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>({((1-curPower)*100).toFixed(1)}% chance of missing a real effect)</span>
          </div>
          <div style={{ padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{msgs[activeSlider]}</div>
        </div>
      </Section>

      <Section icon="→" iconBg={C.amberSoft} title="Why Each Factor Matters">
        <div style={{ paddingTop: 20 }}>
          <p style={{ ...s.prose, marginBottom: 16 }}>Think of detecting an effect like hearing a whisper across a room. A <strong style={{ color: C.text }}>small effect</strong> is a quiet whisper. A <strong style={{ color: C.text }}>small sample</strong> is a noisy room. Increasing sample size quiets the room. Increasing effect size makes the signal louder.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { factor: 'Sample size (n) ↑', chain: ['More participants', 'Less random noise', 'Narrower distributions', 'Less overlap', 'Easier to detect the effect'], verdict: 'Power increases', note: 'The primary tool you control when designing a study.', color: C.teal },
              { factor: 'Effect size ↑', chain: ['Larger true difference', 'Signal stands out more', 'Distributions move apart', 'Less overlap', 'Easier to distinguish from chance'], verdict: 'Power increases', note: 'Usually fixed by nature — you cannot make a drug work better by changing your design.', color: C.purple },
              { factor: 'Variability (σ) ↑', chain: ['More variation in the outcome', 'Wider distributions', 'More overlap', 'Signal harder to see', 'Effect more likely to be missed'], verdict: 'Power decreases', note: 'Partially controllable via stricter eligibility and better measurement.', color: C.coral },
              { factor: 'Alpha (α) ↑', chain: ['Lower threshold to reject H₀', 'Critical value moves left', 'More of Hₐ in rejection region', 'Easier to declare significance', 'Power rises — but false positives increase'], verdict: 'Power increases (with a cost)', note: 'α = 0.05 is standard. Increasing α trades missed effects for false alarms.', color: C.amber },
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 10 }}>{item.factor}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
                  {item.chain.map((step, j) => (
                    <div key={j} style={{ display: 'flex', gap: 6 }}>
                      {j > 0 && <span style={{ color: C.muted, fontSize: 11, flexShrink: 0 }}>↓</span>}
                      <span style={{ fontSize: 12, color: j === item.chain.length-1 ? item.color : C.dim, fontWeight: j === item.chain.length-1 ? 600 : 400, lineHeight: 1.4 }}>{step}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, padding: '4px 9px', background: item.color + '15', borderRadius: 5, color: item.color, fontWeight: 600, marginBottom: 6 }}>{item.verdict}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section icon="%" iconBg={C.purpleSoft} title="Why 80% Power?">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>80% is a convention, not a rule.</p>
          <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10, marginBottom: 14, fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
            <strong style={{ color: C.purple }}>80% power</strong> means a real effect gives your study an 80% chance of detection — and a 20% chance of being missed. Researchers choose 80% to balance cost (larger studies are expensive and expose more participants to risk) against the cost of underpowered studies (wrong conclusions, wasted resources).
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { pwr: '80%', label: 'Standard', desc: 'Accepted minimum in most fields', color: C.teal },
              { pwr: '90%', label: 'Higher', desc: 'Confirmatory trials or costly missed effects', color: C.purple },
              { pwr: '95%+', label: 'Very high', desc: 'Pivotal clinical trials; much larger n required', color: C.amber },
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: item.color }}>{item.pwr}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: '4px 0' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section icon="!" iconBg={C.coralSoft} title="The Cost of Being Underpowered">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Both studies test the same dietary intervention. The true effect is real — a 6 mmHg reduction in blood pressure.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Underpowered Study', n: 25, pwr: 40, result: 'p = 0.18', sig: false, conclusion: '"The intervention did not significantly reduce blood pressure. Further research may not be warranted."', note: 'Likely wrong. With 40% power, a 60% chance of missing the real effect — and it did.' },
              { label: 'Well-Powered Study', n: 250, pwr: 90, result: 'p = 0.004', sig: true, conclusion: '"The intervention significantly reduced blood pressure."', note: 'Same intervention. Same true effect. Enough participants to detect it reliably.' },
            ].map((st, i) => (
              <div key={i} style={{ padding: '14px 16px', background: st.sig ? C.greenSoft : C.coralSoft, border: `1px solid ${st.sig ? 'rgba(26,122,62,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: st.sig ? C.green : C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{st.label}</div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 4 }}>n = <strong>{st.n}</strong> | Power ≈ <strong>{st.pwr}%</strong></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: st.sig ? C.green : C.coral, marginBottom: 8 }}>{st.result} → {st.sig ? 'Significant ✓' : 'Not significant ✗'}</div>
                <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic', marginBottom: 6, lineHeight: 1.6 }}>"{st.conclusion}"</div>
                <div style={{ fontSize: 12, color: st.sig ? C.green : C.coral, fontWeight: 600, lineHeight: 1.6 }}>{st.note}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>Beyond statistics:</strong> Underpowered studies waste resources, expose participants without generating useful knowledge, and can delay effective treatments from reaching patients. Power is an ethical consideration, not just a statistical one.
          </div>
        </div>
      </Section>

      <Section icon="⚙" iconBg={C.tealSoft} title="Sample Size Calculator">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>For comparing two proportions. Enter your parameters to get the required sample size per group.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 2 }}><span>Baseline proportion (p₁)</span><span style={{ fontWeight: 700 }}>{(calcP1*100).toFixed(0)}%</span></div>
                <input type="range" min={0.05} max={0.90} step={0.01} value={calcP1} onChange={e => setCalcP1(+e.target.value)} style={{ width: '100%', accentColor: C.teal }} />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Expected proportion in the control group.</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 2 }}><span>Minimum detectable difference (δ)</span><span style={{ fontWeight: 700 }}>{(calcDiff*100).toFixed(0)} percentage points</span></div>
                <input type="range" min={0.02} max={0.40} step={0.01} value={calcDiff} onChange={e => setCalcDiff(+e.target.value)} style={{ width: '100%', accentColor: C.teal }} />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>The smallest difference between groups that would be clinically meaningful. Currently: {(calcP1*100).toFixed(0)}% vs. {(Math.min(calcP1+calcDiff,0.99)*100).toFixed(0)}%.</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Significance level (α)</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0.01, 0.05, 0.10].map(v => (
                    <button key={v} onClick={() => setCalcAlpha(v)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: calcAlpha === v ? C.teal : C.surface, border: `1px solid ${calcAlpha === v ? C.teal : C.border}`, color: calcAlpha === v ? '#fff' : C.dim, fontWeight: calcAlpha === v ? 700 : 400 }}>{v}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Desired power</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0.80, 0.90, 0.95].map(v => (
                    <button key={v} onClick={() => setCalcPwr(v)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: calcPwr === v ? C.teal : C.surface, border: `1px solid ${calcPwr === v ? C.teal : C.border}`, color: calcPwr === v ? '#fff' : C.dim, fontWeight: calcPwr === v ? 700 : 400 }}>{(v*100).toFixed(0)}%</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Required sample size</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 700, color: C.purple }}>{neededN}</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>participants per group</div>
                <div style={{ fontSize: 12, color: C.purple, marginTop: 4, fontWeight: 600 }}>Total: {neededN * 2} participants</div>
              </div>
              <div style={{ padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                <strong style={{ color: C.text }}>What this means:</strong> To detect a difference of {(calcDiff*100).toFixed(0)} percentage points ({(calcP1*100).toFixed(0)}% in the control group vs. {(Math.min(calcP1+calcDiff,0.99)*100).toFixed(0)}% in the intervention group) with {(calcPwr*100).toFixed(0)}% power and α = {calcAlpha}, you need {neededN} participants per group ({neededN*2} total).
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section icon="★" iconBg={C.amberSoft} title="Why Sample Size Isn't the Whole Story">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>This calculator tells you how many participants you need to have a good chance of detecting a real effect. But having enough participants is only half the equation.</p>
          <div style={{ padding: '14px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, marginBottom: 14, fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
            <strong style={{ color: C.amber }}>A large sample does not guarantee a good study.</strong> The way participants are selected is just as important as how many are included. Sample size calculations assume your sample is appropriate for the research question — but they cannot correct for selection bias.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ padding: '14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Large but biased sample</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>1,000 people recruited at a health fair may give excellent statistical power — but those participants may not represent the broader population. High power, low representativeness.</div>
            </div>
            <div style={{ padding: '14px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Smaller but representative sample</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>A smaller random sample may provide more trustworthy estimates because it better represents the population of interest — even with slightly lower power.</div>
            </div>
          </div>
          <div style={{ padding: '14px 16px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 10, fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><strong style={{ color: C.teal }}>Sample size answers:</strong> Do I have enough participants to detect a meaningful effect?</div>
              <div><strong style={{ color: C.purple }}>Sampling method answers:</strong> Do these participants represent the population I want to study?</div>
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid rgba(0,153,168,0.15)`, fontSize: 13, color: C.dim }}>
              You need both. A study that is too small may miss a real effect. A study with a large but biased sample may detect an effect that doesn't accurately represent the population. Neither problem can be fixed with statistics after the data are collected.
            </div>
          </div>
        </div>
      </Section>

      <Section icon="💻" iconBg={C.alt} title="Using JMP for Sample Size Calculations">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>JMP path for a two-proportion comparison:</p>
          {['DOE → Sample Size and Power → Two Sample Proportions', 'Enter Alpha (0.05)', 'Enter Proportion 1 (baseline)', 'Enter Proportion 2 (intervention group)', 'Enter Power (0.80 or 0.90)', 'Click Continue — JMP returns required n per group'].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.dim, padding: '4px 10px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 6 }}>{step}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
