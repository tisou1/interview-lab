import { describe, expect, it } from 'vitest'
import { defaultTheme, themeById, themeMode, themes, toThemeId } from '../src/lib/themes'
import type { ThemeId } from '../src/lib/themes'
import { emptyData, validateData } from '../src/storage/validation'

describe('theme registry', () => {
  it('lists six unique themes with complete swatches', () => {
    expect(themes).toHaveLength(6)
    expect(new Set(themes.map((theme) => theme.id)).size).toBe(6)
    for (const theme of themes) {
      expect(theme.label).not.toBe('')
      expect(['light', 'dark']).toContain(theme.mode)
      expect(theme.swatches).toHaveLength(3)
      for (const swatch of theme.swatches) expect(swatch).toMatch(/^#[0-9a-f]{6}$/)
    }
    expect(themeMode(defaultTheme)).toBe('light')
  })

  it('maps legacy light/dark values and rejects unknown themes', () => {
    expect(toThemeId('light')).toBe('vitesse-light')
    expect(toThemeId('dark')).toBe('vitesse-dark')
    expect(toThemeId('nord-dark')).toBe('nord-dark')
    expect(toThemeId('solarized-light')).toBeUndefined()
    expect(toThemeId(undefined)).toBeUndefined()
    expect(toThemeId(2)).toBeUndefined()
  })

  it('falls back to the default theme for an unknown id', () => {
    expect(themeById('github-dark').label).toBe('GitHub Dark')
    expect(themeById('missing' as ThemeId)).toEqual(themes[0])
  })

  it('rejects an unknown persisted theme in stored data', () => {
    expect(() => validateData({ ...emptyData(), theme: 'solarized-light' as ThemeId })).toThrow(
      '偏好设置无效',
    )
  })
})
