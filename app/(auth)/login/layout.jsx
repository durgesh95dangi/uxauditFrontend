import { createPageMetadata } from "../../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Log In",
  description: "Sign in to your UXAuditX account to run website audits and view reports.",
  path: "/login"
});

export default function LoginLayout({ children }) {
  return children;
}
