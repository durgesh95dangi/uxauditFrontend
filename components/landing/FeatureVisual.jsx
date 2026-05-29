"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DEMO_SITE } from "../../lib/landing/demoSite.js";

const FEATURE_IMAGES = {
  browser: "/landing/feature-capture.svg",
  issue: "/landing/feature-issue.svg",
  report: "/landing/feature-report.svg"
};

export default function FeatureVisual({ type }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
    const t = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(t);
  }, [type]);

  if (type === "browser") {
    return (
      <div className={`feature-visual feature-visual-browser${active ? " feature-visual-active" : ""}`}>
        <div className="feature-visual-frame">
          <Image
            src={FEATURE_IMAGES.browser}
            alt="Taking pictures of each section of a web page"
            width={640}
            height={420}
            className="feature-visual-img"
            loading="lazy"
          />
          <div className="feature-visual-scan-beam" aria-hidden="true" />
          <div className="feature-visual-capture-tags" aria-hidden="true">
            <span className="feature-visual-tag feature-visual-tag-1">Hero · captured</span>
            <span className="feature-visual-tag feature-visual-tag-2">Features · scanning</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "issue") {
    return (
      <div className={`feature-visual feature-visual-issue${active ? " feature-visual-active" : ""}`}>
        <div className="feature-visual-frame">
          <Image
            src={FEATURE_IMAGES.issue}
            alt="A problem on the page shown next to a picture of where it is"
            width={640}
            height={420}
            className="feature-visual-img"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`feature-visual feature-visual-report${active ? " feature-visual-active" : ""}`}>
      <div className="feature-visual-frame">
        <Image
          src={FEATURE_IMAGES.report}
          alt={`Report for ${DEMO_SITE.url} with the most urgent issues first`}
          width={640}
          height={420}
          className="feature-visual-img"
          loading="lazy"
        />
      </div>
    </div>
  );
}
