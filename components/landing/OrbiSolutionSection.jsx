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
    title: "UXAuditX opens your live site",
    body: "We visit your URL the same way a first-time customer would — no install, no code.",
    preview: "input"
  },
  {
    num: 2,
    title: "Screens every section on phone & desktop",
    body: "We scroll the full page, capture each section, and flag usability and conversion issues.",
    preview: "progress"
  },
  {
    num: 3,
    title: "Delivers a prioritized report",
    body: "The biggest problems rise to the top — each with a screenshot, why it matters, and a clear fix.",
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
      <div className="container orbi-solution-inner">
        <div className="orbi-solution-copy">
          <p className="orbi-solution-eyebrow">The solution</p>
          <h2 className="orbi-solution-title">
            Meet UXAuditX — your
            <br />
            UX review sidekick
          </h2>
          <p className="orbi-solution-lead">
            UXAuditX reviews your website like a sharp-eyed visitor and drops
            every issue into one clear, screenshot-backed report.
          </p>
          <div className="orbi-solution-cta">
            <Link href="/signup" className="btn btn-primary orbi-solution-btn">
              Get free website review
            </Link>
            <p className="orbi-solution-note">
              {MONTHLY_AUDIT_LIMIT} free audit per month · No credit card
            </p>
          </div>
        </div>

        <div className="orbi-solution-steps-col">
          <ol className="orbi-solution-steps">
            {STEPS.map((step) => (
              <li key={step.num} className="orbi-solution-step">
                <div className="orbi-solution-step-head">
                  <span className="orbi-solution-step-num">{step.num}</span>
                  <div className="orbi-solution-step-body">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </div>
                <div className={`orbi-solution-step-visual orbi-solution-step-visual--${step.preview}`}>
                  <StepVisual type={step.preview} />
                </div>
              </li>
            ))}
          </ol>

          <p className="orbi-solution-tagline">
            UXAuditX does the tedious review work, so you can focus on fixing what
            matters.
          </p>
        </div>
      </div>
    </section>
  );
}
