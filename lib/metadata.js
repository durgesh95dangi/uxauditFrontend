export const SITE_URL = "https://uxauditx.com";
export const SITE_NAME = "UXAuditX";

const DEFAULT_DESCRIPTION =
  "Find what's stopping your visitors from buying. Complete UX audit in under a minute with visual proof and step-by-step fixes.";

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  noIndex = false,
  openGraphTitle,
  openGraphDescription
}) {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;

  return {
    title,
    description,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
      url,
      type: "website",
      siteName: SITE_NAME
    },
    alternates: {
      canonical: url
    }
  };
}

export function createAbsoluteTitleMetadata({
  title,
  description,
  path = "",
  noIndex = false,
  openGraphTitle,
  openGraphDescription
}) {
  const url = path ? `${SITE_URL}${path}` : SITE_URL;

  return {
    title: { absolute: title },
    description,
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
      url,
      type: "website",
      siteName: SITE_NAME
    },
    alternates: {
      canonical: url
    }
  };
}
