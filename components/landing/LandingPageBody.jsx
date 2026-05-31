"use client";

import { useState } from "react";
import SiteFooter from "../layout/SiteFooter.jsx";
import SiteNav from "../layout/SiteNav.jsx";
import HeroAuditFlow from "./HeroAuditFlow.jsx";
import InteractiveBackground from "./InteractiveBackground.jsx";

export default function LandingPageBody({ children }) {
  const [phase, setPhase] = useState("hero");
  const showLandingSections = phase === "hero";
  const navDisabled = phase === "scan";

  return (
    <>
      <SiteNav interactionDisabled={navDisabled} />

      <main className={showLandingSections ? undefined : "landing-main--audit-focus"}>
        <div className="landing-fold landing-fold-orbi">
          <section className="hero-band hero-band-orbi">
            <InteractiveBackground />
            <div className="container hero-orbi-container">
              <HeroAuditFlow onPhaseChange={setPhase} />
            </div>
          </section>
        </div>
        {showLandingSections ? children : null}
      </main>
      {showLandingSections ? <SiteFooter /> : null}
    </>
  );
}
