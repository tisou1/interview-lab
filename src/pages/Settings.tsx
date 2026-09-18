import { useRef, useState } from 'react'
import type { SavedData } from '../types'
import { exportData, STORAGE_KEY, useLearning, useStorageStatus } from '../storage/store'
import { decodeBackup } from '../storage/validation'
import { localDate } from '../lib/learning'
import { themes } from '../lib/themes'
import ThemeSwatches from '../components/ThemeSwatches'
import { ConfirmDialog, Icon, PageHeader } from '../components/ui'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import styles from '../styles/App.module.css'

function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export default function Settings() {
  const theme = useLearning((s) => s.theme)
  const setTheme = useLearning((s) => s.setTheme)
  const importData = useLearning((s) => s.importData)
  const clear = useLearning((s) => s.clear)
  const records = useLearning((s) => s.records)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState<SavedData | null>(null)
  const [clearConfirm, setClearConfirm] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  async function readFile(file?: File) {
    if (!file) return
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('文件超过 20 MB')
      setPending(decodeBackup(await file.text()))
      setMessage('')
      toast.success('备份校验通过', { description: '确认后将替换当前学习数据。' })
    } catch (error) {
      const detail = `导入失败：${error instanceof Error ? error.message : '请检查 JSON 文件'}`
      setMessage(detail)
      toast.error('无法导入备份', { description: detail })
    }
    if (input.current) input.current.value = ''
  }
  return (
    <>
      <PageHeader
        eyebrow="YOUR SPACE, YOUR DATA"
        title="把学习记录，留在自己手里。"
        description="数据保存在当前浏览器。定期导出备份，可以在另一台设备上导入继续学习。"
      />
      <div className={styles.configLayout}>
        <section className={styles.card}>
          <div className={styles.settingsRow}>
            <h3>界面主题</h3>
            <p>6 套编辑器配色。选择后立即生效，并记在这台设备上。</p>
            <div className={styles.themeGrid} role="group" aria-label="界面主题">
              {themes.map((item) => {
                const active = item.id === theme
                return (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={active}
                    className={`${styles.themeCard} ${active ? styles.themeCardActive : ''}`}
                    onClick={() => setTheme(item.id)}
                  >
                    <ThemeSwatches colors={item.swatches} size="lg" />
                    <span className={styles.themeCardName}>{item.label}</span>
                    <span className={styles.themeCardMeta}>
                      {item.mode === 'dark' ? '深色' : '浅色'}
                      {active ? ' · 当前' : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className={styles.settingsRow}>
            <h3>导出学习数据</h3>
            <p>包含草稿、收藏、复习计划、场次、设置和 {records.length} 条历史记录。</p>
            <Button
              variant="outline"
              onClick={() => {
                window.dispatchEvent(new Event('learning:flush'))
                download(exportData(), `interview-lab-${localDate()}.json`)
                setMessage('已生成学习数据备份。')
                toast.success('学习数据已导出')
              }}
            >
              <Icon name="download" size={16} />
              导出 JSON 备份
            </Button>
          </div>
          <div className={styles.settingsRow}>
            <h3>导入学习数据</h3>
            <p>先校验备份格式，确认后替换当前数据。不会将两份历史记录重复合并。</p>
            <input
              ref={input}
              aria-label="选择学习数据备份"
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => void readFile(e.target.files?.[0])}
            />
            <Button variant="outline" onClick={() => input.current?.click()}>
              选择备份文件
            </Button>
          </div>
          <div className={styles.settingsRow}>
            <h3>恢复原始备份</h3>
            <p>如果检测到本地数据损坏，可以导出保留的原始内容以便排查。</p>
            <button
              onClick={() => {
                try {
                  const keys = Object.keys(localStorage).filter((key) =>
                    key.startsWith(`${STORAGE_KEY}:corrupt:`),
                  )
                  const backup = Object.fromEntries(
                    keys.map((key) => [key, localStorage.getItem(key)]),
                  )
                  if (!keys.length) {
                    const raw = localStorage.getItem(STORAGE_KEY)
                    if (raw) backup[STORAGE_KEY] = raw
                  }
                  if (!Object.keys(backup).length) {
                    setMessage('当前没有可导出的原始数据。')
                    return
                  }
                  download(JSON.stringify(backup, null, 2), `interview-lab-raw-${localDate()}.json`)
                } catch {
                  setMessage('浏览器不允许读取本地存储。')
                }
              }}
            >
              导出原始数据
            </button>
          </div>
          <div className={styles.settingsRow}>
            <h3>清空学习空间</h3>
            <p>删除当前草稿、收藏、学习进度和历史记录。题库内容不受影响。</p>
            <Button variant="destructive" onClick={() => setClearConfirm(true)}>
              清空学习数据
            </Button>
          </div>
          <p role="status" className={styles.notice}>
            {message || '备份文件只在你的设备上处理。'}
          </p>
        </section>
        <aside className={styles.card}>
          <h3>关于这个学习空间</h3>
          <ul className={styles.notes}>
            <li>无需账号，学习记录保存在当前浏览器。</li>
            <li>清除浏览器网站数据或更换设备后，需要导入备份才能恢复。</li>
            <li>题库由 Markdown 构建更新，新增题目不会重置已有题目的学习进度。</li>
            <li>旧备份中不存在的历史记录，不会被补造为趋势数据。</li>
          </ul>
        </aside>
      </div>
      {pending && (
        <ConfirmDialog
          title="用备份替换当前学习数据？"
          confirmLabel="确认导入"
          onClose={() => setPending(null)}
          onConfirm={() => {
            importData(pending)
            const failed = useStorageStatus.getState().error
            setMessage(
              failed
                ? '已载入备份，但本地保存存在异常，请查看上方提示。'
                : '导入完成，学习进度和历史记录已恢复。',
            )
            if (failed) toast.warning('备份已载入，但保存异常')
            else toast.success('学习数据已恢复')
          }}
        >
          <p>
            备份包含 {Object.keys(pending.progress).length} 道题的进度、{pending.records.length}{' '}
            条记录和 {pending.history.length} 个历史场次。当前数据将被替换，建议先导出备份。
          </p>
        </ConfirmDialog>
      )}
      {clearConfirm && (
        <ConfirmDialog
          title="清空当前浏览器中的学习数据？"
          confirmLabel="确认清空"
          onClose={() => setClearConfirm(false)}
          onConfirm={() => {
            clear()
            setMessage('学习空间已重置；如需恢复，请导入之前导出的备份。')
            toast.success('学习空间已重置')
          }}
        >
          <p>这会清空草稿、收藏、进度、练习场次和统计历史。只有已有备份才能恢复。</p>
        </ConfirmDialog>
      )}
    </>
  )
}
