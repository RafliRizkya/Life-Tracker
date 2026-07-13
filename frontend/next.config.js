/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
