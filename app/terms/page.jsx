import LegalLayout, { LegalSection } from "../../components/legal/LegalLayout.jsx";
import { createPageMetadata } from "../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern your use of UXAuditX. Please read them carefully before using the service.",
  path: "/terms"
});

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="22 May 2025"
      intro="Please read these Terms of Service carefully before using UXAuditX. By accessing or using our service, you agree to be bound by these terms."
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing and using UXAuditX (&quot;the Service&quot;), you accept and
          agree to be bound by these Terms of Service and our Privacy Policy. If you
          do not agree to these terms, please do not use our Service. These Terms
          apply to all visitors, users, and others who access or use the Service. We
          reserve the right to update these Terms at any time. Continued use of the
          Service after any changes constitutes your acceptance of the new Terms.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <p>
          UXAuditX provides an automated website UX auditing platform that analyses
          websites for usability, conversion optimisation, performance, trust
          signals, and accessibility issues. The Service generates AI-powered reports
          with actionable recommendations. The Service is provided &quot;as is&quot;
          and we make no warranties regarding the accuracy, completeness, or fitness
          for a particular purpose of any audit results.
        </p>
      </LegalSection>

      <LegalSection title="3. Account Registration">
        <p>
          To use certain features of the Service, you must create an account. You
          agree to:
        </p>
        <ul>
          <li>
            Provide accurate, current, and complete information during registration
          </li>
          <li>Maintain the security of your account credentials</li>
          <li>Promptly notify us of any unauthorised use of your account</li>
          <li>Take responsibility for all activities that occur under your account</li>
        </ul>
        <p>You must be at least 18 years of age to create an account and use the Service.</p>
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Audit websites you do not own or have explicit permission to audit</li>
          <li>Scrape, crawl, or systematically extract data beyond normal use</li>
          <li>Attempt to reverse-engineer, decompile, or disassemble the Service</li>
          <li>Transmit any malicious code, viruses, or harmful data</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Resell or redistribute audit reports without prior written consent</li>
          <li>Use the Service for any unlawful or fraudulent purpose</li>
        </ul>
        <p>We reserve the right to terminate accounts that violate these restrictions.</p>
      </LegalSection>

      <LegalSection title="5. Intellectual Property">
        <p>
          All content, features, and functionality of UXAuditX — including but not
          limited to text, graphics, logos, and software — are the exclusive property
          of UXAuditX and are protected by copyright, trademark, and other
          intellectual property laws. You retain ownership of the URLs and websites
          you audit. The audit reports generated are licensed to you for personal and
          internal business use only. You may not resell, sublicense, or publicly
          redistribute reports without our express written permission.
        </p>
      </LegalSection>

      <LegalSection title="6. Subscription & Billing">
        <p>Some features of the Service require a paid subscription. By subscribing:</p>
        <ul>
          <li>You authorise us to charge your payment method on a recurring basis</li>
          <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
          <li>All fees are non-refundable except as described in our Refund Policy</li>
          <li>Prices are subject to change with 30 days&apos; notice</li>
          <li>You are responsible for all applicable taxes</li>
        </ul>
        <p>
          Payment details for paid plans are handled by our payment provider. Your
          payment information is never stored on our servers.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of Liability">
        <p>
          To the fullest extent permitted by law, UXAuditX shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages —
          including loss of profits, data, goodwill, or other intangible losses —
          resulting from your use of or inability to use the Service. In no event
          shall our total liability to you exceed the amount you paid us in the 12
          months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimer of Warranties">
        <p>
          The Service is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis without warranties of any kind, either express or
          implied. We do not warrant that the Service will be uninterrupted,
          error-free, or free of viruses or other harmful components. Audit results
          are generated by automated AI analysis and should be treated as
          recommendations, not guarantees. We are not responsible for any decisions
          made based on audit results.
        </p>
      </LegalSection>

      <LegalSection title="9. Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the laws
          of India, without regard to its conflict of law provisions. Any disputes
          arising from these Terms shall be subject to the exclusive jurisdiction of
          courts in India.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact Us">
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>
          Email: <a href="mailto:hello@uxauditx.com">hello@uxauditx.com</a>
          <br />
          Website: <a href="https://uxauditx.com">https://uxauditx.com</a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
