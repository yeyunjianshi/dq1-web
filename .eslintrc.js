module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 2,
    '@typescript-eslint/no-unused-vars': 1,
    '@typescript-eslint/no-inferrable-types': 1,
    '@typescript-eslint/no-empty-function': 1,
    'prefer-const': 1,
  },
}
