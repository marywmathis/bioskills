import { useState, useMemo } from 'react'
import { C, s, Section } from './utils'

// ── Math helpers ──
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const p = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const r = 1 - p * Math.exp(-x * x)
  return x >= 0 ? r : -r
}
function ncdf(x) { return 0.5 * (1 + erf(x / Math.sqrt(2))) }
function npdf(x) { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI) }
function nppf(p) {
  // Rational approximation
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  const a = [0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239]
  const b = [0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
  const pLow = 0.02425, pHigh = 1 - pLow
  let q, r
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
  } else if (p <= pHigh) {
    q = p - 0.5; r = q * q
    return (((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*q / (((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1)
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
  }
}

function calcPower(n, effectSize, sigma, alpha) {
  const se = sigma / Math.sqrt(n)
  const zAlpha = nppf(1 - alpha / 2)
  const ncp = effectSize / se
  return 1 - ncdf(zAlpha - ncp) + ncdf(-zAlpha - ncp)
}

function calcN(effectSize, sigma, alpha, power) {
  const zAlpha = nppf(1 - alpha / 2)
  const zBeta = nppf(power)
  return Math.ceil(((zAlpha + zBeta) * sigma / effectSize) ** 2)
}

// ── Overlapping distributions curve ──
function PowerCurve({ n, effectSize, sigma, alpha }) {
  const W = 500, H = 160, PAD = { l: 20, r: 20, t: 16, b: 24 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b

  const se = sigma / Math.sqrt(n)
  const mu0 = 0, mu1 = effectSize
  const xMin = mu0 - 4 * se, xMax = mu1 + 4 * se
  const toX = v => PAD.l + ((v - xMin) / (xMax - xMin)) * innerW
  const maxPdf = npdf(0) / se
  const toY = v => PAD.t + innerH - (v / (maxPdf * 1.1)) * innerH

  const zAlpha = nppf(1 - alpha / 2)
  const critRight = mu0 + zAlpha * se
  const critLeft = mu0 - zAlpha * se

  const power = calcPower(n, effectSize, sigma, alpha)

  const pts0 = [], pts1 = []
  for (let x = xMin; x <= xMax; x += (xMax - xMin) / 200) {
    pts0.push({ x, y: npdf((x - mu0) / se) / se })
    pts1.push({ x, y: npdf((x - mu1) / se) / se })
  }

  const pathStr = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ')

  // Power region: alt distribution to the right of critRight
  const powerPts = pts1.filter(p => p.x >= critRight)
  const powerPath = powerPts.length > 1
    ? powerPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ') +
      ` L${toX(powerPts[powerPts.length-1].x).toFixed(1)},${toY(0).toFixed(1)} L${toX(critRight).toFixed(1)},${toY(0).toFixed(1)} Z`
    : ''

  // Beta region: alt distribution to left of critRight
  const betaPts = pts1.filter(p => p.x <= critRight)
  const betaPath = betaPts.length > 1
    ? betaPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ') +
      ` L${toX(betaPts[betaPts.length-1].x).toFixed(1)},${toY(0).toFixed(1)} L${toX(betaPts[0].x).toFixed(1)},${toY(0).toFixed(1)} Z`
    : ''

  // Alpha regions
  const alphaRPts = pts0.filter(p => p.x >= critRight)
  const alphaRPath = alphaRPts.length > 1
    ? alphaRPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ') +
      ` L${toX(alphaRPts[alphaRPts.length-1].x).toFixed(1)},${toY(0).toFixed(1)} L${toX(critRight).toFixed(1)},${toY(0).toFixed(1)} Z`
    : ''

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block', maxWidth: '100%' }}>
        <rect x={0} y={0} width={W} height={H} fill={C.alt} rx={8} />
        {/* Baseline */}
        <line x1={PAD.l} y1={toY(0)} x2={W - PAD.r} y2={toY(0)} stroke={C.border} strokeWidth={1} />
        {/* Beta region */}
        {betaPath && <path d={betaPath} fill={C.coral} fillOpacity={0.15} />}
        {/* Power region */}
        {powerPath && <path d={powerPath} fill={C.green} fillOpacity={0.3} />}
        {/* Alpha region */}
        {alphaRPath && <path d={alphaRPath} fill={C.amber} fillOpacity={0.3} />}
        {/* Null curve */}
        <path d={pathStr(pts0)} fill="none" stroke={C.muted} strokeWidth={2} />
        {/* Alt curve */}
        <path d={pathStr(pts1)} fill="none" stroke={C.teal} strokeWidth={2.5} />
        {/* Critical value line */}
        {toX(critRight) > PAD.l && toX(critRight) < W - PAD.r && (
          <line x1={toX(critRight)} y1={PAD.t} x2={toX(critRight)} y2={toY(0)} stroke={C.amber} strokeWidth={1.5} strokeDasharray="4 2" />
        )}
        {/* Labels */}
        <text x={toX(mu0)} y={PAD.t + 10} textAnchor="middle" fontSize={10} fill={C.muted} fontWeight="600">H₀</text>
        <text x={Math.min(toX(mu1), W - PAD.r - 10)} y={PAD.t + 10} textAnchor="middle" fontSize={10} fill={C.teal} fontWeight="600">Hₐ</text>
        {/* Power label */}
        {power > 0.05 && powerPts.length > 2 && (
          <text x={Math.min(toX(critRight + se * 0.8), W - PAD.r - 20)} y={PAD.t + 28} fontSize={11} fill={C.green} fontWeight="700">Power={( power * 100).toFixed(0)}%</text>
        )}
        {/* X axis ticks */}
        {[mu0, mu1].map((v, i) => (
          <g key={i}>
            <line x1={toX(v)} y1={toY(0)} x2={toX(v)} y2={toY(0) + 4} stroke={C.muted} strokeWidth={1} />
            <text x={toX(v)} y={H - 4} textAnchor="middle" fontSize={9} fill={C.muted}>{i === 0 ? 'H₀ mean' : 'True mean'}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: C.dim, marginTop: 6, flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 3, background: C.muted, verticalAlign: 'middle', marginRight: 4 }} />Null distribution (H₀)</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 3, background: C.teal, verticalAlign: 'middle', marginRight: 4 }} />Alternative distribution (Hₐ)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: C.green, opacity: 0.5, verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }} />Power (detect real effect)</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: C.coral, opacity: 0.4, verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }} />β (miss real effect)</span>
      </div>
    </div>
  )
}

