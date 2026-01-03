/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Improve file watching and hot reloading on Windows
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable polling for file watching (better for Windows)
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding once the first file changed
        ignored: /node_modules/, // Ignore node_modules
      }
    }
    return config
  },
}

module.exports = nextConfig

