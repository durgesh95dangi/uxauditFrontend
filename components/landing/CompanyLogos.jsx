const COMPANIES = [
  "Northbeam",
  "Lumen Labs",
  "Quartz",
  "Beacon",
  "Tidal",
  "Mosaic"
];

export default function CompanyLogos() {
  return (
    <section className="company-band" aria-label="Companies using UXAuditX">
      <div className="container">
        <p className="company-band-label">
          Trusted by founders and teams using UXAuditX
        </p>
        <div className="company-band-row">
          {COMPANIES.map((name) => (
            <span key={name} className="company-logo">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
