import { useState, useCallback } from 'react'
import { C, s, Section, Concept, Quiz } from './utils'

// ── Math helpers ──
function factLn(n) {
  if (n <= 1) return 0
  let r = 0; for (let i = 2; i <= n; i++) r += Math.log(i); return r
}
function binomProb(n, k, p) {
  if (k < 0 || k > n) return 0
  return Math.exp(factLn(n) - factLn(k) - factLn(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p))
}
function poissonProb(lam, k) {
  if (k < 0) return 0
  return Math.exp(-lam + k * Math.log(lam) - factLn(k))
}
function npdf(x, mu, sigma) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
}
function ncdf(x, mu, sigma) {
  const z = (x - mu) / (sigma * Math.sqrt(2))
  const t = 1 / (1 + 0.3275911 * Math.abs(z))
  const erf = 1 - t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-z * z)
  return 0.5 * (1 + (z >= 0 ? erf : -erf))
}

// ── Shared slider ──
function Slider({ label, value, min, max, step, onChange, fmt }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.dim, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: C.teal, cursor: 'pointer' }} />
    </div>
  )
}

// ── SVG bar chart (Binomial / Poisson) ──
function BarChart({ data, color, xLabel }) {
  const W = 520, H = 160, PAD = { l: 36, r: 10, t: 16, b: 32 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const maxP = Math.max(...data.map(d => d.p), 0.001)
  const barW = Math.max(2, innerW / data.length - 2)

  return (
    <svg width={W} height={H} style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}>
      {/* Y axis */}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke={C.border} strokeWidth={1} />
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const v = maxP * f
        const y = H - PAD.b - f * innerH
        return (
          <g key={f}>
            <line x1={PAD.l - 3} y1={y} x2={PAD.l} y2={y} stroke={C.muted} strokeWidth={1} />
            <text x={PAD.l - 5} y={y + 3} textAnchor="end" fontSize={9} fill={C.muted}>{v.toFixed(2)}</text>
          </g>
        )
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const bh = (d.p / maxP) * innerH
        const x = PAD.l + (i / data.length) * innerW + (innerW / data.length - barW) / 2
        const y = H - PAD.b - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} fill={color} fillOpacity={0.75} rx={2} />
            {data.length <= 20 && (
              <text x={x + barW / 2} y={H - PAD.b + 11} textAnchor="middle" fontSize={9} fill={C.muted}>{d.k}</text>
            )}
          </g>
        )
      })}
      {/* X axis */}
      <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke={C.border} strokeWidth={1} />
      <text x={W / 2} y={H - 2} textAnchor="middle" fontSize={10} fill={C.muted}>{xLabel}</text>
    </svg>
  )
}

