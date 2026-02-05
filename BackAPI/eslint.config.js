import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        document: 'readonly', // Pour les scripts avec Puppeteer
      },
    },
    rules: {
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_|^e$',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-useless-escape': 'warn', // Avertissement au lieu d'erreur
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '__tests__/**'],
  },
];
