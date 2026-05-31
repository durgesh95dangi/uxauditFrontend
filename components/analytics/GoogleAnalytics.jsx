import Script from "next/script";
import { GA_MEASUREMENT_ID, isGa4Enabled } from "../../lib/analytics/ga4.js";

/**
 * Official Google tag (gtag.js) — single instance in root layout <head> only.
 * @see https://developers.google.com/tag-platform/gtagjs/install
 */
export default function GoogleAnalytics() {
  if (!isGa4Enabled()) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
