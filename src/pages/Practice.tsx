import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { questions } from '../data/questions'
import { categoryNames, difficultyNames, type Category, type Difficulty } from '../types'
import { drawQuestions } from '../lib/learning'
import { useLearning } from '../storage/store'
import { ConfirmDialog, Icon, PageHeader } from '../components/ui'
import { AppSelect } from '@/components/ui/app-select'
import { Button } from '@/components/ui/button'
import styles from '../styles/App.module.css'

export default function Practice({ mode }: { mode: 'practice' | 'mock' }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('')
  const [count, setCount] = useState(5)
  const [minutes, setMinutes] = useState(30)
  const [coding, setCoding] = useState(true)
  const [priority, setPriority] = useState(false)
  const [random, setRandom] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const progress = useLearning((s) => s.progress)
  const active = useLearning((s) => s[mode])
  const history = useLearning((s) => s.history)
  const start = useLearning((s) => s.start)
  const navigate = useNavigate()
  const mock = mode === 'mock'
  const pool = questions.filter(
    (q) =>
      (!categories.length || categories.includes(q.category)) &&
      (!difficulty || q.difficulty === difficulty) &&
      (coding || q.type !== 'coding'),
  )
  const begin = () => {
    start(mode, drawQuestions(pool, count, progress, priority, random), minutes)
    navigate(`/${mode}/session`)
  }
  return (
    <>
      <PageHeader
        eyebrow={mock ? 'A REAL INTERVIEW, AT YOUR PACE' : 'ONE QUESTION AT A TIME'}
        title={mock ? '给自己一场模拟面试。' : '为今天，安排一组练习。'}
        description={
          mock
            ? '限定时间，独立作答。交卷后再查看题解，对自己的表达做一次复盘。'
            : '选择想练习的专题与难度，先思考，再对照答案，最后做一次诚实的自评。'
        }
      />
      {active && !active.completedAt && (
        <div className={styles.resume}>
          <p>
            你有一场未完成的{mock ? '模拟面试' : '练习'} · 第 {active.currentIndex + 1} /{' '}
            {active.items.length} 题
          </p>
          <Link className={styles.secondary} to={`/${mode}/session`}>
            继续上次{mock ? '面试' : '练习'}
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      )}
      <div className={styles.configLayout}>
        <section className={styles.card}>
          <h2>{mock ? '面试设置' : '练习设置'}</h2>
          <p className={styles.muted} style={{ marginTop: 7 }}>
            不选择专题时，从全部题库中抽取。
          </p>
          <fieldset style={{ border: 0, padding: 0, margin: '24px 0 0' }}>
            <legend className={styles.muted}>选择专题</legend>
            <div className={styles.categoryChecks}>
              {Object.entries(categoryNames)
                .filter(([key]) => questions.some((q) => q.category === key))
                .map(([key, name]) => (
                  <label
                    className={`${styles.categoryCheck} ${categories.includes(key as Category) ? styles.selected : ''}`}
                    key={key}
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(key as Category)}
                      onChange={() =>
                        setCategories((old) =>
                          old.includes(key as Category)
                            ? old.filter((c) => c !== key)
                            : [...old, key as Category],
                        )
                      }
                    />
                    {name}
                  </label>
                ))}
            </div>
          </fieldset>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              难度
              <AppSelect
                label="难度"
                value={difficulty}
                onValueChange={(value) => setDifficulty(value as Difficulty | '')}
                options={[
                  { value: '', label: '全部难度' },
                  ...Object.entries(difficultyNames).map(([value, label]) => ({ value, label })),
                ]}
              />
            </label>
            <label className={styles.field}>
              题量
              <AppSelect
                label="题量"
                value={String(count)}
                onValueChange={(value) => setCount(Number(value))}
                options={[5, 10, 15, 20].map((value) => ({
                  value: String(value),
                  label: `${value} 道题`,
                }))}
              />
            </label>
            {mock && (
              <label className={styles.field}>
                总时长（分钟）
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                />
              </label>
            )}
          </div>
          <div className={styles.stack} style={{ gap: 14 }}>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={coding}
                onChange={(e) => setCoding(e.target.checked)}
              />
              包含代码题
            </label>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
              />
              优先抽取不会、模糊的题目
            </label>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={random}
                onChange={(e) => setRandom(e.target.checked)}
              />
              打乱题目顺序
            </label>
          </div>
          <p className={styles.notice}>
            符合条件 {pool.length} 道 · 本次抽取 {Math.min(pool.length, count)} 道
            {pool.length < count ? '（题目不足时使用全部符合条件的题目）' : ''}
          </p>
          <Button
            size="lg"
            disabled={
              !pool.length || (mock && (!Number.isFinite(minutes) || minutes < 1 || minutes > 180))
            }
            onClick={() => (active && !active.completedAt ? setConfirm(true) : begin())}
          >
            <Icon name={mock ? 'mock' : 'play'} size={16} />
            {mock ? '开始模拟面试' : '开始练习'}
          </Button>
        </section>
        <aside className={styles.card}>
          <div className={styles.eyebrow}>{mock ? 'BEFORE YOU BEGIN' : 'HOW TO PRACTICE'}</div>
          <h2>{mock ? '把它当作真正的面试' : '一组练习，四个步骤'}</h2>
          <ol className={styles.notes}>
            {(mock
              ? [
                  '准备好安静的环境，开始后倒计时不会暂停。',
                  '逐题口述或填写提纲，标记已回答、不会和待复查。',
                  '面试过程中不提供答案入口，可以前后切题。',
                  '时间结束自动交卷，也可以提前交卷。',
                  '报告只反映回答状态和自评，不进行自动判分。',
                ]
              : [
                  '先独立思考，口述或写下回答提纲。',
                  '展开核心答案，再按需查看各层解析。',
                  '标记不会、模糊或掌握，生成复习安排。',
                  '继续下一题，也可以明确跳过。',
                ]
            ).map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ol>
          <p className={styles.muted}>
            草稿和练习进度会保存在当前浏览器。刷新后，可以继续上次场次。
          </p>
        </aside>
      </div>
      {mock && history.some((s) => s.mode === 'mock') && (
        <section className={styles.card} style={{ marginTop: 24 }}>
          <h3>历史模拟面试</h3>
          {history
            .filter((s) => s.mode === 'mock')
            .slice()
            .reverse()
            .map((s) => (
              <Link className={styles.topicRow} to={`/mock/report/${s.id}`} key={s.id}>
                <Icon name="mock" />
                <div className={styles.topicInfo}>
                  <h3>{s.items.length} 题模拟面试</h3>
                  <p>{new Date(s.startedAt).toLocaleString('zh-CN')}</p>
                </div>
                <span className={styles.textLink}>查看自评报告 →</span>
              </Link>
            ))}
        </section>
      )}
      {confirm && (
        <ConfirmDialog
          title={`开始新的${mock ? '模拟面试' : '练习'}？`}
          onConfirm={begin}
          onClose={() => setConfirm(false)}
          confirmLabel="开始新场次"
        >
          <p>将替换当前未完成的场次。已保存的草稿和学习记录会保留。</p>
        </ConfirmDialog>
      )}
    </>
  )
}
