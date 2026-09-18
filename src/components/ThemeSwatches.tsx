import styles from '../styles/App.module.css'

const sizeClass = { sm: 'swatchesSm', md: '', lg: 'swatchesLg' } as const

/** 主题的「背景 / 强调 / 正文」三色条，是选择器和卡片共同的识别符号。 */
export default function ThemeSwatches({
  colors,
  size = 'md',
}: {
  colors: readonly [string, string, string]
  size?: keyof typeof sizeClass
}) {
  const variant = sizeClass[size]
  return (
    <span
      className={[styles.swatches, variant && styles[variant]].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {colors.map((color) => (
        <span key={color} style={{ background: color }} />
      ))}
    </span>
  )
}
