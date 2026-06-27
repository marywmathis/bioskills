import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Math ──
function myErf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const result = 1 - poly * Math.exp(-x * x)
  return x >= 0 ? result : -result
}
function myNcdf(z) { return 0.5 * (1 + myErf(z / Math.sqrt(2))) }
function myNpdf(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI) }
function myNppf(prob) {
  if (prob <= 0) return -Infinity
  if (prob >= 1) return Infinity
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239]
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
  const nppfLow = 0.02425
  const nppfHigh = 1 - nppfLow
  if (prob < nppfLow) {
    const nppfQ1 = Math.sqrt(-2 * Math.log(prob))
    return (((((c[0]*nppfQ1+c[1])*nppfQ1+c[2])*nppfQ1+c[3])*nppfQ1+c[4])*nppfQ1+c[5]) / ((((d[0]*nppfQ1+d[1])*nppfQ1+d[2])*nppfQ1+d[3])*nppfQ1+1)
  } else if (prob <= nppfHigh) {
    const nppfQ2 = prob - 0.5
    const nppfR = nppfQ2 * nppfQ2
    return (((((a[0]*nppfR+a[1])*nppfR+a[2])*nppfR+a[3])*nppfR+a[4])*nppfR+a[5])*nppfQ2 / (((((b[0]*nppfR+b[1])*nppfR+b[2])*nppfR+b[3])*nppfR+b[4])*nppfR+1)
  } else {
    const nppfQ3 = Math.sqrt(-2 * Math.log(1 - prob))
    return -(((((c[0]*nppfQ3+c[1])*nppfQ3+c[2])*nppfQ3+c[3])*nppfQ3+c[4])*nppfQ3+c[5]) / ((((d[0]*nppfQ3+d[1])*nppfQ3+d[2])*nppfQ3+d[3])*nppfQ3+1)
  }
}

function getPower(sampleN, effectDelta, stdDev, alphaLevel) {
  const gpStdErr = stdDev / Math.sqrt(sampleN)
  const gpCritZ = myNppf(1 - alphaLevel / 2)
  const gpNcp = effectDelta / gpStdErr
  return 1 - myNcdf(gpCritZ - gpNcp) + myNcdf(-gpCritZ - gpNcp)
}

function getSampleSize(effectDelta, stdDev, alphaLevel, desiredPower) {
  const gsCritZ = myNppf(1 - alphaLevel / 2)
  const gsBetaZ = myNppf(desiredPower)
  return Math.ceil(((gsCritZ + gsBetaZ) * stdDev / effectDelta) ** 2)
}

