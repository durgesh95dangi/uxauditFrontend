import { DEMO_SITE } from "../../lib/landing/demoSite.js";
import AnimateIn from "./AnimateIn.jsx";
import {
  IconCheck,
  IconLink,
  IconReport,
  IconScan,
  IconZap,
  SectionEyebrow
} from "./LandingIcons.jsx";

const STEPS = [
  {
    num: 1,
    title: "Paste your link",
    body: "Drop in any web page. There's nothing to install and no setup at all. Works with any URL — Webflow, Framer, Shopify, custom code, whatever you're on.",
    tone: "indigo",
    chromeLabel: "New report"
  },
  {
    num: 2,
    title: "We look at every section",
    body: "We scroll through your whole page the same way a first-time visitor would — on both phone and computer. We take a picture of each section as we go.",
    tone: "violet",
    chromeLabel: "Checking"
  },
  {
    num: 3,
    title: "Your report is ready",
    body: "You get a clear list with the biggest problems at the top. Each one has a screenshot of exactly where the issue is, why it matters, and a specific fix — not vague advice, real suggestions you can act on today.",
    tone: "blue",
    chromeLabel: "Report"
  }
];

const REPORT_ROWS = [
  { severity: "critical", title: "Main button is hard to see" },
  { severity: "high", title: "Button hidden too low on phones" }
];

function FlowUiChrome({ label }) {
  return (
    <div className="flow-ui-chrome">
      <span className="flow-ui-dot flow-ui-dot-red" />
      <span className="flow-ui-dot flow-ui-dot-amber" />
      <span className="flow-ui-dot flow-ui-dot-green" />
      <span className="flow-ui-brand">
        <IconScan size={11} />
        UXAuditX
      </span>
      <span className="flow-ui-label">{label}</span>
    </div>
  );
}

function FlowUiPaste() {
  return (
    <div className="flow-ui-body flow-ui-body--paste">
      <p className="flow-ui-kicker">Run an audit</p>
      <div className="flow-ui-field">
        <span className="flow-ui-field-prefix">https://</span>
        <span className="flow-ui-field-value">www.{DEMO_SITE.url}</span>
      </div>
      <button type="button" className="flow-ui-btn" tabIndex={-1}>
        <IconZap size={13} />
        Run audit
      </button>
    </div>
  );
}

function FlowUiScan() {
  return (
    <div className="flow-ui-body flow-ui-body--scan">
      <div className="flow-ui-scan-head">
        <span className="flow-ui-badge flow-ui-badge--scan">
          <IconCheck size={11} />
          Captured
        </span>
        <span className="flow-ui-scan-pct">100%</span>
      </div>
      <div className="flow-ui-track">
        <div className="flow-ui-track-fill" style={{ width: "100%" }} />
      </div>
      <div className="flow-shot">
        <div className="flow-shot-top">
          <span className="flow-shot-logo" />
          <span className="flow-shot-navline" />
          <span className="flow-shot-navline" />
        </div>
        <div className="flow-shot-hero">
          <span className="flow-shot-h1" />
          <span className="flow-shot-h2" />
          <span className="flow-shot-cta" />
        </div>
        <div className="flow-shot-row">
          <span className="flow-shot-tile" />
          <span className="flow-shot-tile" />
          <span className="flow-shot-tile" />
        </div>
      </div>
      <div className="flow-shot-captured">
        {DEMO_SITE.sections.map((section) => (
          <span key={section} className="flow-shot-chip">
            <IconCheck size={10} />
            {section}
          </span>
        ))}
      </div>
    </div>
  );
}

function FlowUiReport() {
  return (
    <div className="flow-ui-body flow-ui-body--report">
      <div className="flow-ui-report-head">
        <span className="flow-ui-badge flow-ui-badge--report">
          <IconReport size={12} />
          UX report
        </span>
        <span className="flow-ui-report-count">12 issues</span>
      </div>
      <p className="flow-ui-scan-url">www.{DEMO_SITE.url}</p>
      <ul className="flow-ui-findings flow-ui-findings--visible">
        {REPORT_ROWS.map((row) => (
          <li key={row.title} className="flow-ui-finding">
            <span className={`flow-ui-sev flow-ui-sev--${row.severity}`}>{row.severity}</span>
            <span className="flow-ui-finding-title">{row.title}</span>
            <IconCheck size={13} />
          </li>
        ))}
      </ul>
      <div className="flow-ui-report-foot">
        <span>Most urgent first</span>
        <span className="flow-ui-report-ready">
          <IconCheck size={12} />
          Ready
        </span>
      </div>
    </div>
  );
}

const STEP_UI = [FlowUiPaste, FlowUiScan, FlowUiReport];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-band section-band-soft how-it-works-band">
      <div className="container">
        <div className="section-header section-header-center">
          <SectionEyebrow icon={IconLink} center>
            How it works
          </SectionEyebrow>
          <h2 className="section-title">Three steps, one minute, real answers</h2>
        </div>

        <div className="grid flow-steps-grid section-grid">
          {STEPS.map((step, i) => {
            const StepUi = STEP_UI[i];
            return (
              <AnimateIn key={step.title} delay={i * 100} className="span-4">
                <article className={`flow-step-card flow-step-card--${step.tone}`}>
                  <div className="flow-step-meta">
                    <span className="flow-step-num">{step.num}</span>
                    <h3>{step.title}</h3>
                  </div>
                  <p className="flow-step-body">{step.body}</p>
                  <div className="flow-ui-window">
                    <FlowUiChrome label={step.chromeLabel} />
                    <StepUi />
                  </div>
                </article>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