// ── Main ──
export default function PowerSampleSize() {
  // Section 3 state
  const [activeSlider, setActiveSlider] = useState('n')
  const [pN, setPN] = useState(50)
  const [pEffect, setPEffect] = useState(5)
  const [pSigma, setPSigma] = useState(15)
  const [pAlpha, setPAlpha] = useState(0.05)
  const power = calcPower(pN, pEffect, pSigma, pAlpha)
  const prevPower = useMemo(() => {
    if (activeSlider === 'n') return calcPower(50, pEffect, pSigma, pAlpha)
    if (activeSlider === 'effect') return calcPower(pN, 5, pSigma, pAlpha)
    if (activeSlider === 'sigma') return calcPower(pN, pEffect, 15, pAlpha)
    if (activeSlider === 'alpha') return calcPower(pN, pEffect, pSigma, 0.05)
    return power
  }, [activeSlider])

  const powerDir = power > prevPower + 0.005 ? 'increased' : power < prevPower - 0.005 ? 'decreased' : null

  const powerMessages = {
    n: {
      increased: 'Power increased because a larger sample produces narrower distributions — less overlap, easier to distinguish the true effect from chance.',
      decreased: 'Power decreased because a smaller sample produces wider distributions — more overlap, harder to detect a real effect.',
    },
    effect: {
      increased: 'Power increased because a larger effect size moves the two distributions further apart — the signal is louder and easier to detect.',
      decreased: 'Power decreased because a smaller effect size moves the distributions closer together — harder to tell apart from chance variation.',
    },
    sigma: {
      increased: 'Power decreased because more variability in the outcome means wider, more overlapping distributions — harder to detect the effect.',
      decreased: 'Power increased because less variability means narrower distributions — less overlap, easier to detect the effect.',
    },
    alpha: {
      increased: 'Power increased because a higher α moves the critical value closer to the null mean — easier to reject H₀. But this also increases the false positive rate.',
      decreased: 'Power decreased because a lower α moves the critical value further from the null mean — harder to reject H₀, but fewer false positives.',
    },
  }

  const currentMsg = activeSlider && powerDir ? powerMessages[activeSlider]?.[powerDir] : null

  // Sample size calculator
  const [calcP1, setCalcP1] = useState(0.30)
  const [calcDelta, setCalcDelta] = useState(0.10)
  const [calcAlpha, setCalcAlpha] = useState(0.05)
  const [calcPower, setCalcPower] = useState(0.80)
  const calcSigma = Math.sqrt((calcP1 * (1 - calcP1) + (calcP1 + calcDelta) * (1 - calcP1 - calcDelta)) / 2)
  const requiredN = calcN(calcDelta, calcSigma, calcAlpha, calcPower)

  // Study comparison
  const [studyPick, setStudyPick] = useState(null)

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Power & Sample Size</div>
      <div style={s.pageSub}>
        Every sample size calculation asks one question: How many participants do we need so that, if the effect we're looking for is real, our study is likely to detect it?
      </div>

      {/* 1. Can you miss a real effect? */}
      <Section icon="?" iconBg={C.coralSoft} title="Can You Miss a Real Effect?" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Suppose a new blood pressure medication truly lowers systolic blood pressure by 8 mmHg on average. Two research teams study the same medication.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Study A', n: 30, result: 'p = 0.21', sig: false, conclusion: '"The medication doesn\'t appear to work."', reality: 'Wrong. The effect is real — the study was just too small to detect it.' },
              { label: 'Study B', n: 500, result: 'p = 0.003', sig: true, conclusion: '"The medication significantly lowers blood pressure."', reality: 'Correct. Same medication. Same true effect. Larger sample.' },
            ].map((study, i) => (
              <div key={i} style={{ padding: '14px 16px', background: study.sig ? C.greenSoft : C.coralSoft, border: `1px solid ${study.sig ? 'rgba(26,122,62,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: study.sig ? C.green : C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{study.label}</div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 6 }}>Sample size: <strong style={{ color: C.text }}>n = {study.n}</strong></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: study.sig ? C.green : C.coral, marginBottom: 8 }}>{study.result} → {study.sig ? 'Significant ✓' : 'Not significant ✗'}</div>
                <div style={{ fontSize: 13, color: C.dim, fontStyle: 'italic', marginBottom: 6 }}>Researcher concludes: {study.conclusion}</div>
                <div style={{ fontSize: 12, color: study.sig ? C.green : C.coral, fontWeight: 600 }}>{study.reality}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>The question to ask:</strong> Did the treatment stop working between Study A and Study B? No. The only thing that changed was the sample size. A non-significant result doesn't mean the effect doesn't exist — it may mean the study wasn't large enough to detect it. That's the problem power is designed to solve.
          </div>
        </div>
      </Section>

      {/* 2. What is power? */}
      <Section icon="=" iconBg={C.purpleSoft} title="What Is Statistical Power?">
        <div style={{ paddingTop: 20 }}>
          <div style={{ padding: '14px 18px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: C.purple, marginBottom: 4 }}>Power = the probability of detecting a real effect when one truly exists</div>
            <div style={{ fontSize: 13, color: C.dim }}>Equivalently: the chance your study will produce a significant result when the treatment actually works.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ background: C.alt, padding: '10px 14px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${C.border}` }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: C.alt, borderBottom: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}` }}>
              <div style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em' }}>H₀ is True (no effect)</div>
              <div style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', borderLeft: `1px solid ${C.border}` }}>H₀ is False (effect exists)</div>
            </div>
            {[
              { row: 'Reject H₀ (significant)', tl: { label: 'Type I Error (α)', sub: 'False positive — concluded effect exists when it doesn\'t', color: C.amber }, tr: { label: 'Power (1 − β)', sub: 'Correctly detected the real effect', color: C.green } },
              { row: 'Fail to reject H₀ (not significant)', tl: { label: 'Correct decision', sub: 'No effect and no significant result', color: C.teal }, tr: { label: 'Type II Error (β)', sub: 'Missed a real effect — false negative', color: C.coral } },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: `1px solid ${C.border}` }}>
                <div style={{ padding: '10px 14px', fontSize: 12, color: C.dim, fontWeight: 600, borderRight: `1px solid ${C.border}`, display: 'flex', alignItems: 'center' }}>{r.row}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderLeft: `1px solid ${C.border}` }}>
                  {[r.tl, r.tr].map((cell, j) => (
                    <div key={j} style={{ padding: '10px 12px', background: cell.color + '15', borderLeft: j > 0 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: cell.color, marginBottom: 3 }}>{cell.label}</div>
                      <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{cell.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 14px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim }}>
              <strong style={{ color: C.green }}>Power = 1 − β</strong><br />If β = 20%, power = 80%. A study with 80% power has an 80% chance of detecting the effect — and a 20% chance of missing it.
            </div>
            <div style={{ padding: '10px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim }}>
              <strong style={{ color: C.coral }}>β = chance of missing</strong><br />Students find "probability of missing a real effect" more intuitive than β. They're the same thing.
            </div>
          </div>
        </div>
      </Section>

      {/* 3. What moves power? */}
      <Section icon="~" iconBg={C.tealSoft} title="What Moves Power?" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Move one slider at a time and watch what happens to the distributions. After each change, an explanation appears.</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { key: 'n', label: 'Sample size (n)' },
              { key: 'effect', label: 'Effect size' },
              { key: 'sigma', label: 'Variability (σ)' },
              { key: 'alpha', label: 'Significance level (α)' },
            ].map(btn => (
              <button key={btn.key} onClick={() => setActiveSlider(btn.key)}
                style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, background: activeSlider === btn.key ? C.teal : C.surface, color: activeSlider === btn.key ? '#fff' : C.dim, border: `1px solid ${activeSlider === btn.key ? C.teal : C.border}`, transition: 'all 0.15s' }}>
                {btn.label}
              </button>
            ))}
          </div>

          <PowerCurve n={pN} effectSize={pEffect} sigma={pSigma} alpha={pAlpha} />

          <div style={{ marginTop: 14 }}>
            {activeSlider === 'n' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                  <span>Sample size (n)</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{pN}</span>
                </div>
                <input type="range" min={10} max={300} step={5} value={pN} onChange={e => setPN(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            )}
            {activeSlider === 'effect' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                  <span>Effect size (mmHg difference)</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{pEffect}</span>
                </div>
                <input type="range" min={1} max={25} step={1} value={pEffect} onChange={e => setPEffect(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            )}
            {activeSlider === 'sigma' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                  <span>Population variability (σ)</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{pSigma}</span>
                </div>
                <input type="range" min={5} max={30} step={1} value={pSigma} onChange={e => setPSigma(parseInt(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            )}
            {activeSlider === 'alpha' && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
                  <span>Significance level (α)</span><span style={{ fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{pAlpha}</span>
                </div>
                <input type="range" min={0.01} max={0.20} step={0.01} value={pAlpha} onChange={e => setPAlpha(parseFloat(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
              </div>
            )}
          </div>

          <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: C.dim }}>
              Current power: <strong style={{ fontSize: 18, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{(power * 100).toFixed(1)}%</strong>
              <span style={{ marginLeft: 8, fontSize: 12, color: C.muted }}>({(power * 100).toFixed(1)}% chance of detecting the effect · {((1-power)*100).toFixed(1)}% chance of missing it)</span>
            </div>
          </div>

          {currentMsg && (
            <div style={{ padding: '10px 14px', background: powerDir === 'increased' ? C.greenSoft : C.coralSoft, border: `1px solid ${powerDir === 'increased' ? 'rgba(26,122,62,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              <strong style={{ color: powerDir === 'increased' ? C.green : C.coral }}>Power {powerDir}.</strong> {currentMsg}
            </div>
          )}
        </div>
      </Section>

      {/* 4. Why each factor matters */}
      <Section icon="→" iconBg={C.amberSoft} title="Why Each Factor Matters">
        <div style={{ paddingTop: 20 }}>
          <p style={{ ...s.prose, marginBottom: 16 }}>
            Think of detecting an effect like trying to hear someone talking across a room.
            A <strong style={{ color: C.text }}>small effect</strong> is a whisper. A <strong style={{ color: C.text }}>small sample</strong> is a crowded, noisy room. Increasing the sample size quiets the room. Increasing the effect size makes the signal louder. Either way, power rises.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              {
                factor: 'Sample size (n) ↑',
                chain: ['More people', 'Less random noise in the estimate', 'Narrower distributions', 'Less overlap', 'Easier to detect real effects'],
                color: C.teal, verdict: 'Power increases', control: 'You control this — it\'s the primary tool for improving power.',
              },
              {
                factor: 'Effect size ↑',
                chain: ['Larger true difference', 'Signal stands out more', 'Distributions move apart', 'Less overlap', 'Easier to distinguish from chance'],
                color: C.purple, verdict: 'Power increases', control: 'Usually fixed by nature — you can\'t make a drug work better by changing your design.',
              },
              {
                factor: 'Variability (σ) ↑',
                chain: ['More variation in the outcome', 'Wider distributions', 'More overlap between groups', 'Harder to see the signal', 'Easier to miss the effect'],
                color: C.coral, verdict: 'Power decreases', control: 'Partially controllable — stricter eligibility criteria, standardized protocols, and better measurement reduce σ.',
              },
              {
                factor: 'Alpha (α) ↑',
                chain: ['Threshold to reject H₀ is lower', 'Easier to declare significance', 'Critical value moves left', 'More of Hₐ falls in rejection region', 'Power increases — but so do false positives'],
                color: C.amber, verdict: 'Power increases (with a cost)', control: 'Rarely changed — α = 0.05 is the standard convention. Increasing α trades false negatives for false positives.',
              },
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
                <div style={{ fontSize: 11, padding: '5px 9px', background: item.color + '15', borderRadius: 5, color: item.color, fontWeight: 600, marginBottom: 6 }}>{item.verdict}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{item.control}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 5. Why 80%? */}
      <Section icon="%" iconBg={C.purpleSoft} title="Why 80% Power?">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Students often wonder whether 80% is a magic number. It isn't.</p>
          <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10, marginBottom: 14, fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
            <strong style={{ color: C.purple }}>80% power</strong> means that if a real effect exists, your study has an 80% chance of detecting it — and a 20% chance of missing it. Researchers commonly choose 80% because it balances two competing pressures:
            <ul style={{ marginTop: 8, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Larger studies cost more money, take longer, and expose more participants to potential risks.</li>
              <li>Underpowered studies waste resources and may reach incorrect conclusions.</li>
            </ul>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { pwr: '80%', label: 'Standard', desc: 'Accepted minimum in most fields', color: C.teal },
              { pwr: '90%', label: 'Higher', desc: 'Used for confirmatory trials or when missing an effect is costly', color: C.purple },
              { pwr: '95%+', label: 'Very high', desc: 'Requires substantially larger samples — used in pivotal clinical trials', color: C.amber },
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: item.color }}>{item.pwr}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: '4px 0' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            80% is a <strong style={{ color: C.text }}>convention, not a rule.</strong> Some journals and funding agencies require 90%. The appropriate power depends on the consequences of missing a real effect — which varies by research context.
          </div>
        </div>
      </Section>

      {/* 6. Cost of being underpowered */}
      <Section icon="!" iconBg={C.coralSoft} title="The Cost of Being Underpowered">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Both studies below test whether a dietary intervention reduces systolic blood pressure. The true effect is real — a 6 mmHg reduction. Which study gets it right?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Underpowered Study', n: 25, pwr: 40, result: 'p = 0.18', sig: false, conclusion: '"The dietary intervention did not significantly reduce blood pressure. Further research may not be warranted."', problem: 'This conclusion is likely wrong. With only 40% power, the study had a 60% chance of missing the effect — and it did.' },
              { label: 'Well-powered Study', n: 250, pwr: 90, result: 'p = 0.004', sig: true, conclusion: '"The dietary intervention significantly reduced blood pressure. The finding is ready for clinical translation."', problem: 'Same intervention. Same true effect. Enough participants to detect it.' },
            ].map((study, i) => (
              <div key={i} style={{ padding: '14px 16px', background: study.sig ? C.greenSoft : C.coralSoft, border: `1px solid ${study.sig ? 'rgba(26,122,62,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: study.sig ? C.green : C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{study.label}</div>
                <div style={{ fontSize: 13, color: C.dim, marginBottom: 4 }}>n = <strong>{study.n}</strong> &nbsp;|&nbsp; Power ≈ <strong>{study.pwr}%</strong></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: study.sig ? C.green : C.coral, marginBottom: 10 }}>{study.result} → {study.sig ? 'Significant ✓' : 'Not significant ✗'}</div>
                <div style={{ fontSize: 12, color: C.dim, fontStyle: 'italic', marginBottom: 8, lineHeight: 1.6 }}>"{study.conclusion}"</div>
                <div style={{ fontSize: 12, color: study.sig ? C.green : C.coral, fontWeight: 600, lineHeight: 1.6 }}>{study.problem}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>Why this matters beyond statistics:</strong> Underpowered studies don't just produce wrong answers — they waste resources, expose participants to study procedures without generating useful knowledge, and can delay effective treatments from reaching patients. Power is an ethical consideration, not just a statistical one.
          </div>
        </div>
      </Section>

      {/* 7. Sample size calculator */}
      <Section icon="⚙" iconBg={C.tealSoft} title="Sample Size Calculator">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>For comparing two proportions. Enter your study parameters and calculate the required sample size per group.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              {[
                { label: 'Baseline proportion (p₁)', val: calcP1, set: setCalcP1, min: 0.05, max: 0.90, step: 0.01, fmt: v => (v*100).toFixed(0)+'%', note: 'The proportion in the control group, based on prior literature.' },
                { label: 'Minimum detectable difference (δ)', val: calcDelta, set: setCalcDelta, min: 0.02, max: 0.40, step: 0.01, fmt: v => (v*100).toFixed(0)+' pp', note: 'The smallest difference that would be clinically meaningful.' },
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
                    <button key={v} onClick={() => setCalcPower(v)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', background: calcPower === v ? C.teal : C.surface, border: `1px solid ${calcPower === v ? C.teal : C.border}`, color: calcPower === v ? '#fff' : C.dim, fontWeight: calcPower === v ? 700 : 400 }}>{(v*100).toFixed(0)}%</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '16px', background: C.purpleSoft, border: `2px solid ${C.purple}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Required sample size</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 700, color: C.purple }}>{requiredN}</div>
                <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>participants per group</div>
                <div style={{ fontSize: 12, color: C.purple, marginTop: 4, fontWeight: 600 }}>Total: {requiredN * 2} participants</div>
              </div>
              <div style={{ padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                <strong style={{ color: C.text }}>What this means:</strong> To detect a difference of {(calcDelta*100).toFixed(0)} percentage points (from {(calcP1*100).toFixed(0)}% to {((calcP1+calcDelta)*100).toFixed(0)}%) with {(calcPower*100).toFixed(0)}% power and α = {calcAlpha}, you need {requiredN} participants in each group.
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 8. JMP walkthrough — collapsed */}
      <Section icon="💻" iconBg={C.alt} title="Using JMP for Sample Size Calculations">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>JMP's interactive sample size calculator handles means, proportions, and paired designs. Here's the path for a two-proportion comparison.</p>
          {[
            { step: 1, text: 'DOE → Sample Size and Power → Two Sample Proportions' },
            { step: 2, text: 'Enter Alpha (significance level, typically 0.05)' },
            { step: 3, text: 'Enter Proportion 1 (baseline group proportion)' },
            { step: 4, text: 'Enter Proportion 2 (expected proportion in intervention group)' },
            { step: 5, text: 'Enter Power (typically 0.80 or 0.90)' },
            { step: 6, text: 'Click Continue — JMP returns the required sample size per group' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{item.step}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.dim, padding: '4px 10px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 6, lineHeight: 1.6 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
