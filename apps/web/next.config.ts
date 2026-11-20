import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const hosts = (process.env.IMAGE_HOSTS ?? '').split(',').map(host => host.trim()).filter(Boolean);
if (hosts.some(host => !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(host))) {
  throw new Error('IMAGE_HOSTS must contain exact public DNS hostnames');
}
const config: NextConfig = {
  poweredByHeader: false,
  experimental: { cpus: 1 },
  turbopack: { root: fileURLToPath(new URL('../..', import.meta.url)) },
  images: {
    unoptimized: process.env.PORTFOLIO_WORKER_BUILD === '1',
    remotePatterns: hosts.map(hostname => ({ protocol: 'https' as const, hostname, pathname: '/**' })),
    dangerouslyAllowSVG: false,
    maximumRedirects: 0,
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};
export default config;
