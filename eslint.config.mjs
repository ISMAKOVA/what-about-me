import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['**/node_modules/**', '.next/**', 'out/**', 'build/**'],
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tseslint,
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // base
      ...js.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...tseslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // prettier
      'prettier/prettier': 'error',

      // imports
      // Disabled because Prettier (prettier-plugin-organize-imports) will reorder imports.
      // Keeping both enabled causes conflicts where Prettier and ESLint disagree about
      // group spacing/ordering. Rely on Prettier for import organization and keep
      // import/no-unresolved / import/no-cycle for correctness.
      'import/order': 'off',
      'import/no-unresolved': 'error',
      'import/no-cycle': 'warn',

      // typescript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off', // optional

      // react
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/react-in-jsx-scope': 'off', // Next.js handles React import
    },
  },
];
