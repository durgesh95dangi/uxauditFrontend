/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Heavy native deps used by the audit engine should not be bundled
  serverExternalPackages: ["playwright", "sharp", "@aws-sdk/client-s3"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }
    ]
  },
  async headers() {
    return [
      {
        source: "/pricing",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate"
          }
        ]
      },
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate"
          }
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
