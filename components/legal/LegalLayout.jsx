import Link from "next/link";
import SiteNav from "../layout/SiteNav.jsx";
import SiteFooter from "../layout/SiteFooter.jsx";

export function LegalSection({ title, children }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function LegalLayout({ title, lastUpdated, intro, children }) {
  return (
    <div className="page-shell">
      <SiteNav minimal />

      <main className="legal-main">
        <div className="container legal-container">
          <Link href="/" className="legal-back">
            ← Back to home
          </Link>

          <header className="legal-header">
            <p className="legal-eyebrow">Legal</p>
            <h1 className="legal-title">{title}</h1>
            {lastUpdated ? (
              <p className="legal-updated">Last updated: {lastUpdated}</p>
            ) : null}
            {intro ? <p className="legal-intro">{intro}</p> : null}
          </header>

          <div className="legal-content">{children}</div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
