/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Improve file watching and hot reloading on Windows
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Windows: avoid stale numeric chunks (e.g. missing ./948.js) after HMR or build+dev overlap
      config.cache = false
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      }
    }
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      }
    }
    return config
  },
}

module.exports = nextConfig

