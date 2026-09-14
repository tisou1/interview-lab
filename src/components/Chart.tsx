import { useId, useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
import styles from '../styles/App.module.css'

export interface ChartPoint { label: string; value: number; color?: string }
export function BarChart({ title, description, points, unit = '', horizontal = false }: { title: string; description?: string; points: ChartPoint[]; unit?: string; horizontal?: boolean }) {
  const id = useId()
  const reduced = useReducedMotion()
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...points.map(point => point.value))
  const width = 640, height = horizontal ? Math.max(180, points.length * 42) : 190
  const step = horizontal ? 40 : (width - 60) / Math.max(1, points.length)
  const total = points.reduce((sum, point) => sum + point.value, 0)
  return <section className={styles.chartCard} aria-labelledby={id}>
    <div className={styles.sectionHeading}><div><h3 id={id}>{title}</h3>{description && <p>{description}</p>}</div><span className={styles.chartTooltip} aria-live="polite">{active !== null ? `${points[active].label} · ${points[active].value}${unit}` : ''}</span></div>
    <svg viewBox={`0 0 ${width} ${height + 36}`} className={styles.chart} role="img" aria-label={`${title}，${total === 0 ? '暂无记录' : `共 ${points.length} 项数据，详情见下表`}`}>
      {!horizontal && [0, 0.5, 1].map(fraction => <g key={fraction}><line x1="38" y1={height - fraction * (height - 20)} x2={width} y2={height - fraction * (height - 20)} className={styles.gridLine}/><text x="0" y={height - fraction * (height - 20) + 4}>{Math.round(max * fraction * 10) / 10}</text></g>)}
      {points.map((point, index) => {
        const x = horizontal ? 132 : 44 + index * step
        const y = horizontal ? index * step + 10 : height - point.value / max * (height - 20)
        const w = horizontal ? point.value / max * (width - 195) : Math.max(2, step * 0.55)
        const h = horizontal ? 14 : point.value / max * (height - 20)
        return <g key={index} tabIndex={0} role="img" aria-label={`${point.label}：${point.value}${unit}`} onFocus={() => setActive(index)} onBlur={() => setActive(null)} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}>
          <title>{point.label}：{point.value}{unit}</title>
          {horizontal && <rect x={x} y={y} width={width - 195} height={h} rx="4" className={styles.track}/>}
          <m.rect x={x} y={y} width={Math.max(w, 1)} height={Math.max(h, 1)} rx="3" fill={point.color ?? 'var(--chart)'} initial={reduced ? false : { opacity: 0, scaleY: horizontal ? 1 : 0.01, scaleX: horizontal ? 0.01 : 1 }} animate={{ opacity: active === null || active === index ? 1 : 0.5, scaleX: 1, scaleY: 1 }} style={{ originX: 0, originY: 1 }} transition={{ duration: reduced ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}/>
          {(horizontal || points.length < 15 || index % Math.ceil(points.length / 7) === 0) && <text x={horizontal ? 0 : x + w / 2} y={horizontal ? y + 12 : height + 24} textAnchor={horizontal ? 'start' : 'middle'}>{point.label}</text>}
          {horizontal && <text x={width - 46} y={y + 12}>{point.value}{unit}</text>}
        </g>
      })}
    </svg>
    {total === 0 && <p className={styles.muted}>暂无数据，完成练习后会显示真实记录。</p>}
    <details className={styles.dataTable}><summary>查看数据表</summary><div className={styles.tableWrap}><table><caption>{title}</caption><thead><tr><th scope="col">项目</th><th scope="col">数值{unit && `（${unit}）`}</th></tr></thead><tbody>{points.map((point, index) => <tr key={index}><th scope="row">{point.label}</th><td>{point.value}</td></tr>)}</tbody></table></div></details>
  </section>
}
