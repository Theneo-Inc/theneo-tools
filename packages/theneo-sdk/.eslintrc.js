module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'node',
    'prettier',
    "security",
    "sonarjs",
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
    "plugin:security/recommended",
    "plugin:sonarjs/recommended"
  ],
  rules: {
    'no-process-exit': 'off',
    'prettier/prettier': 'warn',
    'node/no-missing-import': 'off',
    'node/no-empty-function': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-require': 'off',
    'node/shebang': 'off',
    'require-await':'error',
    'no-return-await':'error',
    'consistent-return': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    quotes: ['warn', 'single', {avoidEscape: true}],
    'node/no-unpublished-import': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    "security/detect-non-literal-fs-filename": 'off',
    "security/detect-non-literal-require": 'off',
    "no-constant-condition": "warn",
    "@typescript-eslint/no-unused-vars":"warn",
    "@typescript-eslint/explicit-function-return-type": ["error", {
      "allowExpressions": true,
      "allowTypedFunctionExpressions": true
    }],
    "@typescript-eslint/explicit-module-boundary-types": ["error", {
      "allowArgumentsExplicitlyTypedAsAny": true
    }]
  },
};
