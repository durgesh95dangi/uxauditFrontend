import Link from "next/link";
import { IconScan } from "../landing/LandingIcons.jsx";

export default function BrandLogo({ href = "/", className = "", disabled = false }) {
  const content = (
    <>
      <span className="brand-logo-mark" aria-hidden="true">
        <IconScan size={16} />
      </span>
      <span className="brand-logo-text">UXAuditX</span>
    </>
  );

  if (disabled) {
    return (
      <span
        className={`brand-logo brand-logo--disabled${className ? ` ${className}` : ""}`}
        aria-disabled="true"
      >
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={`brand-logo${className ? ` ${className}` : ""}`}>
      {content}
    </Link>
  );
}
