import { Suspense } from "react";
import { createPageMetadata } from "../../../lib/metadata.js";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Sign Up",
  description:
    "Create a free UXAuditX account and start auditing your website for UX and conversion issues.",
  path: "/signup"
});

export default function SignupLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
