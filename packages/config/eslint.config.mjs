import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Shared flat ESLint config for all TypeScript packages in the monorepo.
 * Next.js apps extend this and layer `eslint-config-next` on top.
 */
export default tseslint.config(
  {
    ignores: ['**/.next/**', '**/dist/**', '**/node_modules/**', '**/generated/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
