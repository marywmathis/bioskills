import { useState } from 'react'
import { C, s, Section } from './utils'

// ── Math ──
function pvErf(x) {
  const sign = x >= 0 ? 1 : -1
  const ax = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * ax)
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  return sign * (1 - poly * Math.exp(-ax * ax))
}
function pvNcdf(z) { return 0.5 * (1 + pvErf(z / Math.sqrt(2))) }
function pvNpdf(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI) }
function twoTailP(z) { return 2 * (1 - pvNcdf(Math.abs(z))) }

// Study parameters (fixed)
const STUDY_SE = 2.5   // standard error of the difference
const NULL_MEAN = 0    // null: no difference

// ── Null distribution with observed statistic ──
function NullDist({ observed, showShade, width = 460 }) {
  const pvW = width, pvH = 180
  const PL = 28, PR = 28, PT = 20, PB = 32
  const plotW = pvW - PL - PR
  const plotH = pvH - PT - PB

  const xMin = -4 * STUDY_SE, xMax = 4 * STUDY_SE
  const peakY = pvNpdf(0) / STUDY_SE
  const toX = v => PL + ((v - xMin) / (xMax - xMin)) * plotW
  const toY = v => PT + plotH - (v / (peakY * 1.15)) * plotH

  const obsAbs = Math.abs(observed)
  const ndPval = twoTailP(observed / STUDY_SE)

  const pts = []
  for (let i = 0; i <= 300; i++) {
    const x = xMin + (i / 300) * (xMax - xMin)
    pts.push([x, pvNpdf(x / STUDY_SE) / STUDY_SE])
  }
  const curvePath = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(' ')

  const rightTail = pts.filter(([x]) => x >= obsAbs)
  const leftTail = pts.filter(([x]) => x <= -obsAbs)

  const shadePath = (seg, fromLeft) => {
    if (seg.length < 2) return ''
    const first = seg[0], last = seg[seg.length - 1]
    return seg.map(([x, y], i) => `${i ? 'L' : 'M'}${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(' ')
      + ` L${toX(last[0]).toFixed(1)},${toY(0).toFixed(1)} L${toX(first[0]).toFixed(1)},${toY(0).toFixed(1)} Z`
  }

  const xTicks = [-3, -2, -1, 0, 1, 2, 3].map(v => v * STUDY_SE)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={pvW} height={pvH} style={{ display: 'block', maxWidth: '100%' }}>
        <rect width={pvW} height={pvH} fill={C.alt} rx={8} />
        <line x1={PL} y1={toY(0)} x2={pvW - PR} y2={toY(0)} stroke={C.border} strokeWidth={1} />
        {xTicks.map((v, i) => (
          <g key={i}>
            <line x1={toX(v)} y1={toY(0)} x2={toX(v)} y2={toY(0) + 4} stroke={C.muted} strokeWidth={1} />
            <text x={toX(v)} y={pvH - PB + 16} textAnchor="middle" fontSize={9} fill={C.muted}>{v.toFixed(0)}</text>
          </g>
        ))}
        <text x={pvW / 2} y={pvH - 4} textAnchor="middle" fontSize={9} fill={C.muted}>Difference in means (mmHg) — assuming no true effect</text>

        {showShade && rightTail.length > 1 && (
          <path d={shadePath(rightTail)} fill={C.coral} fillOpacity={0.45} />
        )}
        {showShade && leftTail.length > 1 && (
          <path d={shadePath(leftTail)} fill={C.coral} fillOpacity={0.45} />
        )}

        <path d={curvePath} fill="none" stroke={C.purple} strokeWidth={2.5} />

        {observed !== 0 && (
          <>
            <line x1={toX(observed)} y1={PT} x2={toX(observed)} y2={toY(0)} stroke={C.teal} strokeWidth={2.5} strokeDasharray="5 3" />
            <text x={toX(observed) + (toX(observed) > pvW / 2 ? -5 : 5)} y={PT + 12} textAnchor={toX(observed) > pvW / 2 ? 'end' : 'start'} fontSize={10} fill={C.teal} fontWeight="700">Observed: {observed > 0 ? '+' : ''}{observed.toFixed(1)} mmHg</text>
            {showShade && observed !== 0 && (
              <>
                <line x1={toX(-observed)} y1={PT} x2={toX(-observed)} y2={toY(0)} stroke={C.coral} strokeWidth={1.5} strokeDasharray="3 2" />
              </>
            )}
          </>
        )}

        <text x={toX(0)} y={PT + 12} textAnchor="middle" fontSize={10} fill={C.purple} fontWeight="700">Null: 0</text>
        <line x1={toX(0)} y1={PT + 14} x2={toX(0)} y2={toY(0)} stroke={C.purple} strokeWidth={1} strokeDasharray="3 2" opacity={0.4} />
      </svg>

      {showShade && observed !== 0 && (
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: C.dim, flexWrap: 'wrap' }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: C.coral, opacity: 0.6, verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }} />Shaded area = p-value = <strong style={{ color: C.coral }}>{ndPval < 0.001 ? '<0.001' : ndPval.toFixed(3)}</strong></span>
          <span style={{ color: C.muted }}>Both tails shown (two-sided test)</span>
        </div>
      )}
    </div>
  )
}

// ── Misconception quiz ──
function MisconceptionQuiz({ question, options, correctIdx, context }) {
  const [picked, setPicked] = useState(null)
  const answered = picked !== null

  return (
    <div style={{ marginBottom: 20, padding: '16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10 }}>
      <div style={{ fontSize: 13, color: C.dim, fontStyle: 'italic', marginBottom: 10, lineHeight: 1.6 }}>{context}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>{question}</div>
      {options.map((opt, i) => {
        const isPicked = picked === i
        const isCorrect = i === correctIdx
        let bg = C.surface, border = C.border, color = C.dim
        if (answered) {
          if (isCorrect) { bg = C.greenSoft; border = C.green; color = C.green }
          else if (isPicked) { bg = C.coralSoft; border = C.coral; color = C.coral }
        }
        return (
          <div key={i}>
            <button onClick={() => !answered && setPicked(i)} disabled={answered}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 13px', marginBottom: 6, background: bg, border: `1px solid ${border}`, borderRadius: 7, color, fontSize: 13, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', lineHeight: 1.5 }}>
              {isCorrect && answered && <span style={{ color: C.green, marginRight: 6 }}>✓</span>}
              {isPicked && !isCorrect && answered && <span style={{ color: C.coral, marginRight: 6 }}>✗</span>}
              {opt.label}
            </button>
            {answered && (isPicked || isCorrect) && (
              <div style={{ padding: '9px 13px', background: isCorrect ? C.tealSoft : C.coralSoft, border: `1px solid ${isCorrect ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 7, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>
                <strong style={{ color: isCorrect ? C.teal : C.coral }}>{isCorrect ? 'Correct.' : 'Not quite.'}</strong> {opt.feedback}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main ──
export default function PValueExplorer() {
  const [stage, setStage] = useState(0) // 0=intro, 1=null, 2=observed, 3=shade, 4=slider
  const [sliderObs, setSliderObs] = useState(6)
  const pval = twoTailP(sliderObs / STUDY_SE)

  const stageObs = stage >= 2 ? 6 : 0
  const stageShade = stage >= 3

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>P-Value Explorer</div>
      <div style={s.pageSub}>
        A p-value answers one question: if the null hypothesis were true, how unusual would our results be? Build that understanding step by step before touching a number.
      </div>

      {/* 1. The setup */}
      <Section icon="1" iconBg={C.tealSoft} title="The Study" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Researchers test whether a new hypertension program reduces blood pressure. Two groups of adults are enrolled:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Treatment group</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: C.green }}>128 mmHg</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Mean systolic BP</div>
            </div>
            <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Control group</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: C.coral }}>134 mmHg</div>
              <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Mean systolic BP</div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, fontSize: 14, color: C.text, fontWeight: 600, textAlign: 'center', marginBottom: 14 }}>
            Observed difference: 134 − 128 = <span style={{ color: C.amber }}>6 mmHg</span>
          </div>
          <div style={{ padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.text }}>The key question:</strong> Could this 6 mmHg difference have happened by random chance, even if the program truly had no effect? Or is a difference this large unlikely enough that we should doubt the null hypothesis?
          </div>
        </div>
      </Section>

      {/* 2. Build the picture step by step */}
      <Section icon="2" iconBg={C.purpleSoft} title="Build the Picture — Step by Step" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { n: 0, label: 'Start' },
              { n: 1, label: 'Step 1: Null hypothesis' },
              { n: 2, label: 'Step 2: Mark the observation' },
              { n: 3, label: 'Step 3: Shade the p-value' },
            ].map(btn => (
              <button key={btn.n} onClick={() => setStage(btn.n)}
                style={{ padding: '7px 12px', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600, background: stage === btn.n ? C.purple : C.surface, color: stage === btn.n ? '#fff' : C.dim, border: `1px solid ${stage === btn.n ? C.purple : C.border}`, transition: 'all 0.15s' }}>
                {btn.label}
              </button>
            ))}
          </div>

          <NullDist observed={stageObs} showShade={stageShade} />

          {/* Stage explanations */}
          {stage === 0 && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              Click "Step 1: Null hypothesis" to begin building the picture.
            </div>
          )}
          {stage === 1 && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              <strong style={{ color: C.purple }}>The null hypothesis:</strong> The program has no effect. Any difference between groups is due to random sampling variation. If this were true, repeated studies would produce differences that follow this bell-shaped distribution — centered at zero, because we're assuming no true effect.
            </div>
          )}
          {stage === 2 && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              <strong style={{ color: C.teal }}>Our observed result:</strong> We found a 6 mmHg difference. That's marked on the distribution. The question is: how far out in the tail is this result? If it's near the center, differences this large happen often by chance. If it's far in the tail, it's unusual.
            </div>
          )}
          {stage === 3 && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
              <strong style={{ color: C.coral }}>The shaded area is the p-value.</strong> It represents the probability of seeing a difference at least this far from zero — 6 mmHg or more, in either direction — if the null hypothesis were true. The smaller this area, the more unusual our result, and the stronger the evidence against H₀. We shade both tails because "at least this far from zero" counts results that are extreme in either direction (a two-sided test).
            </div>
          )}
        </div>
      </Section>

      {/* 3. Interactive slider */}
      <Section icon="3" iconBg={C.amberSoft} title="Watch the P-Value Change" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Drag the observed difference. As it moves farther from zero, the shaded tail shrinks and the p-value decreases — the evidence against H₀ gets stronger.</p>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
              <span>Observed difference</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: C.teal }}>{sliderObs > 0 ? '+' : ''}{sliderObs.toFixed(1)} mmHg</span>
            </div>
            <input type="range" min={0} max={9.9} step={0.1} value={sliderObs} onChange={e => setSliderObs(parseFloat(e.target.value))} style={{ width: '100%', accentColor: C.teal }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginTop: 2 }}>
              <span>0 mmHg (no difference)</span><span>±10 mmHg (large difference)</span>
            </div>
          </div>

          <NullDist observed={sliderObs} showShade={true} />

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ padding: '10px 12px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.teal, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Observed difference</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: C.teal }}>{sliderObs.toFixed(1)} mmHg</div>
            </div>
            <div style={{ padding: '10px 12px', background: pval < 0.05 ? C.greenSoft : C.coralSoft, border: `1px solid ${pval < 0.05 ? 'rgba(26,122,62,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: pval < 0.05 ? C.green : C.coral, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>P-value</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: pval < 0.05 ? C.green : C.coral }}>{pval < 0.001 ? '<0.001' : pval.toFixed(3)}</div>
            </div>
            <div style={{ padding: '10px 12px', background: pval < 0.05 ? C.greenSoft : C.alt, border: `1px solid ${pval < 0.05 ? 'rgba(26,122,62,0.2)' : C.border}`, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: pval < 0.05 ? C.green : C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Decision (α=0.05)</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: pval < 0.05 ? C.green : C.muted }}>{pval < 0.05 ? 'Reject H₀' : 'Fail to reject H₀'}</div>
            </div>
          </div>

          <div style={{ marginTop: 12, padding: '10px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            {sliderObs <= 2 && 'A small observed difference falls near the center of the null distribution. Results this size are common by chance — the p-value is large, and there is little evidence against H₀.'}
            {sliderObs > 2 && sliderObs <= 5 && 'The observed difference is moving into the tail. Getting less common by chance — the p-value is shrinking, and the evidence against H₀ is building.'}
            {sliderObs > 5 && sliderObs < 7.5 && `A ${sliderObs.toFixed(1)} mmHg difference would be unusual if there were truly no effect. The shaded tail is small — strong evidence against H₀.`}
            {sliderObs >= 7.5 && 'A very large observed difference — extremely unusual under the null hypothesis. The p-value is very small, meaning this result is highly unlikely to have occurred by chance alone if H₀ were true.'}
          </div>
        </div>
      </Section>

      {/* 4. Large vs small p */}
      <Section icon="4" iconBg={C.tealSoft} title="What a P-Value Actually Tells You">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>A p-value measures evidence — not truth. It never tells you whether H₀ is true.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Large p-value (e.g., p = 0.42)</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>The observed result is fairly common if H₀ is true.</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>↓</div>
              <div style={{ fontSize: 13, color: C.coral, fontWeight: 600 }}>Little evidence against H₀.</div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.dim, fontStyle: 'italic' }}>Does NOT prove the treatment has no effect — only that this data is insufficient to rule out chance.</div>
            </div>
            <div style={{ padding: '14px 16px', background: C.greenSoft, border: `1px solid rgba(26,122,62,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Small p-value (e.g., p = 0.02)</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>The observed result would be unusual if H₀ is true.</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>↓</div>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Stronger evidence against H₀.</div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.dim, fontStyle: 'italic' }}>Does NOT prove the treatment works — only that the data are difficult to explain if there is truly no effect.</div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.25)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
            <strong style={{ color: C.amber }}>The threshold (α = 0.05):</strong> By convention, a p-value below 0.05 is called "statistically significant." This means the result would occur less than 5% of the time by chance under H₀. It is a decision rule, not a measure of importance or truth.
          </div>
        </div>
      </Section>

      {/* 5. Misconceptions */}
      <Section icon="!" iconBg={C.coralSoft} title="Common Misconceptions — Test Yourself">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Select the interpretation you think is correct. Per-option feedback explains why each answer is right or wrong.</p>

          <MisconceptionQuiz
            context="A study comparing two blood pressure treatments reports p = 0.03."
            question="What does p = 0.03 mean?"
            correctIdx={2}
            options={[
              {
                label: 'There is a 3% chance the null hypothesis is true.',
                feedback: 'The p-value does not tell us the probability that H₀ is true. H₀ is assumed to be true when the p-value is calculated — you cannot use the p-value to determine the probability of that assumption.',
              },
              {
                label: 'There is a 3% chance the results occurred by random chance.',
                feedback: 'Close, but not quite. The p-value is not the probability that chance caused the results. It is the probability of observing results this extreme or more extreme if H₀ were true. The distinction matters: H₀ being true is a conditional assumption, not a statement about your particular study.',
              },
              {
                label: 'If the null hypothesis were true, there would be a 3% chance of observing results this extreme or more extreme.',
                feedback: 'This is the correct definition. The p-value is a conditional probability — it describes how often results like yours would occur in a world where H₀ is true. A small p-value means your results are unusual under that assumption.',
              },
              {
                label: 'The treatment reduces blood pressure by a clinically important amount.',
                feedback: 'Statistical significance (p < 0.05) tells you the result is unlikely under H₀ — it says nothing about the size of the effect or whether it matters clinically. A highly significant result can reflect a trivially small difference if the sample is large enough.',
              },
            ]}
          />

          <MisconceptionQuiz
            context="A study comparing two interventions reports p = 0.22."
            question="What does p = 0.22 mean?"
            correctIdx={1}
            options={[
              {
                label: 'The treatment has no effect.',
                feedback: 'A non-significant result does not prove the null hypothesis is true. It means the data are insufficient to rule out chance — not that chance is the explanation. The study may simply have been underpowered.',
              },
              {
                label: 'The observed results are not unusual enough to rule out chance under the null hypothesis.',
                feedback: "Correct. p = 0.22 means that results this extreme would occur 22% of the time by chance if H₀ were true. That's fairly common — so we don't have strong evidence against H₀. But that doesn't mean H₀ is true.",
              },
              {
                label: 'There is a 22% chance the treatment works.',
                feedback: "The p-value is not the probability that the treatment works. It's the probability of observing results this extreme under H₀. These are completely different questions.",
              },
              {
                label: 'The study was poorly designed.',
                feedback: 'A non-significant result may reflect low power, a small true effect, high variability, or chance — not necessarily poor design. You cannot infer study quality from a p-value.',
              },
            ]}
          />

          <MisconceptionQuiz
            context="A very large study (n = 50,000) reports p = 0.00001 for a 0.5 mmHg difference in blood pressure."
            question="What is the most important limitation of this finding?"
            correctIdx={2}
            options={[
              {
                label: 'The p-value is too small to be believable.',
                feedback: 'Very small p-values are entirely possible with large samples. There is no lower limit on p-values. The issue here is not the p-value itself.',
              },
              {
                label: 'The result must be due to a Type I error.',
                feedback: 'A Type I error is possible but not likely at p = 0.00001. The issue is not the reliability of the significance test — it is what the significant result actually means.',
              },
              {
                label: 'Statistical significance does not mean clinical importance. A 0.5 mmHg difference is almost certainly too small to matter clinically.',
                feedback: 'Correct. Large samples can detect very small effects with extremely small p-values — but a 0.5 mmHg reduction in blood pressure is not clinically meaningful. Statistical significance tells you the effect is real, not that it matters. This is why confidence intervals and effect sizes are essential companions to p-values.',
              },
              {
                label: 'The study should have used a smaller sample.',
                feedback: "Large samples are not a design flaw. The issue is interpretation — a significant result in a large study may reflect a real but trivially small effect. The solution is to report the effect size and confidence interval alongside the p-value, not to reduce the sample.",
              },
            ]}
          />
        </div>
      </Section>

      {/* 6. Bridge to CI */}
      <Section icon="↔" iconBg={C.purpleSoft} title="P-Values and Confidence Intervals — Two Views of the Same Data">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>The same data produce both a p-value and a confidence interval. They answer different questions.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Confidence interval</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.purple, marginBottom: 8 }}>e.g., (1.2 mmHg, 10.8 mmHg)</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>Answers: <strong style={{ color: C.text }}>How large might the effect be?</strong> Gives a range of plausible values for the true difference.</div>
            </div>
            <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>P-value</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: C.coral, marginBottom: 8 }}>e.g., p = 0.017</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>Answers: <strong style={{ color: C.text }}>How surprising are these data if there is no effect?</strong> Measures compatibility with the null hypothesis.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[
              { check: true, text: 'Both use the same sample data and the same standard error.' },
              { check: true, text: 'If the 95% CI excludes zero, the p-value will be below 0.05 (for a two-sided test).' },
              { check: true, text: 'The CI tells you the size and direction of the effect. The p-value tells you how compatible the data are with no effect.' },
              { check: false, text: 'Neither proves causation, determines clinical importance, or reveals whether H₀ is actually true.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
                <span style={{ color: item.check ? C.teal : C.amber, fontWeight: 700, flexShrink: 0 }}>{item.check ? '✓' : '⚠'}</span>
                {item.text}
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.75, fontStyle: 'italic' }}>
            In published research, report both. The p-value tells readers whether to take the finding seriously. The confidence interval tells them how large the effect might be and how precisely it was estimated.
          </div>
        </div>
      </Section>
    </div>
  )
}
