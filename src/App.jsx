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
import PValueExplorer from './PValueExplorer'
import HypothesisTest from './HypothesisTest'
import PowerSampleSize from './PowerSampleSize'
import SampleSizeEffect from './SampleSizeEffect'
import StudyDesignHelper from './StudyDesignHelper'

const C = {
  bg: "#f8f9fc", surface: "#ffffff", alt: "#f0f2f7", border: "#e2e6ef",
  teal: "#0099a8", tealSoft: "#e0f5f7", coral: "#e8452a", coralSoft: "#fdecea",
  amber: "#b87000", amberSoft: "#fef3e0", green: "#1a7a3e", greenSoft: "#e6f4ec",
  purple: "#6b3fcc", purpleSoft: "#f0ebfa", text: "#0f1117", dim: "#4a5268", muted: "#9aa0b4",
}

// Tools in natural learning sequence
const tools = [
  // Foundation
  {
    id: "math-refresher", title: "Math Refresher", group: "Foundation",
    description: "Fractions, proportions, logarithms, Σ notation, and order of operations — the building blocks behind every formula in the course.",
    accent: C.teal, accentSoft: C.tealSoft, component: MathRefresher,
  },
  {
    id: "population-vs-sample", title: "Population vs. Sample", group: "Foundation",
    description: "Parameters vs. statistics, why we sample at all, and how sampling variability sets up every inference concept in the course.",
    accent: C.coral, accentSoft: C.coralSoft, component: PopulationVsSample,
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
  // Probability
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
  // Design & Inference
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
    id: "p-value-explorer", title: "P-Value Explorer", group: "Design & Inference",
    description: "Build intuition for what p-values actually measure — step by step, with common misconceptions addressed directly.",
    accent: C.coral, accentSoft: C.coralSoft, component: PValueExplorer,
  },
  {
    id: "hypothesis-testing", title: "Hypothesis Test Selector", group: "Design & Inference",
    description: "Scenario-based test selection with decision logic. Answer three questions and the right test follows automatically.",
    accent: C.purple, accentSoft: C.purpleSoft, component: HypothesisTest,
  },
  {
    id: "power-sample-size", title: "Power & Sample Size", group: "Design & Inference",
    description: "What moves statistical power and what it costs to be underpowered. Interactive sliders show the relationships directly.",
    accent: C.green, accentSoft: C.greenSoft, component: PowerSampleSize,
  },
  {
    id: "sample-size-effect", title: "Why Sample Size Matters", group: "Design & Inference",
    description: "Watch CI width and power change simultaneously as n grows. The capstone relationship in applied statistics.",
    accent: C.amber, accentSoft: C.amberSoft, component: SampleSizeEffect,
  },
  // Reference
  {
    id: "study-design-helper", title: "Which Study Design?", group: "Reference",
    description: "Detective-style walkthrough: answer four questions about a paper's methods and identify the study design.",
    accent: C.teal, accentSoft: C.tealSoft, component: StudyDesignHelper,
  },
]

const groups = ["Foundation", "Probability", "Design & Inference", "Reference"]

