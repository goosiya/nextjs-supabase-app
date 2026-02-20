import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // 검사 제외 경로
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      'types/database.types.ts',
      '*.config.{js,mjs,ts}',
      'postcss.config.mjs',
    ],
  },
  // Next.js 권장 규칙 + TypeScript 지원
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Prettier와 충돌하는 ESLint 규칙 비활성화 (반드시 마지막에 위치)
  ...compat.extends('prettier'),
  {
    rules: {
      // TypeScript 관련
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // React 관련
      'react/self-closing-comp': 'error',

      // 일반 코드 품질
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]

export default eslintConfig
