/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { esmExternals: false, webpackBuildWorker: true },
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      // Local dev: app-gateway calls http://localhost:4000/oauth/token
      { source: '/oauth/:path*', destination: '/api/cigna-auth0/oauth/:path*' },
      // Local dev: app-gateway calls http://localhost:4000/rtde/v1/userinfo etc.
      { source: '/rtde/:path*', destination: '/api/cigna-auth0/rtde/:path*' },
      // .well-known can't be a Next.js directory name
      {
        source: '/.well-known/openid-configuration',
        destination: '/api/cigna-auth0/well-known/openid-configuration',
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        zlib: false,
      };
    }

    return config;
  },
};
