import { useState } from 'react'
import MathRefresher from './MathRefresher'
import PopulationVsSample from './PopulationVsSample'
import DataTypeIdentifier from './DataTypeIdentifier'
import SummaryStatistics from './SummaryStatistics'
import DistributionsExplorer from './DistributionsExplorer'
import ProbabilityRules from './ProbabilityRules'
import DiagnosticTest from './DiagnosticTest'
import StudyDesign from './StudyDesign'
import CIBuilder from './CIBuilder'

const C = {
  bg: "#f8f9fc", surface: "#ffffff", alt: "#f0f2f7", border: "#e2e6ef",
  teal: "#0099a8", tealSoft: "#e0f5f7", coral: "#e8452a", coralSoft: "#fdecea",
  amber: "#b87000", amberSoft: "#fef3e0", green: "#1a7a3e", greenSoft: "#e6f4ec",
  purple: "#6b3fcc", purpleSoft: "#f0ebfa", text: "#0f1117", dim: "#4a5268", muted: "#9aa0b4",
}

const tools = [
  {
    id: "math-refresher", title: "Math Refresher", group: "Foundation",
    description: "Fractions, proportions, logarithms, Σ notation, and order of operations — the building blocks behind every formula in the course.",
    accent: C.teal, accentSoft: C.tealSoft, component: MathRefresher,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
  {
    id: "population-vs-sample", title: "Population vs. Sample", group: "Foundation",
    description: "Parameters vs. statistics, why we sample at all, and how sampling variability sets up every inference concept in the course.",
    accent: C.coral, accentSoft: C.coralSoft, component: PopulationVsSample,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"/></svg>,
  },
  {
    id: "data-type-identifier", title: "Data Type Identifier", group: "Foundation",
    description: "Variable types → right summary statistic → right hypothesis test. The chain that organizes the entire course.",
    accent: C.amber, accentSoft: C.amberSoft, component: DataTypeIdentifier,
  },
  {
    id: "summary-statistics", title: "Summary Statistics Explorer", group: "Foundation",
    description: "Mean, median, SD, IQR — what each one tells you, when to use which, and why you describe before you test.",
    accent: C.teal, accentSoft: C.tealSoft, component: SummaryStatistics,
  },
  {
    id: "distributions", title: "Distributions Explorer", group: "Probability",
    description: "Binomial, normal, and Poisson distributions with live sliders and public health contexts for each shape.",
    accent: C.purple, accentSoft: C.purpleSoft, component: DistributionsExplorer,
  },
  {
    id: "probability", title: "Probability Rules", group: "Probability",
    description: "Addition rule, multiplication rule, conditional probability — with Venn diagrams that update as you adjust the numbers.",
    accent: C.coral, accentSoft: C.coralSoft, component: ProbabilityRules,
  },
  {
    id: "diagnostic-test", title: "Diagnostic Test Interpreter", group: "Probability",
    description: "Sensitivity, specificity, PPV, NPV — and why prevalence changes everything even when the test stays the same.",
    accent: C.green, accentSoft: C.greenSoft, component: DiagnosticTest,
  },
  {
    id: "study-design", title: "Study Design Selector", group: "Design & Inference",
    description: "Scenario-based: read a research question and choose the right design. Explains why each design fits or fails.",
    accent: C.amber, accentSoft: C.amberSoft, component: StudyDesign,
  },
  {
    id: "confidence-intervals", title: "CI Builder", group: "Design & Inference",
    description: "Build a confidence interval step by step. See how width, precision, and sample size are connected.",
    accent: C.teal, accentSoft: C.tealSoft, component: CIBuilder,
  },
  {
    id: "hypothesis-testing", title: "Hypothesis Test Selector", group: "Design & Inference",
    description: "Scenario-based test selection with decision logic. Input your data type and question, get the right test and why.",
    accent: C.coral, accentSoft: C.coralSoft, component: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/></svg>,
  },
  {
    id: "power-sample-size", title: "Power & Sample Size", group: "Design & Inference",
    description: "What moves statistical power and what it costs to be underpowered. Interactive sliders show the relationships directly.",
    accent: C.purple, accentSoft: C.purpleSoft, component: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>,
  },
  {
    id: "sample-size-effect", title: "Effect of Sample Size", group: "Design & Inference",
    description: "Watch CI width and power change simultaneously as n grows. The most important relationship in applied statistics.",
    accent: C.amber, accentSoft: C.amberSoft, component: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><line x1="3" y1="20" x2="21" y2="20" stroke="currentColor" strokeWidth="2"/><polyline points="3,12 7,8 11,14 15,6 19,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  },
]

const groups = ["Foundation", "Probability", "Design & Inference"]

export default function App() {
  const [activeTool, setActiveTool] = useState(null)
  const [activeGroup, setActiveGroup] = useState("All")
  const current = tools.find(t => t.id === activeTool)
  const filtered = activeGroup === "All" ? tools : tools.filter(t => t.group === activeGroup)

  if (current && current.component) {
    const Tool = current.component
    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 16, height: 52, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setActiveTool(null)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit', padding: '4px 0' }}>← Back</button>
          <span style={{ color: C.border }}>|</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: current.accent }}>{current.title}</span>
        </div>
        <Tool />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '2rem 1.5rem 1.5rem', background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.teal, marginBottom: 8 }}>BioSkills</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>Biostatistics Tools</h1>
          <p style={{ fontSize: 15, color: C.dim, maxWidth: 520, lineHeight: 1.6 }}>Interactive tools to help you understand biostatistics concepts — not just memorize them. Free for students.</p>
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '0 1.5rem', background: C.surface }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 4 }}>
          {["All", ...groups].map(g => (
            <button key={g} onClick={() => setActiveGroup(g)} style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: activeGroup === g ? `2px solid ${C.teal}` : '2px solid transparent', color: activeGroup === g ? C.teal : C.dim, cursor: 'pointer', fontSize: 13, fontWeight: activeGroup === g ? 600 : 400, fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{g}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(tool => (
            <button key={tool.id} onClick={() => tool.component ? setActiveTool(tool.id) : null}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px', textAlign: 'left', cursor: tool.component ? 'pointer' : 'default', transition: 'all 0.15s', opacity: tool.component ? 1 : 0.6, fontFamily: 'inherit', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { if (tool.component) { e.currentTarget.style.borderColor = tool.accent; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>{tool.group}</div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: tool.accentSoft, color: tool.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{tool.icon}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8, lineHeight: 1.3 }}>{tool.title}</div>
              <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{tool.description}</div>
              {!tool.component && <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.muted, background: C.alt, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px' }}>Soon</div>}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textAlign: 'center' }}>
          BioSkills · Free for students · Built for PBH 202 at Mercer University
        </div>
      </div>
    </div>
  )
}
