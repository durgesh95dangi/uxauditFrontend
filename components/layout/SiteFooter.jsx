import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#why" },
      { label: "Pricing", href: "/pricing" },
      { label: "How it works", href: "/how-it-works" },
      { label: "FAQ", href: "/#faq" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "What is a UX audit?", href: "/what-is-a-ux-audit" },
      {
        label: "Why isn't my site converting?",
        href: "/why-is-my-website-not-converting"
      },
      { label: "Usability checklist", href: "/website-usability-checklist" },
      { label: "Landing page audit", href: "/landing-page-audit" },
      { label: "Free website audit tool", href: "/free-website-audit-tool" }
    ]
  },
  {
    title: "Account",
    links: [
      { label: "Sign up", href: "/signup" },
      { label: "Log in", href: "/login" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "hello@uxauditx.com", href: "mailto:hello@uxauditx.com" }
    ]
  }
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-intro site-footer-col">
            <p className="site-footer-brand-lg">UXAuditX</p>
            <p className="site-footer-tagline">
              See what&apos;s confusing visitors on your website — and how to fix it.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="site-footer-col">
              <p className="site-footer-eyebrow">{col.title}</p>
              <ul className="site-footer-links">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer-bottom">
          <span>© 2026 UXAuditX</span>
          <nav className="site-footer-legal" aria-label="Legal">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund">Refund Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