export default function App() {
  const [activeTool, setActiveTool] = useState(null)
  const [activeGroup, setActiveGroup] = useState("All")
  const currentIdx = tools.findIndex(t => t.id === activeTool)
  const current = currentIdx >= 0 ? tools[currentIdx] : null
  const prevTool = currentIdx > 0 ? tools[currentIdx - 1] : null
  const nextTool = currentIdx < tools.length - 1 ? tools[currentIdx + 1] : null
  const filtered = activeGroup === "All" ? tools : tools.filter(t => t.group === activeGroup)

  if (current && current.component) {
    const Tool = current.component
    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        {/* Top nav */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 16, height: 52, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setActiveTool(null)} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit', padding: '4px 0' }}>← All tools</button>
          <span style={{ color: C.border }}>|</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: current.accent }}>{current.title}</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: C.muted }}>Tool {currentIdx + 1} of {tools.length}</span>
        </div>

        <Tool />

        {/* Prev/Next navigation */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
          <div style={{ paddingTop: 24, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            {prevTool ? (
              <button onClick={() => setActiveTool(prevTool.id)}
                style={{ padding: '10px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', flex: '0 1 260px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = prevTool.accent; e.currentTarget.style.background = prevTool.accentSoft }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>← Previous</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: prevTool.accent }}>{prevTool.title}</div>
              </button>
            ) : <div />}
            {nextTool ? (
              <button onClick={() => setActiveTool(nextTool.id)}
                style={{ padding: '10px 16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', flex: '0 1 260px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = nextTool.accent; e.currentTarget.style.background = nextTool.accentSoft }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>Next →</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: nextTool.accent }}>{nextTool.title}</div>
              </button>
            ) : <div />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '2rem 1.5rem 1.5rem', background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.teal, marginBottom: 8 }}>BioSkills</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>Biostatistics Tools</h1>
          <p style={{ fontSize: 15, color: C.dim, maxWidth: 520, lineHeight: 1.6, marginBottom: 16 }}>Interactive tools to help you understand biostatistics concepts — not just memorize them.</p>
          {/* Suggested path note */}
          <div style={{ padding: '10px 14px', background: C.amberSoft, border: `1px solid rgba(184,112,0,0.2)`, borderRadius: 8, fontSize: 13, color: C.dim, lineHeight: 1.6, maxWidth: 640 }}>
            <strong style={{ color: C.amber }}>Suggested learning path:</strong> These tools build on one another — Foundation → Probability → Design & Inference. First-time learners may find it helpful to work through them in order. You're also welcome to jump directly to any tool you need.
          </div>
        </div>
      </div>

      {/* Group filter */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: '0 1.5rem', background: C.surface }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 4 }}>
          {["All", ...groups].map(g => (
            <button key={g} onClick={() => setActiveGroup(g)} style={{ padding: '10px 14px', background: 'none', border: 'none', borderBottom: activeGroup === g ? `2px solid ${C.teal}` : '2px solid transparent', color: activeGroup === g ? C.teal : C.dim, cursor: 'pointer', fontSize: 13, fontWeight: activeGroup === g ? 600 : 400, fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{g}</button>
          ))}
        </div>
      </div>

      {/* Tool grid */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Show groups with headers when viewing All */}
        {activeGroup === "All" ? (
          groups.map(grp => {
            const grpTools = tools.filter(t => t.group === grp)
            const grpDescriptions = {
              "Foundation": "What are we measuring? Where did the data come from? How should we describe it?",
              "Probability": "How does randomness work? How do we calculate probabilities? How does probability apply to real public health problems?",
              "Design & Inference": "How do we design a study? How do we estimate the population? How do we evaluate evidence? Was the study large enough?",
              "Reference": "Quick lookup tools for when you know the concepts but need help deciding which one applies right now.",
            }
            return (
              <div key={grp} style={{ marginBottom: 36 }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{grp}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{grpDescriptions[grp]}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {grpTools.map((tool, i) => {
                    const globalIdx = tools.findIndex(t => t.id === tool.id)
                    return (
                      <button key={tool.id} onClick={() => tool.component && setActiveTool(tool.id)}
                        style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', textAlign: 'left', cursor: tool.component ? 'pointer' : 'default', transition: 'all 0.15s', opacity: tool.component ? 1 : 0.6, fontFamily: 'inherit', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        onMouseEnter={e => { if (tool.component) { e.currentTarget.style.borderColor = tool.accent; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 10 }}>#{globalIdx + 1}</div>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: tool.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 16, color: tool.accent, fontWeight: 700 }}>
                          {globalIdx + 1}
                        </div>
                        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6, lineHeight: 1.3 }}>{tool.title}</div>
                        <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{tool.description}</div>
                        {!tool.component && <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.muted, background: C.alt, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px' }}>Soon</div>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {filtered.map(tool => {
              const globalIdx = tools.findIndex(t => t.id === tool.id)
              return (
                <button key={tool.id} onClick={() => tool.component && setActiveTool(tool.id)}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', textAlign: 'left', cursor: tool.component ? 'pointer' : 'default', transition: 'all 0.15s', opacity: tool.component ? 1 : 0.6, fontFamily: 'inherit', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                  onMouseEnter={e => { if (tool.component) { e.currentTarget.style.borderColor = tool.accent; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginBottom: 10 }}>#{globalIdx + 1} · {tool.group}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6, lineHeight: 1.3 }}>{tool.title}</div>
                  <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{tool.description}</div>
                  {!tool.component && <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.muted, background: C.alt, border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 6px' }}>Soon</div>}
                </button>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textAlign: 'center' }}>
          BioSkills · © 2026 Mary W. Mathis
        </div>
      </div>
    </div>
  )
}
