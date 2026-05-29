import Link from "next/link";
import SchemaMarkup from "../../components/SchemaMarkup.jsx";
import GuideLayout, { GuideSection } from "../../components/guide/GuideLayout.jsx";
import { createAbsoluteTitleMetadata, SITE_URL } from "../../lib/metadata.js";

export const metadata = createAbsoluteTitleMetadata({
  title:
    "Why Is My Website Not Converting? 8 Common Causes (And Fixes) | UXAuditX",
  description:
    "Visitors but no signups? Here are 8 common reasons your website isn't converting — from weak headlines to mobile layout problems — and plain fixes for each one.",
  path: "/why-is-my-website-not-converting"
});

const FAQ_ITEMS = [
  {
    q: "How do I know if my landing page has conversion problems?",
    a: "If you're getting traffic but few signups, purchases, or contact form submissions, something on the page is getting in the way. Common landing page issues include unclear headlines, hard-to-find buttons, and layouts that break on phones. A UX audit shows you exactly where visitors get stuck — with screenshots."
  },
  {
    q: "Can I fix conversion issues without hiring a designer?",
    a: "Many fixes are copy and layout changes you can make yourself: shorten a headline, brighten a button, add a privacy link, or fix text that's too small on mobile. A UX audit gives you a prioritized list with specific suggestions, so you know what to change first even without design experience."
  },
  {
    q: "Why does my site convert on desktop but not on mobile?",
    a: "More than half of visitors are on phones. Buttons that look fine on a large screen may be too small to tap, text may wrap awkwardly, and key actions may sit below the fold. If you only review your site on a laptop, you'll miss landing page issues that cost you mobile conversions."
  },
  {
    q: "What's the fastest way to find out why visitors aren't converting?",
    a: "Paste your URL into UXAuditX and run a free UX audit. You'll get a report in under a minute with the biggest problems ranked first — each with a screenshot of where it is on your page and a plain suggestion for what to fix."
  }
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Why Is My Website Not Converting? 8 Common Causes (And Fixes)",
  description:
    "Eight common reasons your website isn't converting visitors — and plain-English fixes for each one.",
  author: {
    "@type": "Organization",
    name: "UXAuditX",
    url: SITE_URL
  },
  publisher: {
    "@type": "Organization",
    name: "UXAuditX",
    url: SITE_URL
  },
  datePublished: "2025-05-29",
  dateModified: "2025-05-29",
  mainEntityOfPage: `${SITE_URL}/why-is-my-website-not-converting`
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a
    }
  }))
};

