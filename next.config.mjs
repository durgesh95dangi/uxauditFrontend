/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Heavy native deps used by the audit engine should not be bundled
  serverExternalPackages: ["playwright", "sharp", "@aws-sdk/client-s3"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" }
    ]
  }
};

export default nextConfig;
