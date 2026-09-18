import { defineConfig } from 'oxfmt'

export default defineConfig({
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  // 与仓库既有风格一致：单引号、无分号。
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  arrowParens: 'always',
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  objectWrap: 'preserve',
  proseWrap: 'preserve',
  endOfLine: 'lf',
  insertFinalNewline: true,
  // 保持导入与类名顺序稳定，避免产生无意义的排序 diff。
  sortImports: false,
  sortTailwindcss: false,
  sortPackageJson: { sortScripts: false },
  // 题库源、归档资料与生成物不属于格式化范围。
  ignorePatterns: [
    'fe',
    '前端面试题学习网站开发计划书.md',
    'src/data/generated',
    'pnpm-lock.yaml',
    'node_modules',
    'dist',
    'coverage',
    'test-results',
    'playwright-report',
  ],
})
