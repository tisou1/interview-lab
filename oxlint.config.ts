import { defineConfig } from 'oxlint'

export default defineConfig({
  // 设置 plugins 会覆盖默认插件集合，因此 eslint / typescript / unicorn / oxc 需要显式列出。
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'react', 'import', 'promise', 'vitest'],
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
  env: { browser: true },
  settings: { react: { version: '19.3.0' } },
  ignorePatterns: [
    'fe',
    '前端面试题学习网站开发计划书.md',
    'src/data/generated',
    'dist',
    'coverage',
    'test-results',
    'playwright-report',
  ],
  rules: {
    // 解构剩余参数时故意丢弃字段，不应视为未使用变量。
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    // React 19 使用自动 JSX runtime，组件文件不再需要引入 React。
    'react/react-in-jsx-scope': 'off',
    // 样式副作用导入是 Vite 的标准用法（global.css / @fontsource），测试还需要 jest-dom 的副作用导入。
    'import/no-unassigned-import': [
      'error',
      { allow: ['**/*.css', '@fontsource-variable/**', '@testing-library/jest-dom/**'] },
    ],
    // 终端的 then 回调只做状态更新，本来就无需返回值。
    'promise/always-return': 'off',
    // tsconfig 的 lib 为 ES2022，Array#toSorted / toReversed 不在类型库中，无法通过类型检查。
    'unicorn/no-array-sort': 'off',
    'unicorn/no-array-reverse': 'off',
  },
  overrides: [
    {
      files: ['scripts/**/*.mjs', '*.config.ts'],
      env: { node: true },
    },
    {
      files: ['tests/**/*.ts', 'tests/**/*.tsx'],
      env: { browser: true, node: true },
    },
  ],
})
