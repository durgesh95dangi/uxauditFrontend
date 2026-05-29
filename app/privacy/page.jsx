import LegalLayout, { LegalSection } from "../../components/legal/LegalLayout.jsx";
import { createPageMetadata } from "../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "What data UXAuditX collects, why we collect it, and how we protect it. We never sell your personal data.",
  path: "/privacy"
});

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="22 May 2025"
      intro="Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it. We never sell your personal data."
    >
      <LegalSection title="1. Information We Collect">
        <p>We collect the following types of information:</p>
        <ul>
          <li>
            <strong>Account Information:</strong> When you create an account, we
            collect your name, email address, and profile information provided
            through Supabase authentication (including social login providers like
            Google).
          </li>
          <li>
            <strong>Usage Data:</strong> We collect information about how you use
            the Service — including which URLs you audit, audit frequency, feature
            usage, and session data.
          </li>
          <li>
            <strong>Payment Information:</strong> If you subscribe to a paid plan,
            payment details are handled by our payment provider. We do not store
            full credit card details on our servers. We retain billing history and
            subscription status only.
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, browser type, device type,
            operating system, and referring URLs to help diagnose issues and
            improve the Service.
          </li>
          <li>
            <strong>URLs Submitted for Audit:</strong> The URLs you submit are
            processed to generate reports. These are stored securely and associated
            with your account.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <p>We use your information to:</p>
        <ul>
          <li>Provide, operate, and maintain the UXAuditX Service</li>
          <li>Generate UX audit reports for the URLs you submit</li>
          <li>
            Send transactional emails (account confirmation, reports, billing
            receipts)
          </li>
          <li>Send product update emails (you may unsubscribe at any time)</li>
          <li>Detect and prevent fraud, abuse, and security incidents</li>
          <li>Improve the accuracy and quality of our AI analysis</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>
          We do not use your data to train third-party AI models or sell data to
          advertisers.
        </p>
      </LegalSection>

      <LegalSection title="3. Data Sharing & Third Parties">
        <p>
          We share data with trusted third-party service providers only as
          necessary to operate the Service:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — Authentication, database, and backend
            infrastructure
          </li>
          <li>
            <strong>Anthropic</strong> — AI analysis for generating audit reports
          </li>
          <li>
            <strong>Cloudflare R2</strong> — Secure storage for audit screenshots
            and report assets
          </li>
        </ul>
        <p>
          All third-party providers are contractually obligated to handle your data
          securely and in accordance with applicable laws. We do not sell, trade, or
          rent your personal information to any third party.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies & Tracking">
        <p>We use essential cookies to:</p>
        <ul>
          <li>Maintain your authentication session</li>
          <li>Remember your preferences</li>
          <li>Ensure the security of your account</li>
        </ul>
        <p>
          We do not use third-party advertising cookies. You can disable cookies in
          your browser settings, but this may affect your ability to use the
          Service. We may collect aggregate, anonymised usage statistics to improve
          the product. No personally identifiable information is used in these
          insights.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p>
          We retain your data for as long as your account is active. If you delete
          your account:
        </p>
        <ul>
          <li>Your personal information is deleted within 30 days</li>
          <li>
            Audit reports associated with your account are deleted within 30 days
          </li>
          <li>
            Billing records may be retained for up to 7 years for legal and
            accounting compliance
          </li>
          <li>Anonymised, aggregated usage data may be retained indefinitely</li>
        </ul>
        <p>
          You may request deletion of your data at any time by contacting us at{" "}
          <a href="mailto:hello@uxauditx.com">hello@uxauditx.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Security">
        <p>
          We implement industry-standard security measures to protect your data:
        </p>
        <ul>
          <li>All data is encrypted in transit using TLS</li>
          <li>Databases are encrypted at rest</li>
          <li>
            Access to production systems is restricted to authorised personnel only
          </li>
          <li>We conduct regular security reviews</li>
        </ul>
        <p>
          Despite these measures, no method of electronic transmission or storage is
          100% secure. We encourage you to use a strong, unique password and enable
          two-factor authentication.
        </p>
      </LegalSection>

      <LegalSection title="7. Your Rights">
        <p>Depending on your location, you may have the following rights:</p>
        <ul>
          <li>
            <strong>Right to access</strong> — request a copy of the data we hold
            about you
          </li>
          <li>
            <strong>Right to rectification</strong> — request correction of
            inaccurate data
          </li>
          <li>
            <strong>Right to erasure</strong> — request deletion of your personal
            data
          </li>
          <li>
            <strong>Right to restrict processing</strong> — ask us to limit how we
            use your data
          </li>
          <li>
            <strong>Right to data portability</strong> — receive your data in a
            structured format
          </li>
          <li>
            <strong>Right to object</strong> — object to our processing of your data
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:hello@uxauditx.com">hello@uxauditx.com</a>. We will respond
          within 30 days.
        </p>
      </LegalSection>

      <LegalSection title="8. Children's Privacy">
        <p>
          UXAuditX is not intended for use by children under the age of 18. We do not
          knowingly collect personal information from children. If you believe a
          child has provided us with personal data, please contact us and we will
          delete it immediately.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of
          significant changes by email or by posting a prominent notice in the app.
          Your continued use of the Service after changes are posted constitutes your
          acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact Us">
        <p>
          If you have questions about this Privacy Policy or how we handle your data,
          please contact us:
        </p>
        <p>
          Email: <a href="mailto:hello@uxauditx.com">hello@uxauditx.com</a>
          <br />
          Website: <a href="https://uxauditx.com">https://uxauditx.com</a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
