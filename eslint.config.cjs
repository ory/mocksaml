const js = require('@eslint/js');
const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');
const prettier = require('eslint-config-prettier');
const i18next = require('eslint-plugin-i18next');

module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'out/**', 'build/**', 'eslint.config.cjs', 'next-env.d.ts'],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  i18next.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-anonymous-default-export': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'i18next/no-literal-string': 'off',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
