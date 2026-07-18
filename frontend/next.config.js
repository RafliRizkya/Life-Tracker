/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
  // Dev server only (ignored by `next build`/`next start`). Defaults keep only
  // 5 pages compiled and dispose them after 60s idle — with ~9 routes in this
  // app, navigating between sections kept evicting and recompiling routes on
  // every visit, which is what "terasa lambat dan seperti stuck" actually was.
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60,
    pagesBufferLength: 15,
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
