import Link from "next/link";
import SiteNav from "../layout/SiteNav.jsx";
import SiteFooter from "../layout/SiteFooter.jsx";

export function GuideSection({ title, children }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function GuideLayout({
  eyebrow = "Guide",
  title,
  intro,
  children,
  cta
}) {
  return (
    <div className="page-shell">
      <SiteNav minimal />

      <main className="legal-main">
        <div className="container legal-container">
          <Link href="/" className="legal-back">
            ← Back to home
          </Link>

          <header className="legal-header">
            <p className="legal-eyebrow">{eyebrow}</p>
            <h1 className="legal-title">{title}</h1>
            {intro ? <p className="guide-direct-answer">{intro}</p> : null}
          </header>

          <div className="legal-content">{children}</div>

          {cta ? <div className="guide-cta">{cta}</div> : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
