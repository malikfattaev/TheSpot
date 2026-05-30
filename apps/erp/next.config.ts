import path from 'node:path';
import { createRequire } from 'node:module';
import type { NextConfig } from 'next';

const require = createRequire(import.meta.url);

const builtinGlobalNotFound =
  require.resolve('next/dist/client/components/builtin/global-not-found.js');

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  transpilePackages: ['@thespot/db', '@thespot/config'],
  reactStrictMode: true,
  webpack(config) {
    // Next emits this relative request for its default `_not-found` route when
    // the app is nested under `apps/*`; point it back to the root install.
    config.resolve.alias[
      '../node_modules/next/dist/client/components/builtin/global-not-found.js'
    ] = builtinGlobalNotFound;
    return config;
  },
};

export default nextConfig;
