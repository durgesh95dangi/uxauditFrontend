import { createPageMetadata } from "../../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Reset Password",
  description: "Choose a new password for your UXAuditX account.",
  path: "/reset-password"
});

export default function ResetPasswordLayout({ children }) {
  return children;
}
