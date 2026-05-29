import LegalLayout, { LegalSection } from "../../components/legal/LegalLayout.jsx";
import { createPageMetadata } from "../../lib/metadata.js";

export const metadata = createPageMetadata({
  title: "Refund Policy",
  description:
    "Our straightforward refund process, including a 7-day money-back guarantee on your first paid subscription.",
  path: "/refund"
});

const HIGHLIGHTS = [
  {
    icon: "✅",
    title: "7-Day Guarantee",
    body: "Full refund within 7 days of your first paid subscription charge, no questions asked."
  },
  {
    icon: "⚡",
    title: "Fast Processing",
    body: "Approved refunds are processed within 5–10 business days back to your original payment method."
  },
  {
    icon: "📧",
    title: "Easy Request",
    body: "Email hello@uxauditx.com with your account email and reason. That's all we need."
  }
];

export default function RefundPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      lastUpdated="22 May 2025"
      intro="We stand behind the quality of UXAuditX. If you are not satisfied, we offer a straightforward refund process. Please read below for full details."
    >
      <div className="legal-highlights">
        {HIGHLIGHTS.map((item) => (
          <div key={item.title} className="legal-highlight">
            <span className="legal-highlight-icon" aria-hidden="true">
              {item.icon}
            </span>
            <h3 className="legal-highlight-title">{item.title}</h3>
            <p className="legal-highlight-body">{item.body}</p>
          </div>
        ))}
      </div>

      <LegalSection title="1. Overview">
        <p>
          UXAuditX operates on a subscription model with monthly and annual billing
          options. We want you to be fully satisfied with our Service. This Refund
          Policy explains when and how you can request a refund. By subscribing to a
          paid plan, you agree to this Refund Policy. We reserve the right to update
          this policy at any time.
        </p>
      </LegalSection>

      <LegalSection title="2. Free Plan">
        <p>
          UXAuditX offers a free tier with limited audits. No payment is required for
          the free plan and therefore no refunds apply. We encourage you to test the
          Service on the free plan before upgrading to a paid subscription.
        </p>
      </LegalSection>

      <LegalSection title="3. 7-Day Money-Back Guarantee">
        <p>
          If you are unsatisfied with UXAuditX after upgrading to a paid plan for the
          first time, you may request a full refund within 7 calendar days of your
          initial charge. To be eligible for this guarantee:
        </p>
        <ul>
          <li>
            This must be your first paid subscription (not a re-subscription after
            cancellation)
          </li>
          <li>The request must be submitted within 7 days of the charge date</li>
          <li>
            You must contact us at{" "}
            <a href="mailto:hello@uxauditx.com">hello@uxauditx.com</a> with your
            account email
          </li>
        </ul>
        <p>We will process your refund with no questions asked.</p>
      </LegalSection>

      <LegalSection title="4. Subscription Renewals">
        <p>
          After the 7-day guarantee period, subscription renewal charges are
          generally non-refundable. However, we will consider refund requests on a
          case-by-case basis in the following situations:
        </p>
        <ul>
          <li>You were charged for a renewal after clearly attempting to cancel</li>
          <li>A technical error caused a duplicate charge</li>
          <li>
            You experienced significant service downtime (&gt;24 consecutive hours)
            during the billing period
          </li>
        </ul>
        <p>
          Please contact us within 7 days of a renewal charge if you believe you are
          entitled to a refund under these circumstances.
        </p>
      </LegalSection>

      <LegalSection title="5. Annual Plans">
        <p>
          Annual subscriptions offer a discounted rate in exchange for a 12-month
          commitment. Refund eligibility for annual plans:
        </p>
        <ul>
          <li>
            <strong>Within 7 days of the initial annual charge:</strong> Full refund
            available under our money-back guarantee
          </li>
          <li>
            <strong>After 7 days but within 30 days:</strong> Pro-rated refund for
            unused months, minus a processing fee of ₹500 (or $6 USD)
          </li>
          <li>
            <strong>After 30 days:</strong> No refund is available for annual
            subscriptions
          </li>
        </ul>
        <p>
          If you downgrade from annual to monthly billing, no partial refund is issued
          for the remaining annual period.
        </p>
      </LegalSection>

      <LegalSection title="6. Non-Refundable Items">
        <p>The following are not eligible for refunds:</p>
        <ul>
          <li>Free plan usage (no charges apply)</li>
          <li>Add-on credits or one-time purchases that have already been consumed</li>
          <li>
            Subscription periods where the Service was used extensively (more than 50
            audits run)
          </li>
          <li>Refund requests submitted after the eligible window has passed</li>
          <li>Accounts terminated for Terms of Service violations</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. How to Request a Refund">
        <p>To request a refund, please:</p>
        <ul>
          <li>
            Email us at <a href="mailto:hello@uxauditx.com">hello@uxauditx.com</a>{" "}
            with the subject line &quot;Refund Request&quot;
          </li>
          <li>Include your account email address</li>
          <li>Include the date of the charge you wish to refund</li>
          <li>
            Optionally, tell us why you&apos;re leaving — your feedback helps us
            improve
          </li>
        </ul>
        <p>
          We aim to respond to all refund requests within 2 business days. Approved
          refunds are returned to the original payment method within 5–10 business
          days, depending on your bank or card issuer.
        </p>
      </LegalSection>

      <LegalSection title="8. Chargebacks">
        <p>
          We strongly encourage you to contact us before initiating a chargeback with
          your bank or card issuer. We work hard to resolve issues quickly and fairly.
          Initiating a chargeback without first contacting us may result in your
          account being suspended while the dispute is under review. If a chargeback is
          found to be invalid, you will be responsible for any associated chargeback
          fees.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <p>
          We reserve the right to modify this Refund Policy at any time. Changes will
          be communicated via email or a notice within the app. Your continued use of
          the Service after changes take effect constitutes acceptance of the updated
          policy.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact Us">
        <p>Have questions about a charge or refund? We&apos;re happy to help.</p>
        <p>
          Email: <a href="mailto:hello@uxauditx.com">hello@uxauditx.com</a>
          <br />
          Website: <a href="https://uxauditx.com">https://uxauditx.com</a>
        </p>
        <p>We typically respond within 1–2 business days.</p>
      </LegalSection>
    </LegalLayout>
  );
}
