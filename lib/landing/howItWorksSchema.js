import { SITE_URL } from "../metadata.js";

export const howItWorksSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to audit your website with UXAuditX",
  description:
    "Run a free website UX audit in three steps — no code, no setup, results in under a minute.",
  totalTime: "PT1M",
  supply: {
    "@type": "HowToSupply",
    name: "A website URL"
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Paste your link",
      text: "Drop in any URL. Nothing to install."
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "We look at every section",
      text: "We scroll through your whole page and screenshot each part, on phone and computer."
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Your report is ready",
      text: "Get a prioritized list of issues, each with a screenshot and a simple fix."
    }
  ],
  url: `${SITE_URL}/#how-it-works`
};
