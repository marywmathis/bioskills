import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Math ──
function erfA(x) {
  const sign = x >= 0 ? 1 : -1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  return sign * (1 - poly * Math.exp(-ax * ax))
}
function ncdfA(z) { return 0.5 * (1 + erfA(z / Math.sqrt(2))) }
function npdfA(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI) }

const ZA = { 0.90: 1.282, 0.95: 1.645, 0.975: 1.960, 0.99: 2.326, 0.995: 2.576 }
function zCritA(p) { return ZA[p] || 1.960 }

const TRUE_P = 0.40
const ALPHA = 0.05
const DELTA = 5
const SIGMA = 15

function getCIWidth(n) {
  const za = zCritA(1 - ALPHA / 2)
  const se = Math.sqrt(TRUE_P * (1 - TRUE_P) / n)
  return 2 * za * se
}

function getPowerA(n) {
  const seN = SIGMA / Math.sqrt(n)
  const zaP = zCritA(1 - ALPHA / 2)
  const ncpP = DELTA / seN
  return 1 - ncdfA(zaP - ncpP) + ncdfA(-zaP - ncpP)
}

// ── CI number line ──
function CILine({ n, width = 320 }) {
  const clCiW = getCIWidth(n)
  const clW = width, H = 56, PL = 20, PR = 20
  const plotW = clW - PL - PR
  const center = clW / 2
  const halfPx = Math.min((clCiW / 0.6) * (plotW / 2), plotW * 0.48)

  return (
    <svg width={clW} height={H} style={{ display: 'block', maxWidth: '100%' }}>
      <rect width={clW} height={H} fill={C.alt} rx={6} />
      <line x1={PL} y1={H/2} x2={clW-PR} y2={H/2} stroke={C.border} strokeWidth={1.5} />
      {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map(v => {
        const x = PL + v * plotW
        return (
          <g key={v}>
            <line x1={x} y1={H/2-4} x2={x} y2={H/2+4} stroke={C.muted} strokeWidth={1} />
            <text x={x} y={H-4} textAnchor="middle" fontSize={9} fill={C.muted}>{v.toFixed(1)}</text>
          </g>
        )
      })}
      <line x1={center - halfPx} y1={H/2} x2={center + halfPx} y2={H/2} stroke={C.purple} strokeWidth={4} strokeLinecap="round" />
      <line x1={center - halfPx} y1={H/2-7} x2={center - halfPx} y2={H/2+7} stroke={C.purple} strokeWidth={2} />
      <line x1={center + halfPx} y1={H/2-7} x2={center + halfPx} y2={H/2+7} stroke={C.purple} strokeWidth={2} />
      <circle cx={center} cy={H/2} r={4} fill={C.purple} />
      <text x={center} y={14} textAnchor="middle" fontSize={10} fill={C.purple} fontWeight="700">Width = {(clCiW).toFixed(3)}</text>
    </svg>
  )
}

// ── Power bar ──
function PowerBar({ n, width = 320 }) {
  const pbPwr = getPowerA(n)
  const pbW = width, H = 52
  return (
    <svg width={pbW} height={H} style={{ display: 'block', maxWidth: '100%' }}>
      <rect width={pbW} height={H} fill={C.alt} rx={6} />
      <text x={pbW/2} y={13} textAnchor="middle" fontSize={10} fill={C.muted}>Power</text>
      <rect x={8} y={18} width={pbW-16} height={16} rx={4} fill={C.border} />
      <rect x={8} y={18} width={Math.max(0, (pbW-16) * pbPwr)} height={16} rx={4} fill={pbPwr >= 0.8 ? C.green : pbPwr >= 0.5 ? C.amber : C.coral} />
      <text x={pbW/2} y={48} textAnchor="middle" fontSize={11} fill={pbPwr >= 0.8 ? C.green : pbPwr >= 0.5 ? C.amber : C.coral} fontWeight="700">{(pbPwr*100).toFixed(1)}%</text>
    </svg>
  )
}

