import { useState } from 'react'
import { C, s, Section, Concept, Quiz } from './utils'

const BASE_DATA = [2, 2, 3, 3, 4, 4, 5, 6, 7]
const OUTLIER = 45

function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length }
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}
function sd(arr) {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1))
}
function iqr(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)))
  const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)))
  return q3 - q1
}

function DotPlot({ data, meanVal, medianVal }) {
  const plotW = 520
  const plotH = 110
  const PAD = 40
  const innerW = plotW - PAD * 2

  const allVals = [...data]
  const dataMax = Math.max(...allVals)
  const axisMax = dataMax <= 10 ? 12 : dataMax + 3
  const axisMin = 0

  const toX = v => PAD + ((v - axisMin) / (axisMax - axisMin)) * innerW

  // Jitter dots vertically
  const DOT_R = 6
  const positions = []
  const sortedData = [...data].sort((a, b) => a - b)
  sortedData.forEach(v => {
    const x = toX(v)
    let row = 0
    while (positions.filter(p => p.row === row).some(p => Math.abs(p.x - x) < DOT_R * 2.2)) row++
    positions.push({ x, row, v })
  })
  const baseY = plotH - 28

  // Axis ticks
  const tickStep = axisMax <= 12 ? 2 : axisMax <= 20 ? 5 : 10
  const ticks = []
  for (let v = 0; v <= axisMax; v += tickStep) ticks.push(v)

  const meanX = toX(meanVal)
  const medX = toX(medianVal)

  return (
    <svg width={plotW} height={plotH} style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}>
      <rect x={0} y={0} width={plotW} height={plotH - 24} fill={C.surface} rx={8} />

      {/* Dots */}
      {positions.map((p, i) => {
        const isOutlier = p.v === OUTLIER
        const y = baseY - p.row * (DOT_R * 2.2) - DOT_R
        return (
          <circle key={i} cx={p.x} cy={Math.max(DOT_R + 4, y)} r={DOT_R}
            fill={isOutlier ? C.coral : C.teal}
            fillOpacity={isOutlier ? 0.9 : 0.7}
            stroke={isOutlier ? C.coral : C.teal}
            strokeWidth={1}
          />
        )
      })}

      {/* Mean line */}
      <line x1={meanX} y1={6} x2={meanX} y2={plotH - 26}
        stroke={C.teal} strokeWidth={2.5}
        style={{ transition: 'x1 0.5s ease, x2 0.5s ease' }}
      />
      <text x={meanX} y={4} textAnchor="middle" fontSize={10} fill={C.teal} fontWeight="700">Mean</text>

      {/* Median line */}
      <line x1={medX} y1={6} x2={medX} y2={plotH - 26}
        stroke={C.green} strokeWidth={2.5} strokeDasharray="5 3"
      />
      <text x={medX} y={plotH - 14} textAnchor="middle" fontSize={10} fill={C.green} fontWeight="700">Median</text>

      {/* Axis */}
      <line x1={PAD} y1={plotH - 26} x2={plotW - PAD} y2={plotH - 26} stroke={C.border} strokeWidth={1.5} />
      {ticks.map(v => (
        <g key={v}>
          <line x1={toX(v)} y1={plotH - 26} x2={toX(v)} y2={plotH - 20} stroke={C.muted} strokeWidth={1} />
          <text x={toX(v)} y={plotH - 8} textAnchor="middle" fontSize={10} fill={C.muted}>{v}</text>
        </g>
      ))}

      {/* Axis label */}
      <text x={plotW / 2} y={plotH} textAnchor="middle" fontSize={10} fill={C.muted}>Days</text>
    </svg>
  )
}

