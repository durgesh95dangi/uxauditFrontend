"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How does UXAuditX work?",
    a: "You paste your URL. We open your site, scroll through every section like a visitor, take screenshots, and build a report. Each issue shows you the exact spot on your page, how serious it is, and what to do about it. Most reports are ready in under a minute."
  },
  {
    q: "Do I need to install anything?",
    a: "No. Paste a link, get a report. Nothing to install, no code, no browser extension."
  },
  {
    q: "What does it actually find?",
    a: "Button and CTA clarity, readability, mobile layout issues, trust signals, page speed problems, and whether your headline makes sense to a first-time visitor. It checks both desktop and phone."
  },
  {
    q: "Is there a free plan?",
    a: "Yes. The free Starter plan gives you 3 reports per month, screenshots on both devices, and a picture with every issue. No credit card required."
  },
  {
    q: "How is this different from a speed test?",
    a: "Speed tests only check load time. UXAuditX looks at everything a real visitor actually sees — clarity, layout, trust, mobile usability, and whether people know what to do next. Speed is one part of it, but it's far from the whole picture."
  },
  {
    q: "Can I share the report with my designer?",
    a: "On Pro, yes — every report has a shareable link. On the free plan, you can take screenshots or export the findings yourself."
  }
];

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className={`faq-item${isOpen ? " faq-item-open" : ""}`}>
            <button
              type="button"
              className="faq-question"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <span className="faq-icon" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && <p className="faq-answer">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