// ── Snapshot card ──
function SnapshotCard({ n, highlight }) {
  const snCiW = getCIWidth(n)
  const snPwr = getPowerA(n)
  const BAR_W = 180
  const filledPx = Math.round(BAR_W * snPwr)
  const ciPx = Math.round(BAR_W * Math.min(snCiW / 0.65, 1))
  return (
    <div style={{ padding: '14px 16px', background: highlight ? C.purpleSoft : C.surface, border: `1.5px solid ${highlight ? C.purple : C.border}`, borderRadius: 10 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: highlight ? C.purple : C.text, marginBottom: 12 }}>n = {n}</div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Confidence interval width</div>
        <div style={{ position: 'relative', height: 14, width: BAR_W, background: C.alt, borderRadius: 3, marginBottom: 3 }}>
          <div style={{ position: 'absolute', left: Math.round((BAR_W - ciPx) / 2), width: ciPx, height: '100%', background: C.purple, borderRadius: 3, opacity: 0.7 }} />
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: C.purple }}>{(snCiW * 100).toFixed(1)} percentage points</div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Statistical power</div>
        <div style={{ height: 14, width: BAR_W, background: C.alt, borderRadius: 3, marginBottom: 3 }}>
          <div style={{ width: filledPx, height: '100%', background: snPwr >= 0.8 ? C.green : snPwr >= 0.5 ? C.amber : C.coral, borderRadius: 3 }} />
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: snPwr >= 0.8 ? C.green : snPwr >= 0.5 ? C.amber : C.coral }}>{(snPwr * 100).toFixed(0)}%</div>
      </div>
    </div>
  )
}

