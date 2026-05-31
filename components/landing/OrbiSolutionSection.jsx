import Link from "next/link";
import { MONTHLY_AUDIT_LIMIT } from "../../lib/audit/limits.js";
import LandingSolutionReportPreview from "./LandingSolutionReportPreview.jsx";
import {
  LandingInputPreview,
  LandingProgressPreview
} from "./LandingUiPreviews.jsx";

const STEPS = [
  {
    num: 1,
    title: "1. Enter website URL",
    body: "Let UXAuditX visit your website exactly like a real user to analyze layout, copy, and CTAs.",
    preview: "input"
  },
  {
    num: 2,
    title: "2. Scan layout & elements",
    body: "We analyze every section on desktop and mobile, checking clarity, spacing, and mobile UX.",
    preview: "progress"
  },
  {
    num: 3,
    title: "3. Get prioritized fixes",
    body: "Access a professional report highlighting prioritized findings, screenshots, and exact fixes.",
    preview: "report"
  }
];

function StepVisual({ type }) {
  if (type === "input") return <LandingInputPreview />;
  if (type === "progress") return <LandingProgressPreview />;
  return <LandingSolutionReportPreview />;
}

export default function OrbiSolutionSection() {
  return (
    <section id="how-it-works" className="section-band orbi-solution-band">
      <div className="container">
        <div className="section-header section-header-center">
          <p className="orbi-solution-eyebrow">How it works</p>
          <h2 className="section-title">Get your audit in 3 simple steps</h2>
          <p className="section-lead" style={{ marginInline: "auto" }}>
            UXAuditX does the tedious review work automatically. No code changes, no installation required.
          </p>
        </div>

        <div className="orbi-steps-row-grid">
          {STEPS.map((step) => (
            <div key={step.num} className="orbi-step-card">
              <div className="orbi-step-visual-wrapper orbi-solution-step-visual">
                <StepVisual type={step.preview} />
              </div>
              <h3 className="orbi-step-card-title">{step.title}</h3>
              <p className="orbi-step-card-desc">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="orbi-solution-cta" style={{ textAlign: "center", marginTop: "var(--space-2xl)" }}>
          <Link href="/signup" className="btn btn-primary orbi-solution-btn">
            Get free website review
          </Link>
          <p className="orbi-solution-note">
            {MONTHLY_AUDIT_LIMIT} free audit per month · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
