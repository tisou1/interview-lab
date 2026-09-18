export type ThemeMode = 'light' | 'dark'

export interface Theme {
  id: ThemeId
  label: string
  mode: ThemeMode
  /** 色卡预览与 `meta[theme-color]` 使用：背景 / 强调 / 正文 */
  swatches: readonly [string, string, string]
}

const themeList = [
  {
    id: 'vitesse-light',
    label: 'Vitesse Light',
    mode: 'light',
    swatches: ['#f9f8f5', '#1e7a5f', '#393a34'],
  },
  {
    id: 'vitesse-dark',
    label: 'Vitesse Dark',
    mode: 'dark',
    swatches: ['#121212', '#4d9375', '#dbd7ca'],
  },
  {
    id: 'github-light',
    label: 'GitHub Light',
    mode: 'light',
    swatches: ['#f6f8fa', '#0969da', '#1f2328'],
  },
  {
    id: 'github-dark',
    label: 'GitHub Dark',
    mode: 'dark',
    swatches: ['#0d1117', '#2f81f7', '#e6edf3'],
  },
  {
    id: 'nord-dark',
    label: 'Nord',
    mode: 'dark',
    swatches: ['#2e3440', '#88c0d0', '#eceff4'],
  },
  {
    id: 'catppuccin-mocha',
    label: 'Catppuccin Mocha',
    mode: 'dark',
    swatches: ['#1e1e2e', '#cba6f7', '#cdd6f4'],
  },
] as const

export type ThemeId = (typeof themeList)[number]['id']

export const themes: readonly Theme[] = themeList
export const defaultTheme: ThemeId = 'vitesse-light'

const themeMap = new Map<ThemeId, Theme>(themes.map((theme) => [theme.id, theme] as const))

export function themeById(id: ThemeId): Theme {
  return themeMap.get(id) ?? themes[0]
}

export function themeMode(id: ThemeId): ThemeMode {
  return themeById(id).mode
}

/**
 * 把持久化或导入的主题值收敛为已知主题 id。
 * 旧版本只保存 `light` / `dark`，分别映射到默认的 Vitesse 浅色与深色；
 * 未知值返回 undefined，由校验层决定拒绝还是回落。
 */
export function toThemeId(value: unknown): ThemeId | undefined {
  if (typeof value !== 'string') return undefined
  if (value === 'light') return 'vitesse-light'
  if (value === 'dark') return 'vitesse-dark'
  return themeMap.has(value as ThemeId) ? (value as ThemeId) : undefined
}
