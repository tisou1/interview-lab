import { useId } from 'react'
import ThemeSwatches from './ThemeSwatches'
import { Icon } from './ui'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { themeById, themes } from '../lib/themes'
import { useLearning } from '../storage/store'
import styles from '../styles/App.module.css'

export default function ThemeMenu() {
  const theme = useLearning((s) => s.theme)
  const setTheme = useLearning((s) => s.setTheme)
  const labelId = useId()
  const current = themeById(theme)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.themeTrigger}`}
          aria-label={`界面主题：${current.label}`}
        >
          <Icon name="palette" size={17} />
          <ThemeSwatches colors={current.swatches} size="sm" />
        </button>
      </PopoverTrigger>
      <PopoverContent className={styles.themePanel}>
        <p className={styles.themePanelLabel} id={labelId}>
          界面主题
        </p>
        <ul className={styles.themeList} aria-labelledby={labelId}>
          {themes.map((item) => {
            const active = item.id === theme
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  className={`${styles.themeOption} ${active ? styles.themeOptionActive : ''}`}
                  onClick={() => setTheme(item.id)}
                >
                  <ThemeSwatches colors={item.swatches} />
                  <span className={styles.themeName}>{item.label}</span>
                  <span className={styles.themeMode}>{item.mode === 'dark' ? '深色' : '浅色'}</span>
                  <span className={styles.themeCheck}>
                    {active && <Icon name="check" size={14} />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className={styles.themePanelNote}>切换后立即生效，并记在这台设备上。</p>
      </PopoverContent>
    </Popover>
  )
}
