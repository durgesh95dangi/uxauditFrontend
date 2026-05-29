import Link from "next/link";
import { IconScan } from "../landing/LandingIcons.jsx";

export default function BrandLogo({ href = "/", className = "" }) {
  return (
    <Link href={href} className={`brand-logo${className ? ` ${className}` : ""}`}>
      <span className="brand-logo-mark" aria-hidden="true">
        <IconScan size={16} />
      </span>
      <span className="brand-logo-text">UXAuditX</span>
    </Link>
  );
}