// ── Quick check ──
function QuickCheck() {
  const [q1pick, setQ1pick] = useState(null)
  const [q2pick, setQ2pick] = useState(null)

  const q1opts = [
    { val: 'a', label: 'The confidence interval becomes half as wide.' },
    { val: 'b', label: 'The confidence interval becomes somewhat narrower.' },
    { val: 'c', label: 'The p-value is cut in half.' },
    { val: 'd', label: 'The study becomes unbiased.' },
  ]
  const q1correct = 'b'
  const q1feedback = {
    a: 'Close — but halving the width requires quadrupling n, not doubling it. Doubling n reduces width by a factor of √2 (about 29% narrower).',
    b: 'Correct. Doubling n narrows the CI by a factor of √2 — meaningful, but not half. To halve the width, you need to quadruple n.',
    c: 'Not necessarily. The p-value depends on the observed effect size and variability, not just n. A larger n makes it easier to detect effects, but the p-value is not simply cut in half.',
    d: 'Never. Sample size increases precision, but cannot fix a biased sample. A large biased sample gives precise but wrong estimates.',
  }

  const q2opts = [
    { val: 'a', label: 'Increase n by 10.' },
    { val: 'b', label: 'Double n.' },
    { val: 'c', label: 'Quadruple n.' },
    { val: 'd', label: 'Increase n by 10-fold.' },
  ]
  const q2correct = 'c'
  const q2feedback = {
    a: 'Adding 10 participants would barely change the CI width. The relationship between n and CI width follows the 1/√n rule — small absolute increases in large samples have diminishing returns.',
    b: 'Doubling n narrows the CI by about 29% — meaningful, but not enough to halve the width.',
    c: 'Correct. The 1/√n rule: CI width ∝ 1/√n. To halve the width, you need √n to double, which means n must quadruple.',
    d: 'A 10-fold increase would narrow the CI by about 68% — more than needed to halve it, and much more expensive than necessary.',
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>
          Question 1: A researcher doubles the sample size. Which statement is always true?
        </div>
        {q1opts.map(opt => {
          const answered = q1pick !== null
          const isPicked = q1pick === opt.val
          const isCorrect = opt.val === q1correct
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (isCorrect) { bg = C.greenSoft; border = C.green; color = C.green }
            else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={opt.val} onClick={() => !q1pick && setQ1pick(opt.val)}
              disabled={!!q1pick}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 13px', marginBottom: 6, background: bg, border: `1px solid ${border}`, borderRadius: 7, color, fontSize: 13, cursor: q1pick ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {opt.label}
              {answered && isCorrect && <span style={{ float: 'right' }}>✓</span>}
              {answered && isPicked && !isCorrect && <span style={{ float: 'right', color: C.coral }}>✗</span>}
            </button>
          )
        })}
        {q1pick && (
          <div style={{ padding: '10px 13px', background: q1pick === q1correct ? C.tealSoft : C.coralSoft, border: `1px solid ${q1pick === q1correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7, marginTop: 4 }}>
            {q1feedback[q1pick]}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>
          Question 2: A researcher wants to halve her confidence interval width. By how much must she increase n?
        </div>
        {q2opts.map(opt => {
          const answered = q2pick !== null
          const isPicked = q2pick === opt.val
          const isCorrect = opt.val === q2correct
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (isCorrect) { bg = C.greenSoft; border = C.green; color = C.green }
            else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={opt.val} onClick={() => !q2pick && setQ2pick(opt.val)}
              disabled={!!q2pick}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 13px', marginBottom: 6, background: bg, border: `1px solid ${border}`, borderRadius: 7, color, fontSize: 13, cursor: q2pick ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {opt.label}
              {answered && isCorrect && <span style={{ float: 'right' }}>✓</span>}
              {answered && isPicked && !isCorrect && <span style={{ float: 'right', color: C.coral }}>✗</span>}
            </button>
          )
        })}
        {q2pick && (
          <div style={{ padding: '10px 13px', background: q2pick === q2correct ? C.tealSoft : C.coralSoft, border: `1px solid ${q2pick === q2correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7, marginTop: 4 }}>
            {q2feedback[q2pick]}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ──
export default function SampleSizeEffect() {
  const [n, setN] = useState(50)
  const ciW = getCIWidth(n)
  const pwr = getPowerA(n)

  const presets = [25, 100, 400, 1600]

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Why Sample Size Matters</div>
      <div style={s.pageSub}>
        Everything you have learned about confidence intervals and statistical power comes together here. Sample size affects both the precision of your estimates and your ability to detect real effects — but it cannot overcome problems in study design or sampling.
      </div>

      {/* 1. What n buys you */}
      <Section icon="?" iconBg={C.tealSoft} title="What Does Increasing Sample Size Actually Buy You?" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Two things — and only two things:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>More precise estimates</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>Larger samples produce narrower confidence intervals. Your estimate of the population parameter gets closer to the truth — not because you got lucky, but because there is less random variation in larger samples.</div>
            </div>
            <div style={{ padding: '14px 16px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Greater ability to detect real effects</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>Larger samples produce higher statistical power. If a real effect exists, a well-powered study is more likely to find it — and less likely to produce a misleading non-significant result.</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>More participants improve precision — not study quality.</strong> A larger sample cannot fix a biased design, a poorly measured outcome, or the wrong statistical test. It only helps if the study itself is sound.
          </div>
        </div>
      </Section>

      {/* 2. Live simulator */}
      <Section icon="~" iconBg={C.purpleSoft} title="Watch Both Change at Once" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Drag the slider. Watch precision and power respond simultaneously.</p>

          {/* Slider */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
              <span style={{ color: C.dim }}>Sample size</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 20, color: C.text }}>n = {n}</span>
            </div>
            <input type="range" min={10} max={500} step={1} value={n} onChange={e => setN(+e.target.value)} style={{ width: '100%', accentColor: C.purple }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginTop: 2 }}>
              <span>10</span><span>500</span>
            </div>
          </div>

          {/* Two displays side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div style={{ padding: '12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Precision — Confidence Interval</div>
              <CILine n={n} />
              <div style={{ marginTop: 8, fontSize: 12, color: C.dim }}>
                Width: <strong style={{ color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{ciW.toFixed(3)}</strong>
                <span style={{ marginLeft: 6, fontSize: 11, color: C.muted }}>({(ciW * 100).toFixed(1)} percentage points)</span>
              </div>
            </div>
            <div style={{ padding: '12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Detection — Statistical Power</div>
              <PowerBar n={n} />
              <div style={{ marginTop: 8, fontSize: 12, color: C.dim }}>
                Power: <strong style={{ color: pwr >= 0.8 ? C.green : pwr >= 0.5 ? C.amber : C.coral, fontFamily: "'JetBrains Mono', monospace" }}>{(pwr * 100).toFixed(1)}%</strong>
                <span style={{ marginLeft: 6, fontSize: 11, color: C.muted }}>({((1-pwr)*100).toFixed(1)}% chance of missing a real effect)</span>
              </div>
            </div>
          </div>

          {/* Summary sentence */}
          <div style={{ padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            At n = {n}: CI width = <strong style={{ color: C.purple }}>{(ciW*100).toFixed(1)} percentage points</strong> · Power = <strong style={{ color: pwr >= 0.8 ? C.green : pwr >= 0.5 ? C.amber : C.coral }}>{(pwr*100).toFixed(1)}%</strong>
            {pwr >= 0.8 && <span style={{ color: C.green, marginLeft: 8, fontWeight: 600 }}>✓ Adequately powered</span>}
            {pwr < 0.5 && <span style={{ color: C.coral, marginLeft: 8, fontWeight: 600 }}>⚠ Likely underpowered</span>}
          </div>
        </div>
      </Section>

      {/* 3. The 1/√n rule */}
      <Section icon="=" iconBg={C.amberSoft} title="The 1/√n Rule — Discover It Yourself">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Click through these four sample sizes in order. Watch what happens to the CI width each time you quadruple n.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
            {presets.map(pn => (
              <button key={pn} onClick={() => setN(pn)}
                style={{ padding: '10px 8px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700, textAlign: 'center', background: n === pn ? C.amberSoft : C.surface, border: `1px solid ${n === pn ? C.amber : C.border}`, color: n === pn ? C.amber : C.dim }}>
                n = {pn}
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: n === pn ? C.amber : C.muted, marginTop: 4 }}>
                  width = {(getCIWidth(pn)*100).toFixed(2)}%
                </div>
                <div style={{ fontSize: 11, color: n === pn ? C.amber : C.muted, marginTop: 2 }}>
                  power = {(getPowerA(pn)*100).toFixed(0)}%
                </div>
              </button>
            ))}
          </div>
          <div style={{ padding: '14px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 10 }}>What you just discovered:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[[25, 100], [100, 400], [400, 1600]].map(([a, b], i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: C.dim }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: C.amber }}>n = {a} → n = {b}</span>
                  <span style={{ color: C.muted }}>(4× increase)</span>
                  <span style={{ color: C.text }}>→ CI width ÷ 2 &nbsp;({(getCIWidth(a)*100).toFixed(2)}% → {(getCIWidth(b)*100).toFixed(2)}%)</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>Why four times, not two?</div>
            A confidence interval's width is 2 × z* × SE, and SE = √(p(1−p)/n). The sample size sits <em>under a square root</em>, so the width shrinks with 1/√n, not 1/n. That square root is the whole story: to halve the width, √n must double, and for √n to double, n must quadruple. Check it — √25 = 5, √100 = 10: n went ×4, √n went ×2, the width halved. Plain version: precision rides on the square root of n, and square roots grow slowly, so it takes four times the people to double the precision.
          </div>
          <div style={{ padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.purple }}>The 1/√n rule:</strong> CI width is proportional to 1/√n. To halve the width, you must quadruple the sample size. To cut it to one-third, you need nine times as many participants. Precision is expensive.
          </div>
        </div>
      </Section>

      {/* 4. Diminishing returns */}
      <Section icon="↘" iconBg={C.tealSoft} title="Diminishing Returns">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Every additional participant improves precision — but each one improves it a little less than the one before. Watch what happens as n quadruples each time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[25, 100, 400, 1600].map(pn => <SnapshotCard key={pn} n={pn} highlight={pn === 100} />)}
          </div>
          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 14 }}>
            <strong style={{ color: C.amber }}>What you can see:</strong> Quadrupling n from 25 to 100 cuts the CI roughly in half. Quadrupling again from 100 to 400 cuts it in half again. But going from 400 to 1600 produces the same proportional gain for four times as many participants.
          </div>
          <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.coral, marginBottom: 8 }}>Each added participant buys less precision than the last — but doesn't cost less.</div>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, margin: '0 0 8px' }}>Here is what one participant actually costs:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
              {[
                ['Recruitment', 'advertising, outreach, and screening to find each eligible person'],
                ['Compensation', "payment for participants' time and travel — often the largest line"],
                ['Staff time', 'consent, visits, measurements, and data entry, per person'],
                ['Retention', 'reminders, rescheduling, and follow-up to keep people enrolled'],
                ['Data & monitoring', 'entry, cleaning, and quality checks that scale with n'],
              ].map(([k, v], i) => (
                <div key={i} style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
                  <strong style={{ color: C.text }}>{k}</strong> — {v}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, margin: 0 }}>
              These add up fast — even a modest study can run hundreds to several thousand dollars per participant. At just $1,000 each, the 1,200 extra people to go from n = 400 to n = 1,600 cost about <strong style={{ color: C.text }}>$1.2 million</strong> — to narrow the interval from about 10 to about 5 percentage points. Past "precise enough," that is a lot of money and participant time for a sliver of precision.
            </p>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>The same +100 participants, three different points in recruitment:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { from: 10, label: 'Early in recruitment', color: C.green },
              { from: 400, label: 'Mid-study', color: C.amber },
              { from: 900, label: 'Late in a large study', color: C.muted },
            ].map(row => {
              const wBefore = getCIWidth(row.from)
              const wAfter = getCIWidth(row.from + 100)
              const gain = wBefore - wAfter
              return (
                <div key={row.from} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: row.color, fontWeight: 700, minWidth: 120 }}>n={row.from} → n={row.from+100}</div>
                  <div style={{ fontSize: 12, color: C.dim, flex: 1 }}>{row.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: row.color, fontWeight: 600 }}>CI narrows by {(gain*100).toFixed(2)} pp</div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 10, padding: '10px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            The most powerful investments in precision happen early. This is why sample size planning before data collection matters — adding participants after the fact is costly and rarely efficient.
          </div>
        </div>
      </Section>

      {/* 5. What n cannot buy */}
      <Section icon="!" iconBg={C.coralSoft} title="What Sample Size Cannot Buy">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Increasing n improves precision and power. It cannot fix:</p>
          {[
            { icon: '✗', label: 'A biased sample', desc: 'If your recruitment systematically excludes certain groups, a larger sample gives you more precise estimates of the wrong population.' },
            { icon: '✗', label: 'Poor measurements', desc: 'If blood pressure is measured inconsistently, more participants produce more precise estimates of a noisy, unreliable outcome.' },
            { icon: '✗', label: 'The wrong statistical test', desc: 'Applying a t-test to ordinal data in a large sample still produces the wrong inference — more precisely.' },
            { icon: '✗', label: 'A poorly designed study', desc: 'No amount of statistical power compensates for confounding, lack of a comparison group, or inappropriate follow-up.' },
            { icon: '✗', label: 'Confounding in an observational study', desc: 'A large observational study can give a precise estimate of an association that is entirely explained by a confounder.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ color: C.coral, fontWeight: 700, fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Quick check */}
      <Section icon="▶" iconBg={C.purpleSoft} title="Quick Check">
        <div style={{ paddingTop: 20 }}>
          <QuickCheck />
        </div>
      </Section>

      {/* 7. Capstone summary */}
      <div style={{ marginTop: 24, padding: '20px 22px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 14 }}>What you have learned across this tool suite</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Increasing sample size...</div>
            {['Narrows confidence intervals', 'Increases statistical power', 'Makes estimates more precise', 'Reduces the chance of missing a real effect'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: C.dim, marginBottom: 5 }}>
                <span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>But it does not...</div>
            {['Eliminate bias', 'Guarantee a representative sample', 'Fix poor study design', 'Turn a bad study into a good one', 'Remove the need for careful thinking'].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: C.dim, marginBottom: 5 }}>
                <span style={{ color: C.coral, fontWeight: 700, flexShrink: 0 }}>✗</span>{item}
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.dim, lineHeight: 1.75, fontStyle: 'italic' }}>
          Sample size is a powerful tool — but not a magic one. The most important statistical decisions happen before data collection: choosing the right study design, defining a clear research question, selecting an appropriate outcome measure, and planning for adequate power. Statistics can only work with what the study design makes possible.
        </div>
      </div>
    </div>
  )
}
