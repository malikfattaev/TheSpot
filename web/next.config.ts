import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Self-contained build for the Railway Docker image.
  output: 'standalone',
  // Trace files from the monorepo root so workspace deps are bundled correctly.
  outputFileTracingRoot: path.join(import.meta.dirname, '..'),
  // Workspace packages ship TypeScript source and are compiled by Next.
  transpilePackages: ['@thespot/db', '@thespot/config'],
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
