import Image from "next/image";
import { IconScreenshot } from "./LandingIcons.jsx";

export default function ExampleFindingCard({ finding }) {
  const FindingIcon = finding.icon;

  return (
    <article className="span-4 finding-card finding-card-proof">
      <div className="finding-proof-frame">
        <div className="finding-proof-chrome">
          <IconScreenshot size={12} />
          <span>Section capture</span>
          <span className="finding-proof-viewport">{finding.viewport}</span>
        </div>
        <div className="finding-proof-shot">
          <Image
            src={finding.proof}
            alt={finding.proofAlt}
            width={400}
            height={220}
            className="finding-proof-img"
          />
          <span className={`finding-proof-pin finding-proof-pin--${finding.severity}`} aria-hidden="true" />
        </div>
      </div>

      <div className="finding-card-head">
        <span className={`sev sev-${finding.severity}`}>
          <FindingIcon size={12} />
          {finding.severity}
        </span>
        <span className="finding-proof-section">{finding.section}</span>
      </div>

      <h3>{finding.title}</h3>
      <p className="finding-context">{finding.context}</p>
      <p className="finding-fix">
        <strong>Fix:</strong> {finding.fix}
      </p>
    </article>
  );
}
