import type { NextConfig } from 'next'
// @ts-expect-error — next-pwa has no types for Next 16
import withPWA from 'next-pwa'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Turbopack is the default in Next.js 16. next-pwa injects a webpack plugin;
  // declare an empty turbopack config so Next.js knows we're intentionally using Turbopack.
  // The service worker will be generated on `next build --webpack` for full PWA support.
  turbopack: {},
}

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})(nextConfig)
