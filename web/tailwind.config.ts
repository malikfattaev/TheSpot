import preset from '@thespot/config/tailwind-preset';
import type { Config } from 'tailwindcss';

export default {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