function Simulator() {
  const [hasOutlier, setHasOutlier] = useState(false)
  const [reportChoice, setReportChoice] = useState(null)

  const data = hasOutlier ? [...BASE_DATA, OUTLIER] : BASE_DATA
  const m = +mean(data).toFixed(1)
  const med = +median(data).toFixed(1)
  const s2 = +sd(data).toFixed(1)
  const i = +iqr(data).toFixed(1)

  const diff = Math.abs(m - med)
  const gap = +diff.toFixed(1)
  const isSkewed = gap > 0.5
  const reportDone = reportChoice !== null

  return (
    <div>
      {/* Dataset display */}
      <div style={{ background: C.alt, borderRadius: 10, padding: '12px 16px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Hospital length of stay (days) — {data.length} patients
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[...data].sort((a, b) => a - b).map((v, i) => (
            <span key={i} style={{
              padding: '3px 10px', borderRadius: 5, fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              background: v === OUTLIER ? C.coralSoft : C.surface,
              color: v === OUTLIER ? C.coral : C.teal,
              border: `1px solid ${v === OUTLIER ? C.coral : C.border}`
            }}>{v}</span>
          ))}
        </div>
      </div>

      {/* Outlier toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => { setHasOutlier(o => !o); setReportChoice(null) }}
          style={{
            padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            background: hasOutlier ? C.coralSoft : C.surface,
            color: hasOutlier ? C.coral : C.dim,
            border: `1px solid ${hasOutlier ? C.coral : C.border}`,
          }}
        >
          {hasOutlier ? '✕ Remove 45-day stay' : '+ Add 45-day stay'}
        </button>
        {hasOutlier && (
          <span style={{ fontSize: 12, color: C.coral, fontStyle: 'italic' }}>
            One patient stayed 45 days — much longer than the others.
          </span>
        )}
      </div>

      {/* Dot plot */}
      <div style={{ background: C.alt, borderRadius: 10, padding: '12px', marginBottom: 14, border: `1px solid ${C.border}`, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 11, fontWeight: 600 }}>
          <span style={{ color: C.teal }}>— Mean</span>
          <span style={{ color: C.green }}>- - Median</span>
          {hasOutlier && <span style={{ color: C.coral }}>● Outlier</span>}
        </div>
        <DotPlot data={data} meanVal={m} medianVal={med} />
      </div>

      {/* Stats panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Mean', value: m, color: C.teal, note: 'Center' },
          { label: 'Median', value: med, color: C.green, note: 'Center' },
          { label: 'SD', value: s2, color: C.teal, note: 'Spread', faded: true },
          { label: 'IQR', value: i, color: C.green, note: 'Spread', faded: true },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '10px 12px', borderRadius: 8, textAlign: 'center',
            background: stat.faded ? C.alt : (stat.color === C.teal ? C.tealSoft : C.greenSoft),
            border: `1px solid ${stat.faded ? C.border : (stat.color === C.teal ? 'rgba(0,153,168,0.2)' : 'rgba(26,122,62,0.2)')}`,
            transition: 'all 0.3s',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: stat.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace", transition: 'all 0.3s' }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{stat.note}</div>
          </div>
        ))}
      </div>

      {/* Shape recommendation */}
      <div style={{
        padding: '10px 14px', borderRadius: 8, marginBottom: 16,
        background: isSkewed ? C.amberSoft : C.tealSoft,
        border: `1px solid ${isSkewed ? 'rgba(184,112,0,0.2)' : 'rgba(0,153,168,0.2)'}`,
        fontSize: 13, color: C.dim, lineHeight: 1.6, transition: 'all 0.3s',
      }}>
        <strong style={{ color: isSkewed ? C.amber : C.teal }}>
          {isSkewed
            ? 'Mean and median differ.'
            : (gap === 0 ? 'Mean and median are equal here.' : 'Mean and median are close.')}
        </strong>
        {' '}
        {isSkewed
          ? `Mean is ${m} days, median is ${med} — a gap of ${gap} days. That gap points to skew or influential outliers, so the distribution is not roughly symmetric. Median + IQR is the safer summary.`
          : (gap === 0
              ? `Both land at ${m} days. That points to a roughly symmetric distribution, so mean + SD works. They don't need to be exactly equal, though — within about half a day is close enough.`
              : `Mean is ${m} days, median is ${med} — within half a day of each other. Close enough to treat the shape as roughly symmetric, so mean + SD works. They don't need to match exactly.`)}
        <div style={{ marginTop: 6, fontWeight: 600, color: isSkewed ? C.amber : C.teal }}>
          Recommended: {isSkewed ? 'Median + IQR' : 'Mean + SD'}
        </div>
      </div>

      {/* Which would you report challenge — only after outlier added */}
      {hasOutlier && (
        <div style={{ padding: '16px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Which would you report?
          </div>
          <div style={{ fontSize: 14, color: C.text, marginBottom: 12, lineHeight: 1.6 }}>
            You need to summarize typical hospital length of stay for a clinical report. Mean = {m} days, Median = {med} days. Which do you report?
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {[
              { label: `Mean (${m} days)`, val: 'mean' },
              { label: `Median (${med} days)`, val: 'median' },
            ].map(opt => {
              const isCorrect = opt.val === 'median'
              let bg = C.surface, border = C.border, color = C.dim
              if (reportDone) {
                if (opt.val === reportChoice && isCorrect) { bg = C.greenSoft; border = C.green; color = C.green }
                else if (opt.val === reportChoice && !isCorrect) { bg = C.coralSoft; border = C.coral; color = C.coral }
                else if (isCorrect) { bg = C.greenSoft; border = C.green; color = C.green }
              }
              return (
                <button key={opt.val}
                  onClick={() => !reportDone && setReportChoice(opt.val)}
                  disabled={reportDone}
                  style={{ flex: 1, padding: '10px 0', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, fontWeight: 600, cursor: reportDone ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          {reportDone && (
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, padding: '10px 12px', background: reportChoice === 'median' ? C.tealSoft : C.coralSoft, borderRadius: 7, border: `1px solid ${reportChoice === 'median' ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}` }}>
              {reportChoice === 'median'
                ? <><strong style={{ color: C.teal }}>Correct.</strong> The 45-day outlier pulled the mean to {m} days — far above the {med}-day median. Most patients stayed {med} days or fewer, so the median better represents the typical patient. The mean describes what you get if you spread the total days evenly across all patients, which isn't a useful clinical picture here.</>
                : <><strong style={{ color: C.coral }}>The median is better here.</strong> The 45-day outlier dragged the mean up to {m} days, but {BASE_DATA.length} of {data.length} patients stayed {Math.max(...BASE_DATA)} days or fewer. The mean of {m} days overstates the typical stay. When a distribution is right-skewed like this, the median is more representative of the typical value.</>
              }
            </div>
          )}
          {reportDone && (
            <button onClick={() => setReportChoice(null)} style={{ marginTop: 8, width: '100%', padding: '8px 0', background: 'none', border: `1px solid rgba(0,153,168,0.3)`, borderRadius: 7, color: C.teal, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Try again
            </button>
          )}
          {reportDone && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>What would happen if we skipped description?</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>
                <div style={{ marginBottom: 6 }}><strong style={{ color: C.text }}>Reported result:</strong> Average hospital stay = {mean([...BASE_DATA, OUTLIER]).toFixed(1)} days</div>
                <div style={{ marginBottom: 6 }}><strong style={{ color: C.text }}>Reality:</strong> {BASE_DATA.length} of {BASE_DATA.length + 1} patients stayed {Math.max(...BASE_DATA)} days or fewer. One extreme stay pulled the mean upward.</div>
                <div style={{ fontStyle: 'italic', color: C.purple }}>The summary statistics revealed a story the average alone would miss.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SummaryStatistics() {
  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Summary Statistics Explorer</div>
      <div style={s.pageSub}>
        The choice of summary statistic is not arbitrary — it depends on your variable type and the shape of your data. This tool builds the habit of describing data before testing it.
      </div>

      {/* 1. Describe before you test */}
      <Section icon="↓" iconBg={C.tealSoft} title="Describe Before You Test" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            Most students jump straight from data to hypothesis test. That skips the most important step: understanding what you actually have.
          </p>
          {/* Workflow visual */}
          <div style={{ margin: '16px 0' }}>
            {[
              { step: '1', label: 'Describe', sub: 'Mean, median, SD, IQR, counts', color: C.teal, bg: C.tealSoft, border: 'rgba(0,153,168,0.2)' },
              { step: '2', label: 'Visualize', sub: 'Histogram, boxplot, bar chart', color: C.purple, bg: C.purpleSoft, border: 'rgba(107,63,204,0.2)' },
              { step: '3', label: 'Understand your data', sub: "Shape, outliers, what's missing", color: C.green, bg: C.greenSoft, border: 'rgba(26,122,62,0.2)' },
              { step: '4', label: 'Ask a research question', sub: 'Is there a difference? An association?', color: C.amber, bg: C.amberSoft, border: 'rgba(184,112,0,0.2)' },
              { step: '5', label: 'Choose a test', sub: 't-test, chi-square, Mann-Whitney...', color: C.coral, bg: C.coralSoft, border: 'rgba(232,69,42,0.2)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {i > 0 && <div style={{ fontSize: 18, color: C.muted, margin: '2px 0' }}>↓</div>}
                <div style={{ width: '100%', maxWidth: 420, background: item.bg, border: `1px solid ${item.border}`, borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: item.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{item.step}</div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: item.color }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>{item.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>If you skip summary statistics, you may:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                'Miss extreme outliers that distort your results',
                'Choose the wrong statistical test for your data',
                'Report a misleading average that hides the real story',
                'Draw the wrong conclusion from your analysis',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: C.dim, lineHeight: 1.5 }}>
                  <span style={{ color: C.coral, fontWeight: 700, flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: C.coral }}>
              Statistical tests answer questions about data. Summary statistics help you understand what data you actually have.
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Simulator */}
      <Section icon="~" iconBg={C.tealSoft} title="Mean vs. Median: Watch What Happens" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <div style={{ padding: '14px 16px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Imagine a researcher reports:</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 }}>Average hospital stay = 8.1 days</div>
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>
              That sounds like patients typically stay about a week. But what if most patients stayed 3–4 days and one patient stayed 45 days? Without looking at the distribution, you would never know the average is hiding that story.
            </div>
          </div>
          <p style={s.prose}>
            Below is the actual dataset. The mean and median start close together — the distribution is fairly symmetric. Add the 45-day patient and watch what happens.
          </p>
          <Simulator />
        </div>
      </Section>

      {/* 3. Variable type → summary */}
      <Section icon="≡" iconBg={C.amberSoft} title="Variable Type → Summary Statistic">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>
            Tool 3 showed you which summary statistic goes with each variable type. Now there's one refinement: for continuous variables, distribution shape determines whether you use mean/SD or median/IQR.
          </p>
          <div style={{ borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', background: C.alt, padding: '10px 14px', fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Variable type</span><span>Condition</span><span>Use</span>
            </div>
            {[
              { type: 'Continuous', condition: 'Roughly symmetric', use: 'Mean + SD', typeColor: C.teal, useColor: C.teal },
              { type: 'Continuous', condition: 'Skewed or outliers', use: 'Median + IQR', typeColor: C.teal, useColor: C.green },
              { type: 'Ordinal', condition: 'Always', use: 'Median + IQR', typeColor: C.purple, useColor: C.green },
              { type: 'Categorical', condition: 'Always', use: 'Counts + %', typeColor: C.amber, useColor: C.amber },
              { type: 'Dichotomous', condition: 'Always', use: 'Proportion (%)', typeColor: C.coral, useColor: C.coral },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', padding: '10px 14px', borderTop: `1px solid ${C.border}`, fontSize: 13, background: i % 2 === 0 ? C.surface : C.alt, alignItems: 'center' }}>
                <span style={{ color: row.typeColor, fontWeight: 700 }}>{row.type}</span>
                <span style={{ color: C.dim }}>{row.condition}</span>
                <span style={{ color: row.useColor, fontWeight: 600 }}>{row.use}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', padding: '8px 12px', background: C.alt, borderRadius: 6 }}>
            Quick rule: If mean ≈ median, use mean + SD. If mean and median differ noticeably, use median + IQR.
          </div>
        </div>
      </Section>

      {/* 4. Quick checks */}
      <Section icon="?" iconBg={C.purpleSoft} title="Quick Checks">
        <div style={{ paddingTop: 8 }}>
          <Quiz
            q="A dataset of emergency department wait times has mean = 82 minutes and median = 41 minutes. What does this suggest?"
            options={[
              "The data are roughly symmetric — mean and median are both valid",
              "The distribution is likely right-skewed — a few very long waits are pulling the mean up",
              "The median must be wrong — it should be closer to the mean",
              "Both statistics are equally good summaries of this data"
            ]}
            answer={1}
            explain="When mean > median by this margin, it strongly suggests right skew — a few patients waited extremely long, pulling the mean up while the median stayed near the typical wait time. Report median + IQR here."
            wrongExplain={{
              0: "When mean and median differ by 41 minutes, the distribution is not symmetric. If it were, they'd be nearly equal.",
              2: "The median is correct — it's the middle value of the sorted data. The mean is being pulled up by outliers (very long waits), not the other way around.",
              3: "They're not equally good here. The median (41 min) better represents the typical patient's experience. The mean (82 min) is inflated by a small number of extremely long waits."
            }}
          />
          <Quiz
            q="Dataset A: Mean = 5.1, Median = 5.0. Dataset B: Mean = 12.0, Median = 4.0. Which dataset is more likely affected by outliers?"
            options={[
              "Dataset A — the mean and median are suspiciously close",
              "Dataset B — the large gap between mean and median signals influential values",
              "Both equally — you can't tell without seeing the raw data",
              "Neither — outliers only affect the median"
            ]}
            answer={1}
            explain="Dataset B's mean (12.0) is three times its median (4.0) — a classic sign of right skew or influential outliers pulling the mean upward. Dataset A's near-identical mean and median suggest a symmetric distribution with no extreme values."
            wrongExplain={{
              0: "A close mean and median is actually a good sign — it suggests a symmetric distribution without outliers dragging either statistic.",
              2: "You can tell a lot from mean vs. median alone. When they're close (Dataset A), the distribution is likely symmetric. When they diverge dramatically (Dataset B), outliers or skew are likely.",
              3: "Outliers have the opposite effect — they pull the mean strongly but barely move the median. That's exactly what you're seeing in Dataset B."
            }}
          />
          <Quiz
            q="A researcher reports only the mean for a dataset of household income. Income data are typically right-skewed. What's the problem?"
            options={[
              "The mean is always appropriate for continuous variables",
              "The mean is inflated by high earners and overstates what most people earn",
              "Income should be summarized with a proportion, not a mean",
              "There is no problem — the mean is the standard summary for any numeric variable"
            ]}
            answer={1}
            explain="Income is famously right-skewed — a small number of very high earners pull the mean well above what most people earn. The median household income is almost always lower than the mean, and better represents the typical household. This is why income statistics almost always report median, not mean."
            wrongExplain={{
              0: "Variable type alone doesn't determine the right summary — distribution shape matters too. For skewed continuous data, median + IQR is usually more appropriate.",
              2: "Income is a continuous variable, not categorical. Proportions are for categorical and dichotomous variables.",
              3: "For symmetric distributions, yes. For skewed distributions like income, the mean is misleading because a few extreme values drag it away from the center of the distribution."
            }}
          />
        </div>
      </Section>
    </div>
  )
}