// ── Normal curve SVG (fixed axis, true height) ──
function NormalCurve({ mu, sigma }) {
  const W = 520, H = 160, PAD = { l: 10, r: 10, t: 20, b: 28 }
  const innerW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const DMIN = 40, DMAX = 200, SIGMA_MIN = 8
  const toX = v => PAD.l + ((v - DMIN) / (DMAX - DMIN)) * innerW
  // Full-scale height is pinned to the tallest allowed curve (the smallest sigma),
  // with headroom, so the frame stays fixed and raising sigma visibly flattens the curve.
  const FULL = (1 / (SIGMA_MIN * Math.sqrt(2 * Math.PI))) / 0.9
  const toY = p => PAD.t + (1 - Math.min(p, FULL) / FULL) * plotH

  const pts = []
  for (let i = 0; i <= 200; i++) {
    const xv = DMIN + (i / 200) * (DMAX - DMIN)
    pts.push({ x: xv, y: npdf(xv, mu, sigma) })
  }
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ')

  const bands = [
    { lo: mu - sigma, hi: mu + sigma, color: C.teal, opacity: 0.25 },
    { lo: mu - 2 * sigma, hi: mu + 2 * sigma, color: C.teal, opacity: 0.15 },
    { lo: mu - 3 * sigma, hi: mu + 3 * sigma, color: C.teal, opacity: 0.08 },
  ]

  // Filled band paths, clamped to the fixed frame
  function bandPath(lo, hi) {
    const clo = Math.max(lo, DMIN), chi = Math.min(hi, DMAX)
    if (chi <= clo) return ''
    const bandPts = pts.filter(p => p.x >= clo && p.x <= chi)
    if (!bandPts.length) return ''
    return [
      `M${toX(clo).toFixed(1)},${toY(0).toFixed(1)}`,
      ...bandPts.map(p => `L${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`),
      `L${toX(chi).toFixed(1)},${toY(0).toFixed(1)}Z`
    ].join(' ')
  }

  const ticks = [40, 60, 80, 100, 120, 140, 160, 180, 200]

  return (
    <svg width={W} height={H} style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}>
      {/* Bands */}
      {[...bands].reverse().map((b, i) => (
        <path key={i} d={bandPath(b.lo, b.hi)} fill={b.color} fillOpacity={b.opacity} />
      ))}
      {/* Curve */}
      <path d={pathD} fill="none" stroke={C.teal} strokeWidth={2.5} />
      {/* Mean line */}
      <line x1={toX(mu)} y1={PAD.t} x2={toX(mu)} y2={H - PAD.b} stroke={C.purple} strokeWidth={1.5} strokeDasharray="4 2" />
      <text x={toX(mu)} y={PAD.t - 4} textAnchor="middle" fontSize={10} fill={C.purple} fontWeight="600">μ</text>
      {/* Fixed axis 40–200 */}
      <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke={C.border} strokeWidth={1.5} />
      {ticks.map((v, i) => (
        <g key={i}>
          <line x1={toX(v)} y1={H - PAD.b} x2={toX(v)} y2={H - PAD.b + 4} stroke={C.muted} strokeWidth={1} />
          <text x={toX(v)} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill={C.muted}>{v}</text>
        </g>
      ))}
    </svg>
  )
}

// ── TABS ──
const TABS = [
  { id: 'normal', label: 'Normal Distribution', color: C.teal },
  { id: 'binomial', label: 'Binomial Distribution', color: C.purple },
  { id: 'poisson', label: 'Poisson Distribution', color: C.coral },
]

