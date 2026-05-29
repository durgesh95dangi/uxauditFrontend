import { createPageMetadata } from "../../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Forgot Password",
  description: "Reset your UXAuditX account password.",
  path: "/forgot-password"
});

export default function ForgotPasswordLayout({ children }) {
  return children;
}