export default function WhyIsMyWebsiteNotConvertingPage() {
  return (
    <>
      <SchemaMarkup schema={articleSchema} />
      <SchemaMarkup schema={faqSchema} />

      <GuideLayout
        eyebrow="Conversion guide"
        title="Why is my website not converting visitors?"
        intro="Most websites lose visitors for fixable reasons on the page itself — a confusing headline, a button that's hard to see, or a layout that breaks on phones. You don't need more traffic first. You need to find what's blocking the people who are already there."
        cta={
          <>
            <h2 className="guide-cta-title">
              Find out what&apos;s holding your site back
            </h2>
            <p className="guide-cta-body">
              Run a free UX audit and get a prioritized list of landing page
              issues — each with a screenshot and a plain fix. Most reports are
              ready in under a minute.
            </p>
            <Link href="/" className="btn btn-primary">
              Run a free audit to find out what&apos;s holding your site back →
            </Link>
          </>
        }
      >
        <GuideSection title="1. Your headline doesn't explain what you do">
          <p>
            A visitor lands on your page and has about five seconds to decide
            whether to stay. If your headline is clever but vague — or tries to
            say everything at once — most people will leave without scrolling.
            They shouldn&apos;t have to guess what you sell or who it&apos;s
            for.
          </p>
          <p>
            This is one of the most common landing page issues we see in a UX
            audit. The fix is usually simple: say what you do, who it&apos;s
            for, and why it matters — in plain words, above the fold. Drop the
            jargon and the puns. &quot;Website UX audits with screenshots&quot;
            beats &quot;Unlock your digital potential&quot; every time.
          </p>
          <p>
            Read your headline as if you&apos;ve never heard of your company.
            If a stranger can&apos;t explain your offer back to you in one
            sentence, rewrite it until they can.
          </p>
        </GuideSection>

        <GuideSection title="2. Your CTA button is hard to see">
          <p>
            You can have the perfect offer and still lose signups because the
            button blends into the background. Low contrast, thin borders, or
            placing the main action below a wall of text all make it easy to
            miss. Visitors shouldn&apos;t have to hunt for what to click next.
          </p>
          <p>
            Open your page and squint. Can you still spot the primary button
            within two seconds? If not, that&apos;s likely costing you
            conversions. A UX audit flags these spots with a screenshot so you
            can see exactly how invisible the button looks in context — not
            just in isolation on a design mockup.
          </p>
          <p>
            The fix: use a color that stands out from everything around it,
            add enough padding so it feels tappable on a phone, and use clear
            action text like &quot;Start free audit&quot; instead of vague
            labels like &quot;Learn more.&quot;
          </p>
        </GuideSection>

        <GuideSection title="3. The page looks broken on mobile">
          <p>
            More than half your visitors are on a phone. If your page only looks
            good on a laptop, you&apos;re silently turning away most of your
            traffic. Common mobile landing page issues include text that wraps
            into awkward lines, buttons too small to tap, images that overflow
            the screen, and sections that overlap or get cut off.
          </p>
          <p>
            Many founders check their site on desktop during development and
            never revisit it on an actual phone. That gap shows up constantly
            in UX audit reports — critical buttons pushed below the fold,
            headlines that break across four lines, forms that are painful to
            fill in with a thumb.
          </p>
          <p>
            Fix it by reviewing every key page on both phone and computer. If
            something feels cramped or hard to tap, it probably is. Your mobile
            layout deserves the same attention as desktop — not an afterthought.
          </p>
        </GuideSection>

        <GuideSection title="4. Visitors don't trust you yet">
          <p>
            People decide whether to trust you long before they read every word
            on your page. Missing privacy links, no refund policy, absent
            reviews, stock photos instead of real faces, and vague contact
            details all signal &quot;this might not be safe.&quot; That
            hesitation kills conversions even when your product is solid.
          </p>
          <p>
            Trust signals matter most right before someone pays or submits
            personal information. A UX audit checks for the basics: footer
            links to privacy and terms, visible security cues near checkout or
            signup, social proof near your main offer, and contact details that
            feel real.
          </p>
          <p>
            You don&apos;t need dozens of testimonials on day one. Start with
            what you have — a clear privacy link, an honest refund policy, one
            or two real customer quotes — and place them where hesitation
            actually happens.
          </p>
        </GuideSection>

        <GuideSection title="5. The page loads too slowly">
          <p>
            Slow pages don&apos;t just frustrate people — they leave before
            your headline even finishes loading. Large images, heavy scripts,
            and content that jumps around as the page builds all erode trust in
            the first few seconds. Many visitors won&apos;t wait to find out if
            the rest of the page is worth it.
          </p>
          <p>
            Speed is one piece of a broader picture, but it&apos;s a real
            conversion killer. When we run a UX audit, slow sections and layout
            shift often show up alongside clearer landing page issues like weak
            CTAs or confusing copy. Fixing speed alone won&apos;t save a page
            with a broken message — but a fast page with other problems is
            still easier to diagnose.
          </p>
          <p>
            Compress images, defer non-essential scripts, and test on a real
            phone with a normal connection — not just office Wi‑Fi on a MacBook.
          </p>
        </GuideSection>

        <GuideSection title="6. There's no clear next step">
          <p>
            Some pages read well but never tell the visitor what to do. One
            button competes with three others. Links scatter attention in every
            direction. The main action sits far below content that never ends.
            When everything is important, nothing is — and people leave without
            clicking anything.
          </p>
          <p>
            Every section should answer: &quot;What should I do now?&quot; Your
            primary action should repeat at natural decision points — after the
            headline, after benefits, near the bottom. Secondary links belong
            in the footer, not competing with your main CTA in the hero.
          </p>
          <p>
            Run a UX audit and look at whether each screen has one obvious
            next step. If you have to think about it, your visitors already
            gave up and clicked back to Google.
          </p>
        </GuideSection>

        <GuideSection title="7. Too much text, not enough clarity">
          <p>
            Long pages aren&apos;t the problem — unclear pages are. Walls of
            text without headings, feature lists written for insiders, and
            paragraphs that repeat the same point three times all make visitors
            work too hard. They came to decide something, not to read a manual.
          </p>
          <p>
            Landing page issues around clarity often hide in plain sight: ten
            bullet points where three would do, technical terms your customer
            never uses, benefits buried under company history. A UX audit
            catches readability problems — tiny font sizes, low contrast, dense
            blocks — that make even good copy feel exhausting.
          </p>
          <p>
            Cut ruthlessly. Lead with what the visitor gets, use short
            paragraphs and clear headings, and read every sentence asking:
            &quot;Would my customer care about this right now?&quot; If not,
            delete it or move it elsewhere.
          </p>
        </GuideSection>

        <GuideSection title="8. You're not checking both desktop and mobile">
          <p>
            A page can look polished on a 27-inch monitor and fall apart on an
            iPhone. Different screen sizes expose different landing page
            issues — a headline that fits on one line on desktop may wrap
            messily on mobile; a sidebar that helps on wide screens may push
            your CTA out of view on a phone.
          </p>
          <p>
            Checking only one device gives you a false sense of confidence. A
            proper UX audit reviews both desktop and mobile separately and
            flags problems on each — because the fix for one isn&apos;t always
            the fix for the other. You might need a shorter headline on mobile,
            a sticky CTA bar, or different image crops entirely.
          </p>
          <p>
            Make it a habit: every time you change your homepage or a key
            landing page, check it on both. Or paste the URL into{" "}
            <Link href="/">UXAuditX</Link> and let the audit show you side by
            side what visitors actually see on each device.
          </p>
        </GuideSection>

        <GuideSection title="Frequently asked questions">
          <dl className="guide-faq">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="guide-faq-item">
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </GuideSection>
      </GuideLayout>
    </>
  );
}