function NormalTab() {
  const [mu, setMu] = useState(120)
  const [sigma, setSigma] = useState(15)
  const p68 = ((ncdf(mu + sigma, mu, sigma) - ncdf(mu - sigma, mu, sigma)) * 100).toFixed(1)
  const p95 = ((ncdf(mu + 2 * sigma, mu, sigma) - ncdf(mu - 2 * sigma, mu, sigma)) * 100).toFixed(1)
  const p997 = ((ncdf(mu + 3 * sigma, mu, sigma) - ncdf(mu - 3 * sigma, mu, sigma)) * 100).toFixed(1)

  return (
    <div>
      <div style={{ padding: '14px 16px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>What is the Normal Distribution?</div>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>
          Imagine measuring systolic blood pressure in 10,000 adults. Most people cluster around some middle value — say, 120 mmHg. A few have lower readings, a few have higher readings, and the further you move from the center, the fewer people you find. That pattern — symmetric, bell-shaped, tapering at the tails — is the <strong style={{ color: C.text }}>normal distribution</strong>.
        </p>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>
          The normal distribution is defined by two numbers:
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 3 }}>μ (mu) — the mean</div>
            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>Where the center of the distribution sits. Changing μ slides the whole curve left or right.</div>
          </div>
          <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 3 }}>σ (sigma) — the standard deviation</div>
            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>How spread out values are. A larger σ makes the curve wider and flatter. A smaller σ makes it taller and narrower.</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75 }}>
          <strong style={{ color: C.text }}>Why does it matter beyond the bell shape?</strong> Many statistical tests — t-tests, ANOVA, linear regression — assume data are approximately normally distributed. Even when individual measurements aren't perfectly normal, sample means tend to become approximately normal as sample size grows. That's why so much of statistics works in practice.
        </p>
      </div>

      <div style={{ background: C.alt, borderRadius: 10, padding: '14px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Systolic blood pressure in a population — adjust μ and σ to see what changes
        </div>
        <NormalCurve mu={mu} sigma={sigma} />
        <div style={{ fontSize: 12, color: C.dim, margin: '8px 0 10px', lineHeight: 1.6 }}>
          The shaded bands show what fraction of the population falls within 1, 2, and 3 standard deviations of the mean. This is the <strong style={{ color: C.text }}>68–95–99.7 rule</strong> — a useful shortcut for interpreting any normal distribution.
        </div>
        <div style={{ display: 'flex', gap: 10, margin: '10px 0', flexWrap: 'wrap' }}>
          {[
            { label: '±1σ', pct: p68, desc: 'within 1 SD' },
            { label: '±2σ', pct: p95, desc: 'within 2 SDs' },
            { label: '±3σ', pct: p997, desc: 'within 3 SDs' },
          ].map(b => (
            <div key={b.label} style={{ flex: 1, minWidth: 100, padding: '8px 10px', background: C.tealSoft, border: `1px solid rgba(0,153,168,0.2)`, borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: C.teal, fontWeight: 600, marginBottom: 2 }}>{b.label} ({b.desc})</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}>{b.pct}%</div>
            </div>
          ))}
        </div>
        <Slider label="Mean (μ) — moves the center" value={mu} min={80} max={160} step={1} onChange={setMu} />
        <Slider label="Standard deviation (σ) — controls the spread" value={sigma} min={8} max={40} step={1} onChange={setSigma} />
      </div>

      <div style={{ ...s.example }}>
        <div style={s.exampleLabel}>Reading the result</div>
        With μ = {mu} mmHg and σ = {sigma} mmHg: about 95% of adults in this population have systolic blood pressure between <strong style={{ color: C.text }}>{mu - 2 * sigma}</strong> and <strong style={{ color: C.text }}>{mu + 2 * sigma}</strong> mmHg.
        The remaining 5% fall outside that range. This is why clinical laboratories often flag values beyond ±2 SDs as "abnormal" — not because something is necessarily wrong, but because fewer than 5% of healthy people fall there by chance.
      </div>
    </div>
  )
}

