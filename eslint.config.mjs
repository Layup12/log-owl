import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'dist-electron/**',
      'node_modules/**',
      'main/preload.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['main/**/*.ts', 'renderer/**/*.ts', 'renderer/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['scripts/**/*.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['renderer/**/*.tsx', 'renderer/**/*.ts'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
  {
    files: ['main/**/*.ts', 'contracts/**/*.ts', 'scripts/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  prettierConfig
)
