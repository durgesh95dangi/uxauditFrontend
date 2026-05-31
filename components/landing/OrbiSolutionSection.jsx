import Link from "next/link";
import { MONTHLY_AUDIT_LIMIT } from "../../lib/audit/limits.js";
import LandingSolutionReportPreview from "./LandingSolutionReportPreview.jsx";
import {
  LandingInputPreview
} from "./LandingUiPreviews.jsx";

const STEPS = [
  {
    num: 1,
    title: "1. Enter your website URL",
    body: "Let UXAuditX visit your site like a real user to scan layout, CTAs, and mobile usability.",
    preview: "input"
  },
  {
    num: 2,
    title: "2. Get your professional report",
    body: "Access a prioritized list of UX issues, complete with screenshots and recommended fixes.",
    preview: "report"
  }
];

function StepVisual({ type }) {
  if (type === "input") return <LandingInputPreview />;
  return <LandingSolutionReportPreview />;
}

export default function OrbiSolutionSection() {
  return (
    <section id="how-it-works" className="section-band orbi-solution-band">
      <div className="container">
        <div className="section-header section-header-center">
          <p className="orbi-solution-eyebrow">How it works</p>
          <h2 className="section-title">Get your audit in 2 simple steps</h2>
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
