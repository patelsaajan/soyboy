// eslint-config-next 16 ships native flat configs, so FlatCompat (and its
// @eslint/eslintrc dependency) is no longer needed — the compat layer was
// throwing "Converting circular structure to JSON" against ESLint 9.39.
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import next from 'eslint-config-next/typescript'

const eslintConfig = [
  ...coreWebVitals,
  ...next,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: [
      '.next/',
      '.open-next/',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'src/migrations/',
      'src/app/(payload)/admin/importMap.js',
    ],
  },
]

export default eslintConfig