// ── Distribution curve ──
function DistCurve({ sampleN, effectDelta, stdDev, alphaLevel }) {
  const SVG_W = 500, SVG_H = 160
  const PL = 20, PR = 20, PT = 16, PB = 24
  const plotW = SVG_W - PL - PR
  const plotH = SVG_H - PT - PB

  const dcStdErr = stdDev / Math.sqrt(sampleN)
  const mu0 = 0
  const mu1 = effectDelta
  const xMin = mu0 - 4 * dcStdErr
  const xMax = mu1 + 4 * dcStdErr
  const toX = v => PL + ((v - xMin) / (xMax - xMin)) * plotW
  const peakPdf = myNpdf(0) / dcStdErr
  const toY = v => PT + plotH - (v / (peakPdf * 1.1)) * plotH

  const dcCritZ = myNppf(1 - alphaLevel / 2)
  const critRight = mu0 + dcCritZ * dcStdErr
  const dcPwr = getPower(sampleN, effectDelta, stdDev, alphaLevel)

  const nullPts = []
  const altPts = []
  const step = (xMax - xMin) / 200
  for (let x = xMin; x <= xMax; x += step) {
    nullPts.push({ x, y: myNpdf((x - mu0) / dcStdErr) / dcStdErr })
    altPts.push({ x, y: myNpdf((x - mu1) / dcStdErr) / dcStdErr })
  }

  const toPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ')

  const pwrPts = altPts.filter(p => p.x >= critRight)
  const betaPts = altPts.filter(p => p.x <= critRight)
  const alphaPts = nullPts.filter(p => p.x >= critRight)

  const shadeAlt = (pts, suffix) => {
    if (pts.length < 2) return ''
    const last = pts[pts.length - 1]
    const first = pts[0]
    return toPath(pts) + ` L${toX(last.x).toFixed(1)},${toY(0).toFixed(1)} L${toX(first.x).toFixed(1)},${toY(0).toFixed(1)} Z`
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={SVG_W} height={SVG_H} style={{ display: 'block', maxWidth: '100%' }}>
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={C.alt} rx={8} />
        <line x1={PL} y1={toY(0)} x2={SVG_W - PR} y2={toY(0)} stroke={C.border} strokeWidth={1} />
        {betaPts.length > 1 && <path d={shadeAlt(betaPts)} fill={C.coral} fillOpacity={0.15} />}
        {pwrPts.length > 1 && <path d={shadeAlt(pwrPts)} fill={C.green} fillOpacity={0.3} />}
        {alphaPts.length > 1 && <path d={shadeAlt(alphaPts)} fill={C.amber} fillOpacity={0.3} />}
        <path d={toPath(nullPts)} fill="none" stroke={C.muted} strokeWidth={2} />
        <path d={toPath(altPts)} fill="none" stroke={C.teal} strokeWidth={2.5} />
        {toX(critRight) > PL && toX(critRight) < SVG_W - PR && (
          <line x1={toX(critRight)} y1={PT} x2={toX(critRight)} y2={toY(0)} stroke={C.amber} strokeWidth={1.5} strokeDasharray="4 2" />
        )}
        <text x={toX(mu0)} y={PT + 10} textAnchor="middle" fontSize={10} fill={C.muted} fontWeight="600">H₀</text>
        <text x={Math.min(toX(mu1), SVG_W - PR - 10)} y={PT + 10} textAnchor="middle" fontSize={10} fill={C.teal} fontWeight="600">Hₐ</text>
        {dcPwr > 0.05 && pwrPts.length > 2 && (
          <text x={Math.min(toX(critRight + stdErr * 0.8), SVG_W - PR - 20)} y={PT + 28} fontSize={11} fill={C.green} fontWeight="700">Power={(dcPwr * 100).toFixed(0)}%</text>
        )}
        {[mu0, mu1].map((v, i) => (
          <g key={i}>
            <line x1={toX(v)} y1={toY(0)} x2={toX(v)} y2={toY(0) + 4} stroke={C.muted} strokeWidth={1} />
            <text x={toX(v)} y={SVG_H - 4} textAnchor="middle" fontSize={9} fill={C.muted}>{i === 0 ? 'H₀ mean' : 'True mean'}</text>
          </g>
        ))}
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

// ── Main ──
export default function PowerSampleSize() {
  const [activeSlider, setActiveSlider] = useState('n')
  const [sliderN, setSliderN] = useState(50)
  const [sliderEffect, setSliderEffect] = useState(5)
  const [sliderSigma, setSliderSigma] = useState(15)
  const [sliderAlpha, setSliderAlpha] = useState(0.05)

  const currentPower = getPower(sliderN, sliderEffect, sliderSigma, sliderAlpha)

  // Calculator state
  const [calcBaseP, setCalcBaseP] = useState(0.30)
  const [calcDiff, setCalcDiff] = useState(0.10)
  const [calcAlpha, setCalcAlpha] = useState(0.05)
  const [calcDesiredPower, setCalcDesiredPower] = useState(0.80)
  const pooledSigma = Math.sqrt((calcBaseP * (1 - calcBaseP) + (calcBaseP + calcDiff) * (1 - calcBaseP - calcDiff)) / 2)
  const neededN = getSampleSize(calcDiff, pooledSigma, calcAlpha, calcDesiredPower)

  const powerMessages = {
    n: 'Move the sample size slider. As n increases, both distributions get narrower — less overlap, easier to detect the real effect.',
    effect: 'Move the effect size slider. As the true effect grows larger, the two distributions move further apart — the signal stands out more.',
    sigma: 'Move the variability slider. As σ increases, both distributions widen — more overlap, harder to detect the effect.',
    alpha: 'Move α. A higher α moves the critical value left — easier to reject H₀, but more false positives.',
  }

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Power & Sample Size</div>
      <div style={s.pageSub}>
        Every sample size calculation asks one question: How many participants do we need so that, if the effect we're looking for is real, our study is likely to detect it?
      </div>

      {/* 1. Can you miss a real effect? */}
      <Section icon="?" iconBg={C.coralSoft} title="Can You Miss a Real Effect?" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Suppose a new blood pressure medication truly lowers systolic blood pressure by 8 mmHg on average. Two research teams study the exact same medication.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Study A', n: 30, result: 'p = 0.21', sig: false, conclusion: '"The medication doesn\'t appear to work."', reality: 'Wrong. The effect is real — the study was too small to detect it.' },
              { label: 'Study B', n: 500, result: 'p = 0.003', sig: true, conclusion: '"The medication significantly lowers blood pressure."', reality: 'Correct. Same medication. Same true effect. Larger sample.' },
            ].map((study, i) => (
              <div key={i} style={{ padding: '14px 16px', background: study.sig ? C.greenSoft : C.coralSoft, border: `1px solid ${study.sig ? 'rgba(26,122,62,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: study.sig ? C.green : C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{study.label}</div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Sample size: <strong style={{ color: C.text }}>n = {study.n}</strong></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: study.sig ? C.green : C.coral, marginBottom: 8 }}>{study.result} → {study.sig ? 'Significant ✓' : 'Not significant ✗'}</div>
                <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic', marginBottom: 6 }}>Researcher concludes: {study.conclusion}</div>
                <div style={{ fontSize: 12, color: study.sig ? C.green : C.coral, fontWeight: 600 }}>{study.reality}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>The key question:</strong> Did the treatment stop working between Study A and Study B? No. The only thing that changed was the sample size. A non-significant result doesn't mean no effect — it may mean the study wasn't large enough to detect one. That's the problem power is designed to solve.
          </div>
        </div>
      </Section>

      {/* 2. What is power? */}
      <Section icon="=" iconBg={C.purpleSoft} title="What Is Statistical Power?">
        <div style={{ paddingTop: 20 }}>
          <div style={{ padding: '14px 18px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: C.purple, marginBottom: 4 }}>Power = the probability of detecting a real effect when one truly exists</div>
            <div style={{ fontSize: 13, color: C.dim }}>Equivalently: the chance your study will find a significant result when the treatment actually works.</div>
          </div>
          <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: C.alt, padding: '9px 12px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${C.border}` }}>
              <span></span><span style={{ color: C.teal }}>H₀ True (no effect)</span><span style={{ color: C.coral }}>H₀ False (effect exists)</span>
            </div>
            {[
              { row: 'Reject H₀ (significant)', left: { label: 'Type I Error (α)', sub: 'False positive', color: C.amber }, right: { label: 'Power = 1 − β', sub: 'Detected the real effect ✓', color: C.green } },
              { row: 'Fail to reject H₀', left: { label: 'Correct decision', sub: 'No effect found, none exists', color: C.teal }, right: { label: 'Type II Error (β)', sub: 'Missed a real effect ✗', color: C.coral } },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${C.border}` }}>
                <div style={{ padding: '10px 12px', fontSize: 12, color: C.dim, fontWeight: 600, borderRight: `1px solid ${C.border}` }}>{row.row}</div>
                {[row.left, row.right].map((cell, j) => (
                  <div key={j} style={{ padding: '10px 12px', background: cell.color + '15', borderLeft: j > 0 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: cell.color, marginBottom: 2 }}>{cell.label}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{cell.sub}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 14px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
              <strong style={{ color: C.green }}>Power = 1 − β.</strong> If β = 20%, power = 80%. A study with 80% power has an 80% chance of detecting the effect and a 20% chance of missing it.
            </div>
            <div style={{ padding: '10px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
              <strong style={{ color: C.coral }}>β = chance of missing.</strong> Students find "probability of missing a real effect" more intuitive than β. They mean the same thing.
            </div>
          </div>
        </div>
      </Section>

      {/* 3. What moves power? */}
      <Section icon="~" iconBg={C.tealSoft} title="What Moves Power?" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Select a factor, move its slider, and watch the distributions change.</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { key: 'n', label: 'Sample size (n)' },
              { key: 'effect', label: 'Effect size' },
              { key: 'sigma', label: 'Variability (σ)' },
              { key: 'alpha', label: 'Alpha (α)' },
            ].map(btn => (
              <button key={btn.key} onClick={() => setActiveSlider(btn.key)}
                style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, background: activeSlider === btn.key ? C.teal : C.surface, color: activeSlider === btn.key ? '#fff' : C.dim, border: `1px solid ${activeSlider === btn.key ? C.teal : C.border}`, transition: 'all 0.15s' }}>
                {btn.label}
              </button>
            ))}
          </div>

          <DistCurve sampleN={sliderN} effectDelta={sliderEffect} stdDev={sliderSigma} alphaLevel={sliderAlpha} />

          <div style={{ marginTop: 14 }}>
            {activeSlider === 'n' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                  <span>Sample size (n)</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{sliderN}</span>
                </div>
                <input type="range" min={10} max={300} step={5} value={sliderN} onChange={e => setSliderN(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            )}
            {activeSlider === 'effect' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                  <span>Effect size (mmHg difference)</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{sliderEffect}</span>
                </div>
                <input type="range" min={1} max={25} step={1} value={sliderEffect} onChange={e => setSliderEffect(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            )}
            {activeSlider === 'sigma' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                  <span>Population variability (σ)</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{sliderSigma}</span>
                </div>
                <input type="range" min={5} max={30} step={1} value={sliderSigma} onChange={e => setSliderSigma(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            )}
            {activeSlider === 'alpha' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                  <span>Significance level (α)</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{sliderAlpha}</span>
                </div>
                <input type="range" min={0.01} max={0.20} step={0.01} value={sliderAlpha} onChange={e => setSliderAlpha(parseFloat(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            )}
          </div>

          <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: C.dim }}>Current power: </span>
            <strong style={{ fontSize: 20, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{(currentPower * 100).toFixed(1)}%</strong>
            <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>({((1 - currentPower) * 100).toFixed(1)}% chance of missing a real effect)</span>
          </div>

          <div style={{ padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            {powerMessages[activeSlider]}
          </div>
        </div>
      </Section>

      {/* 4. Why each factor matters */}
      <Section icon="→" iconBg={C.amberSoft} title="Why Each Factor Matters">
        <div style={{ paddingTop: 20 }}>
          <p style={{ ...s.prose, marginBottom: 16 }}>
            Think of detecting an effect like hearing a whisper across a room. A <strong style={{ color: C.text }}>small effect</strong> is a quiet whisper. A <strong style={{ color: C.text }}>small sample</strong> is a noisy, crowded room. Increasing sample size quiets the room. Increasing effect size makes the signal louder. Either way, power rises.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { factor: 'Sample size (n) ↑', chain: ['More participants', 'Less random noise in the estimate', 'Narrower distributions', 'Less overlap between H₀ and Hₐ', 'Easier to detect the real effect'], verdict: 'Power increases', note: 'The primary tool you control when designing a study.', color: C.teal },
              { factor: 'Effect size ↑', chain: ['Larger true difference', 'Signal stands out more clearly', 'Distributions move apart', 'Less overlap', 'Easier to distinguish from chance'], verdict: 'Power increases', note: 'Usually fixed by nature — you cannot make a drug work better by changing your design.', color: C.purple },
              { factor: 'Variability (σ) ↑', chain: ['More variation in the outcome', 'Wider distributions', 'More overlap between groups', 'Signal harder to see', 'Effect more likely to be missed'], verdict: 'Power decreases', note: 'Partially controllable — stricter eligibility, standardized protocols, and better measurement reduce σ.', color: C.coral },
              { factor: 'Alpha (α) ↑', chain: ['Lower threshold to reject H₀', 'Critical value moves left', 'More of Hₐ falls in rejection region', 'Easier to declare significance', 'Power rises — but false positives increase too'], verdict: 'Power increases (with a cost)', note: 'Rarely changed — α = 0.05 is standard. Increasing α trades missed effects for false alarms.', color: C.amber },
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color, marginBottom: 10 }}>{item.factor}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
                  {item.chain.map((step, j) => (
                    <div key={j} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      {j > 0 && <span style={{ color: C.muted, fontSize: 11, flexShrink: 0, marginTop: 1 }}>↓</span>}
                      <span style={{ fontSize: 12, color: j === item.chain.length - 1 ? item.color : C.dim, fontWeight: j === item.chain.length - 1 ? 600 : 400, lineHeight: 1.4 }}>{step}</span>
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

      {/* 5. Why 80%? */}
      <Section icon="%" iconBg={C.purpleSoft} title="Why 80% Power?">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>80% is a convention, not a rule.</p>
          <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10, marginBottom: 14, fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
            <strong style={{ color: C.purple }}>80% power</strong> means that if a real effect exists, your study has an 80% chance of detecting it — and a 20% chance of missing it. Researchers commonly choose 80% because it balances two competing pressures: larger studies cost more and expose more participants to risk, while underpowered studies waste resources and may reach wrong conclusions.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { pwr: '80%', label: 'Standard', desc: 'Accepted minimum in most fields', color: C.teal },
              { pwr: '90%', label: 'Higher', desc: 'Confirmatory trials or costly missed effects', color: C.purple },
              { pwr: '95%+', label: 'Very high', desc: 'Pivotal clinical trials; much larger samples required', color: C.amber },
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

      {/* 6. Cost of being underpowered */}
      <Section icon="!" iconBg={C.coralSoft} title="The Cost of Being Underpowered">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Both studies test the same dietary intervention. The true effect is real — a 6 mmHg reduction in blood pressure.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Underpowered Study', n: 25, pwr: 40, result: 'p = 0.18', sig: false, conclusion: '"The dietary intervention did not significantly reduce blood pressure. Further research may not be warranted."', problem: 'This conclusion is likely wrong. With 40% power, the study had a 60% chance of missing the real effect — and it did.' },
              { label: 'Well-Powered Study', n: 250, pwr: 90, result: 'p = 0.004', sig: true, conclusion: '"The dietary intervention significantly reduced blood pressure."', problem: 'Same intervention. Same true effect. Enough participants to detect it reliably.' },
            ].map((study, i) => (
              <div key={i} style={{ padding: '14px 16px', background: study.sig ? C.greenSoft : C.coralSoft, border: `1px solid ${study.sig ? 'rgba(26,122,62,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: study.sig ? C.green : C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{study.label}</div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 4 }}>n = <strong>{study.n}</strong> &nbsp;|&nbsp; Power ≈ <strong>{study.pwr}%</strong></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: study.sig ? C.green : C.coral, marginBottom: 8 }}>{study.result} → {study.sig ? 'Significant ✓' : 'Not significant ✗'}</div>
                <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic', marginBottom: 8, lineHeight: 1.6 }}>"{study.conclusion}"</div>
                <div style={{ fontSize: 12, color: study.sig ? C.green : C.coral, fontWeight: 600, lineHeight: 1.6 }}>{study.problem}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>Beyond statistics:</strong> Underpowered studies waste resources, expose participants to study procedures without generating useful knowledge, and can delay effective treatments from reaching patients. Power is an ethical consideration, not just a statistical one.
          </div>
        </div>
      </Section>

      {/* 7. Sample size calculator */}
      <Section icon="⚙" iconBg={C.tealSoft} title="Sample Size Calculator">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>For comparing two proportions. Enter your study parameters to calculate the required sample size per group.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              {[
                { label: 'Baseline proportion (p₁)', val: calcBaseP, set: setCalcBaseP, min: 0.05, max: 0.90, step: 0.01, fmt: v => (v*100).toFixed(0)+'%', note: 'Expected proportion in the control group.' },
                { label: 'Minimum detectable difference (δ)', val: calcDiff, set: setCalcDiff, min: 0.02, max: 0.40, step: 0.01, fmt: v => (v*100).toFixed(0)+' pp', note: 'Smallest difference that would be clinically meaningful.' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 2 }}>
                    <span>{item.label}</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{item.fmt(item.val)}</span>
                  </div>
                  <input type="range" min={item.min} max={item.max} step={item.step} value={item.val} onChange={e => item.set(parseFloat(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{item.note}</div>
                </div>
              ))}
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
                    <button key={v} onClick={() => setCalcDesiredPower(v)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: calcDesiredPower === v ? C.teal : C.surface, border: `1px solid ${calcDesiredPower === v ? C.teal : C.border}`, color: calcDesiredPower === v ? '#fff' : C.dim, fontWeight: calcDesiredPower === v ? 700 : 400 }}>{(v*100).toFixed(0)}%</button>
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
                <strong style={{ color: C.text }}>What this means:</strong> To detect a difference of {(calcDiff*100).toFixed(0)} percentage points (from {(calcBaseP*100).toFixed(0)}% to {((calcBaseP+calcDiff)*100).toFixed(0)}%) with {(calcDesiredPower*100).toFixed(0)}% power and α = {calcAlpha}, you need {neededN} participants in each group ({neededN * 2} total).
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 8. JMP */}
      <Section icon="💻" iconBg={C.alt} title="Using JMP for Sample Size Calculations">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>JMP path for a two-proportion comparison:</p>
          {['DOE → Sample Size and Power → Two Sample Proportions', 'Enter Alpha (0.05)', 'Enter Proportion 1 (baseline group)', 'Enter Proportion 2 (intervention group)', 'Enter Power (0.80 or 0.90)', 'Click Continue — JMP returns the required n per group'].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i+1}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.dim, padding: '4px 10px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 6, lineHeight: 1.6 }}>{step}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
