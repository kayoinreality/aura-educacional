// Flat config compartilhado.
// Apps específicos podem estender ou sobrescrever.
export default [
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.turbo/**'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
];
