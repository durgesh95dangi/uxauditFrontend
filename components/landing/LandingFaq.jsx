"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How does UXAuditX work?",
    a: "Paste your link. We open your page, take pictures of every section on both computer and phone, and give you a clear list of what to fix — with a picture and a simple suggestion for each one."
  },
  {
    q: "Do I need to install anything?",
    a: "No. Nothing to install, no code, no setup. If your page is live, we can check it."
  },
  {
    q: "What does it actually find?",
    a: "Things you can see on the page: buttons that don't stand out, cramped layouts, missing trust signals, problems on phones, confusing wording, and hard-to-read text. Every item comes with a picture of where it is."
  },
  {
    q: "Is there a free plan?",
    a: "Yes — 3 free reports a month. No card needed to sign up."
  },
  {
    q: "How is this different from a speed test?",
    a: "Speed tests tell you how fast your page loads. We look at your page the way a real visitor does and point out what's confusing or losing you customers — with pictures, not just scores."
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