function BinomialTab() {
  const [n, setN] = useState(50)
  const [p, setP] = useState(0.20)
  const mu = (n * p).toFixed(1)
  const sigma = Math.sqrt(n * p * (1 - p)).toFixed(2)

  const data = []
  for (let k = 0; k <= n; k++) {
    const prob = binomProb(n, k, p)
    if (prob > 0.0001 || (k >= Math.floor(n * p) - 3 && k <= Math.ceil(n * p) + 3)) {
      data.push({ k, p: prob })
    }
  }
  const trimmed = data.filter(d => d.p > 0.0005)

  return (
    <div>
      <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>What is the Binomial Distribution?</div>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>
          Imagine enrolling 50 patients in a clinical trial. Each patient either responds to the treatment or they don't. At the end of the study, you count how many responded. That count — out of a fixed number of patients — follows a <strong style={{ color: C.text }}>binomial distribution</strong>.
        </p>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>
          The binomial distribution requires two things to be true:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {[
            { num: '1', text: 'A fixed number of trials (n). You know exactly how many opportunities there are.', color: C.purple },
            { num: '2', text: 'Each trial has exactly two outcomes — success or failure — with the same probability (p) each time.', color: C.purple },
          ].map(item => (
            <div key={item.num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.purple, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{item.num}</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.65 }}>{item.text}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: 6, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
          <strong style={{ color: C.purple }}>The key question to ask:</strong> "Out of how many?" — if you can give a specific fixed number, you probably have a Binomial situation.
        </div>
      </div>

      <div style={{ background: C.alt, borderRadius: 10, padding: '14px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Clinical trial: {n} patients, {(p * 100).toFixed(0)}% probability of response
        </div>
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 10, lineHeight: 1.6 }}>
          Each bar shows the probability of getting exactly that many responders. The distribution shows you all possible outcomes and how likely each one is.
        </div>
        <BarChart data={trimmed} color={C.purple} xLabel="Number of patients who respond" />
        <div style={{ display: 'flex', gap: 10, margin: '10px 0' }}>
          <div style={{ flex: 1, padding: '8px 12px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.purple, fontWeight: 600, marginBottom: 2 }}>Expected number (mean)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{mu}</div>
            <div style={{ fontSize: 10, color: C.muted }}>patients respond on average</div>
          </div>
          <div style={{ flex: 1, padding: '8px 12px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.purple, fontWeight: 600, marginBottom: 2 }}>Standard deviation</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.purple, fontFamily: "'JetBrains Mono', monospace" }}>{sigma}</div>
            <div style={{ fontSize: 10, color: C.muted }}>typical variation</div>
          </div>
        </div>
        <Slider label="Number of patients (n)" value={n} min={10} max={100} step={5} onChange={setN} fmt={v => v} />
        <Slider label="Probability of response (p)" value={p} min={0.05} max={0.95} step={0.05} onChange={setP} fmt={v => (v * 100).toFixed(0) + '%'} />
      </div>

      <div style={s.example}>
        <div style={s.exampleLabel}>Reading the result</div>
        With {n} patients and a {(p * 100).toFixed(0)}% response rate, you expect about <strong style={{ color: C.text }}>{mu} patients</strong> to respond on average. Some trials will have more responders, some fewer — the distribution shows you how much natural variation to expect. Try increasing n and notice how the distribution becomes more bell-shaped: this is the binomial distribution approaching the normal distribution at large sample sizes.
      </div>
    </div>
  )
}

function PoissonTab() {
  const [lam, setLam] = useState(3)
  const maxK = Math.min(Math.ceil(lam * 4 + 5), 30)
  const data = []
  for (let k = 0; k <= maxK; k++) data.push({ k, p: poissonProb(lam, k) })
  const trimmed = data.filter(d => d.p > 0.0005)

  return (
    <div>
      <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>What is the Poisson Distribution?</div>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>
          Imagine you're working in an emergency department. Patients arrive throughout the day, but not on a schedule — some hours are quiet, some are hectic. You want to model how many patients arrive in any given hour. There's no fixed maximum — in theory, any number could arrive. That kind of situation, where events occur randomly in a time interval with no fixed ceiling, is modeled by the <strong style={{ color: C.text }}>Poisson distribution</strong>.
        </p>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, marginBottom: 10 }}>
          The Poisson distribution is defined by a single parameter:
        </p>
        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.5)', borderRadius: 6, marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.coral, marginBottom: 4 }}>λ (lambda) — the average rate</div>
          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>The average number of events per interval. If the ER averages 3 arrivals per hour, then λ = 3. One remarkable property: the mean and the variance both equal λ.</div>
        </div>
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.5)', borderRadius: 6, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
          <strong style={{ color: C.coral }}>The key question to ask:</strong> "Per hour? Per day? Per mile?" — if you're counting events in an interval with no fixed maximum, it's probably Poisson.
        </div>
      </div>

      <div style={{ background: C.alt, borderRadius: 10, padding: '14px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          ER arrivals per hour — average rate λ = {lam}
        </div>
        <div style={{ fontSize: 12, color: C.dim, marginBottom: 10, lineHeight: 1.6 }}>
          Each bar shows the probability of exactly that many arrivals in one hour. Notice that the distribution is right-skewed at low λ and becomes more symmetric as λ increases.
        </div>
        <BarChart data={trimmed} color={C.coral} xLabel="Arrivals per hour" />
        <div style={{ display: 'flex', gap: 10, margin: '10px 0' }}>
          <div style={{ flex: 1, padding: '8px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.coral, fontWeight: 600, marginBottom: 2 }}>Mean arrivals per hour</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.coral, fontFamily: "'JetBrains Mono', monospace" }}>λ = {lam}</div>
          </div>
          <div style={{ flex: 1, padding: '8px 12px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: C.coral, fontWeight: 600, marginBottom: 2 }}>Standard deviation</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.coral, fontFamily: "'JetBrains Mono', monospace" }}>{Math.sqrt(lam).toFixed(2)}</div>
            <div style={{ fontSize: 10, color: C.muted }}>= √λ</div>
          </div>
        </div>
        <Slider label="Average rate per hour (λ)" value={lam} min={0.5} max={15} step={0.5} onChange={setLam} fmt={v => v.toFixed(1)} />
      </div>

      <div style={s.example}>
        <div style={s.exampleLabel}>Reading the result</div>
        With λ = {lam} arrivals per hour, the most likely outcome is {Math.round(lam)} arrivals — but there's meaningful probability of getting anywhere from 0 to {Math.round(lam * 2.5)}. Try increasing λ to 10 or 15 and notice how the distribution widens and becomes more symmetric — at large rates, the Poisson approaches the normal distribution.
      </div>
    </div>
  )
}

// ── Practice scenarios ──
const SCENARIOS = [
  {
    q: "A clinic enrolls 100 patients and records how many respond to a new treatment.",
    answer: 'binomial',
    whyCorrect: "There are 100 fixed opportunities (patients), and each either responds or doesn't. Fixed n, counting successes → Binomial.",
    wrongFeedback: {
      normal: "Treatment response (yes/no) is binary, not a continuous measurement. With a fixed number of patients and a binary outcome, use Binomial.",
      poisson: "Poisson models events with no fixed maximum — like arrivals per hour. Here there's a fixed number of patients (100), making this Binomial.",
    }
  },
  {
    q: "A hospital tracks the number of surgical site infections occurring per week.",
    answer: 'poisson',
    whyCorrect: "Infections occur randomly over time with no fixed maximum per week. Events in an interval with no fixed ceiling → Poisson.",
    wrongFeedback: {
      normal: "Infection counts are discrete whole numbers, not continuous measurements, so Normal doesn't fit. Events occurring randomly over time → Poisson.",
      binomial: "Binomial requires a fixed number of 'opportunities.' There's no fixed maximum number of infections per week — it could theoretically be any count → Poisson.",
    }
  },
  {
    q: "Researchers measure systolic blood pressure in 1,000 adults from the general population.",
    answer: 'normal',
    whyCorrect: "Blood pressure is a continuous measurement that tends to cluster around a center and tail off symmetrically in large populations → Normal.",
    wrongFeedback: {
      binomial: "Blood pressure is a continuous measurement, not a count of successes out of a fixed number of trials.",
      poisson: "Blood pressure is a continuous biological measurement, not a count of events in an interval. Normal is appropriate here.",
    }
  },
  {
    q: "A public health agency tracks the number of food poisoning cases reported per day in a county.",
    answer: 'poisson',
    whyCorrect: "Cases occur randomly over time with no fixed maximum per day → Poisson. This is a classic count-of-rare-events-in-an-interval scenario.",
    wrongFeedback: {
      normal: "Case counts are discrete whole numbers and there's no fixed maximum — Normal doesn't fit well here. Poisson is designed for rare event counts per interval.",
      binomial: "There's no fixed number of 'opportunities' for food poisoning cases in a day. The count is open-ended → Poisson.",
    }
  },
  {
    q: "In a vaccine trial, 200 participants are enrolled and researchers record how many develop antibodies after vaccination.",
    answer: 'binomial',
    whyCorrect: "200 fixed participants, each either develops antibodies or doesn't. Fixed n, binary outcome, counting successes → Binomial.",
    wrongFeedback: {
      normal: "Antibody development is binary (yes/no per person), not a continuous measurement. With 200 fixed participants → Binomial.",
      poisson: "Poisson applies when there's no fixed maximum. Here there are exactly 200 participants, making Binomial the right choice.",
    }
  },
  {
    q: "A lab measures serum cholesterol levels (mg/dL) in a random sample of 500 adults.",
    answer: 'normal',
    whyCorrect: "Cholesterol is a continuous measurement that is approximately normally distributed in the general population → Normal Distribution.",
    wrongFeedback: {
      binomial: "Cholesterol is a continuous measurement on a scale (mg/dL), not a count of successes out of a fixed number of trials.",
      poisson: "Cholesterol is a continuous biological measurement, not a count of events per interval → Normal Distribution.",
    }
  },
  {
    q: "A researcher counts the number of needle-stick injuries reported at a hospital per month.",
    answer: 'poisson',
    whyCorrect: "Needle-stick injuries occur randomly over time with no fixed maximum per month. This is a count of rare events in a fixed time interval → Poisson Distribution.",
    wrongFeedback: {
      normal: "Injury counts are discrete whole numbers and there's no fixed maximum per month. Normal doesn't fit discrete count data well here → Poisson Distribution.",
      binomial: "There's no fixed number of 'opportunities' for needle-stick injuries in a month — any number could theoretically occur → Poisson Distribution.",
    }
  },
  {
    q: "A screening program tests 300 adults for hypertension and records how many test positive.",
    answer: 'binomial',
    whyCorrect: "There are exactly 300 adults being tested (fixed n), and each person either tests positive or doesn't. Fixed number of trials, binary outcome → Binomial Distribution.",
    wrongFeedback: {
      normal: "The outcome here is binary (positive or negative per person), not a continuous measurement. With a fixed group of 300 people → Binomial Distribution.",
      poisson: "Poisson applies when there's no fixed maximum. Here there are exactly 300 people being screened, so Binomial is correct.",
    }
  },
]

function Practice() {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const sc = SCENARIOS[idx]
  const answered = picked !== null
  const correct = picked === sc?.answer

  function handlePick(type) {
    if (answered) return
    setPicked(type)
    if (type === sc.answer) setScore(s => s + 1)
  }

  function handleNext() {
    if (idx < SCENARIOS.length - 1) { setIdx(i => i + 1); setPicked(null) }
    else setDone(true)
  }

  if (done) {
    const pct = Math.round((score / SCENARIOS.length) * 100)
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: pct >= 80 ? C.green : pct >= 60 ? C.amber : C.coral, fontFamily: "'Space Grotesk', sans-serif" }}>{score}/{SCENARIOS.length}</div>
        <div style={{ fontSize: 15, color: C.dim, marginTop: 6, marginBottom: 20 }}>
          {pct >= 80 ? 'Distribution selection is clicking.' : pct >= 60 ? 'Getting there. Review the ones you missed.' : 'Keep practicing — focus on Binomial vs. Poisson.'}
        </div>
        <button onClick={() => { setIdx(0); setPicked(null); setScore(0); setDone(false) }}
          style={{ padding: '10px 24px', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 8 }}>
        <span>Scenario {idx + 1} of {SCENARIOS.length}</span>
        <span>Score: <strong style={{ color: C.text }}>{score}</strong></span>
      </div>
      <div style={{ height: 4, background: C.alt, borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: '100%', width: `${(idx / SCENARIOS.length) * 100}%`, background: C.teal, borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      <div style={{ background: C.alt, borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Which distribution fits?</div>
        <div style={{ fontSize: 15, color: C.text, lineHeight: 1.6 }}>{sc.q}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {TABS.map(t => {
          const isAnswer = t.id === sc.answer
          let bg = C.surface, border = C.border, color = C.dim
          if (answered) {
            if (isAnswer) { bg = t.id === 'normal' ? C.tealSoft : t.id === 'binomial' ? C.purpleSoft : C.coralSoft; border = t.color; color = t.color }
            else if (t.id === picked) { bg = C.coralSoft; border = C.coral; color = C.coral }
          }
          return (
            <button key={t.id} onClick={() => handlePick(t.id)} disabled={answered}
              style={{ flex: 1, padding: '10px 0', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, fontWeight: 600, cursor: answered ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = t.color }}
              onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = C.border }}
            >
              {t.label}
              {answered && isAnswer && ' ✓'}
              {answered && t.id === picked && !isAnswer && ' ✗'}
            </button>
          )
        })}
      </div>
      {answered && (
        <div>
          <div style={{ padding: '12px 14px', background: correct ? C.tealSoft : C.coralSoft, border: `1px solid ${correct ? 'rgba(0,153,168,0.2)' : 'rgba(232,69,42,0.2)'}`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 10 }}>
            {correct
              ? <><strong style={{ color: C.teal }}>Correct.</strong> {sc.whyCorrect}</>
              : <><strong style={{ color: C.coral }}>Not quite.</strong> {sc.wrongFeedback[picked]}</>
            }
          </div>
          <button onClick={handleNext}
            style={{ width: '100%', padding: '11px 0', background: C.teal, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {idx < SCENARIOS.length - 1 ? 'Next scenario →' : 'See results'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function DistributionsExplorer() {
  const [tab, setTab] = useState('normal')
  const [preselect, setPreselect] = useState(null)

  function handlePreselect(type) {
    setPreselect(type)
    setTab(type)
  }

  return (
    <div style={s.page}>
      <div style={s.pageTitle}>Which Distribution Fits?</div>
      <div style={s.pageSub}>
        Different kinds of outcomes require different statistical models. The first question isn't "which formula?" — it's "what am I measuring?"
      </div>

      {/* What is a distribution */}
      <Section icon="~" iconBg={C.tealSoft} title="What Is a Distribution?" defaultOpen={true}>
        <Concept title="A distribution describes how values are spread out">
          <p style={s.prose}>Two datasets can have similar means but look completely different:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '10px 0' }}>
            {[
              { label: 'Dataset A', values: [20, 21, 22, 23, 24, 25], note: 'Mean ≈ 22.5. Values cluster tightly. Symmetric.', color: C.teal },
              { label: 'Dataset B', values: [20, 20, 20, 20, 20, 80], note: 'Mean ≈ 30. One extreme value pulls the distribution right.', color: C.coral },
            ].map(d => (
              <div key={d.label} style={{ padding: '12px 14px', background: C.alt, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: d.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{d.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {d.values.map((v, i) => (
                    <span key={i} style={{ padding: '2px 8px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: v === 80 ? C.coral : C.text, fontWeight: v === 80 ? 700 : 400 }}>{v}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{d.note}</div>
              </div>
            ))}
          </div>
          <div style={{ ...s.example, marginTop: 12 }}>
            <div style={s.exampleLabel}>Why shape matters</div>
            Statistical methods make assumptions about distribution shape. Using the wrong distribution means using the wrong method — which can lead to the wrong conclusion.
          </div>
        </Concept>
      </Section>

      {/* Quick selector */}
      <div style={{ padding: '16px', background: C.alt, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>What are you measuring?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'A biological measurement (blood pressure, cholesterol, height)', type: 'normal', color: C.teal, dist: 'Normal Distribution' },
            { label: 'Number of successes out of a fixed number of patients or trials', type: 'binomial', color: C.purple, dist: 'Binomial Distribution' },
            { label: 'Number of events occurring in a period of time or space', type: 'poisson', color: C.coral, dist: 'Poisson Distribution' },
          ].map(opt => (
            <button key={opt.type} onClick={() => handlePreselect(opt.type)}
              style={{
                padding: '10px 14px', textAlign: 'left', background: preselect === opt.type ? (opt.type === 'normal' ? C.tealSoft : opt.type === 'binomial' ? C.purpleSoft : C.coralSoft) : C.surface,
                border: `1px solid ${preselect === opt.type ? opt.color : C.border}`,
                borderRadius: 8, color: preselect === opt.type ? opt.color : C.dim,
                fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: preselect === opt.type ? 600 : 400,
                transition: 'all 0.15s',
              }}>
              {opt.label} → <strong>{opt.dist}</strong>
            </button>
          ))}
        </div>
      </div>

      {/* Distribution tabs */}
      <div style={{ marginBottom: 12, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {/* Tab bar */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: '0 16px', background: C.alt, display: 'flex', gap: 0, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: C.muted, padding: '10px 0', fontStyle: 'italic' }}>Suggested path: Normal → Binomial → Poisson</div>
          <div style={{ display: 'flex' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  padding: '12px 18px', background: 'none', border: 'none',
                  borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
                  color: tab === t.id ? t.color : C.dim,
                  fontWeight: tab === t.id ? 700 : 400, fontSize: 14,
                  cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
                  transition: 'all 0.15s',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          {tab === 'normal' && <NormalTab />}
          {tab === 'binomial' && <BinomialTab />}
          {tab === 'poisson' && <PoissonTab />}
        </div>
      </div>

      {/* Binomial vs Poisson misconception */}
      <Section icon="!" iconBg={C.amberSoft} title="Binomial vs. Poisson: Both Are Counts — So What's the Difference?">
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Both distributions model counts. The difference is whether there's a fixed maximum.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '12px 0' }}>
            <div style={{ padding: '14px 16px', background: C.purpleSoft, border: `1px solid rgba(107,63,204,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Binomial</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>Fixed number of opportunities (n). Each opportunity results in success or failure.</div>
              <div style={{ fontSize: 12, color: C.purple, fontWeight: 600, marginBottom: 4 }}>Ask yourself:</div>
              <div style={{ fontSize: 13, color: C.dim, fontStyle: 'italic' }}>"Out of how many?" — if you can answer this, it's probably Binomial.</div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.dim }}><strong style={{ color: C.text }}>Examples:</strong> 50 surgeries → count infections. 100 patients → count responders.</div>
            </div>
            <div style={{ padding: '14px 16px', background: C.coralSoft, border: `1px solid rgba(232,69,42,0.2)`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Poisson</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 8 }}>No fixed maximum. Events occur randomly in an interval. The count could theoretically be any non-negative integer.</div>
              <div style={{ fontSize: 12, color: C.coral, fontWeight: 600, marginBottom: 4 }}>Ask yourself:</div>
              <div style={{ fontSize: 13, color: C.dim, fontStyle: 'italic' }}>"Per hour? Per day? Per mile?" — events in an interval with no ceiling → Poisson.</div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.dim }}><strong style={{ color: C.text }}>Examples:</strong> ER arrivals per hour. Disease cases per week. Falls per month.</div>
            </div>
          </div>
          <div style={{ padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
            <strong style={{ color: C.amber }}>The diagnostic question:</strong> Is there a fixed number of "slots" where success or failure can occur? Yes → Binomial. No → Poisson.
          </div>
        </div>
      </Section>

      {/* Practice */}
      <Section icon="▶" iconBg={C.tealSoft} title="Identify the Distribution" defaultOpen={true}>
        <div style={{ paddingTop: 20 }}>
          <p style={s.prose}>Read each scenario and select the distribution that fits. Focus on your reasoning — the explanation matters more than the answer.</p>
          <Practice />
        </div>
      </Section>
    </div>
  )
}
