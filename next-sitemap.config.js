/** @type {import('next-sitemap').IConfig} */

const SITEMAP_PATHS = [
  "/",
  "/pricing",
  "/how-it-works",
  "/faq",
  "/what-is-a-ux-audit",
  "/landing-page-audit",
  "/free-website-audit-tool",
  "/why-is-my-website-not-converting",
  "/website-usability-checklist"
];

export default {
  siteUrl: "https://uxauditx.com",
  generateRobotsTxt: false,
  outDir: "public",
  changefreq: "weekly",
  priority: 0.8,
  exclude: [
    "/admin",
    "/admin/*",
    "/dashboard",
    "/profile",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/*",
    "/api/*"
  ],
  additionalPaths: async (config) =>
    SITEMAP_PATHS.map((path) => ({
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString()
    }))
};
