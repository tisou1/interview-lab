import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { questions } from '../data/questions'
import { categoryNames, difficultyNames, typeNames } from '../types'
import { filterQuestions } from '../lib/learning'
import { useLearning } from '../storage/store'
import { Badge, ConfirmDialog, Empty, Icon, PageHeader } from '../components/ui'
import styles from '../styles/App.module.css'

const tags = [...new Set(questions.flatMap(q => q.tags))].sort()
export default function Questions({ review = false }: { review?: boolean }) {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [replace, setReplace] = useState(false)
  const progress = useLearning(s => s.progress)
  const favorite = useLearning(s => s.favorite)
  const filters = useLearning(s => s.filters)
  const previousFilters = useRef(filters)
  const setFilters = useLearning(s => s.setFilters)
  const practice = useLearning(s => s.practice)
  const start = useLearning(s => s.start)
  const navigate = useNavigate()
  const effective = new URLSearchParams(params)
  if (review && !effective.get('status')) effective.set('status', 'due')
  const result = filterQuestions(questions, effective, progress)
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next, { replace: key === 'q' }) }
  useEffect(() => { setQuery(params.get('q') ?? '') }, [params.get('q')])
  useEffect(() => { const timer = setTimeout(() => { if (query !== (params.get('q') ?? '')) update('q', query) }, 200); return () => clearTimeout(timer) }, [query, params])
  useEffect(() => { if (!review && params.toString()) setFilters(params.toString()) }, [params, review, setFilters])
  const begin = () => { start('practice', result, 0); navigate('/practice/session') }
  return <>
    <PageHeader eyebrow={review ? 'REVIEW & REMEMBER' : 'THE QUESTION LIBRARY'} title={review ? '让知识，留得更久。' : '前端知识，逐题拆解。'} description={review ? '从不会到模糊，再到掌握。给记忆一点时间，也给自己一次复习。' : `${questions.length} 道题，覆盖原理、代码与项目场景。找到今天想深入的那个问题。`} action={<button className={styles.primary} disabled={!result.length} onClick={() => practice && !practice.completedAt ? setReplace(true) : begin()}><Icon name="play" size={15}/>练习当前列表</button>}/>
    <div className={styles.tabs}>{(review ? [['due', '到期待复习'], ['wrong', '错题与模糊'], ['favorite', '我的收藏'], ['', '全部题目']] : [['', '全部题目'], ['new', '未学习'], ['favorite', '我的收藏'], ['wrong', '错题与模糊']]).map(([value, label]) => <button key={label} className={`${styles.tab} ${(effective.get('status') ?? '') === value || (value === '' && effective.get('status') === 'all') ? styles.selected : ''}`} onClick={() => update('status', review && !value ? 'all' : value)}>{label}</button>)}</div>
    <section className={`${styles.card} ${styles.filters}`} aria-label="题库筛选"><label className={styles.searchField}><Icon name="search" size={18}/><input aria-label="搜索题目" placeholder="搜索题目、关键词或编号，例如：闭包、React…" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button className={styles.iconButton} aria-label="清空搜索" onClick={() => { setQuery(''); update('q', '') }}><Icon name="close" size={16}/></button>}</label>
      <div className={styles.filterRow}>{([['category', '专题', categoryNames], ['type', '题型', typeNames], ['difficulty', '难度', difficultyNames]] as const).map(([key, label, options]) => <label className={styles.field} key={key}>{label}<select value={params.get(key) ?? ''} onChange={e => update(key, e.target.value)}><option value="">全部{label}</option>{Object.entries(options).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>)}<label className={styles.field}>标签<select value={params.get('tag') ?? ''} onChange={e => update('tag', e.target.value)}><option value="">全部标签</option>{tags.map(tag => <option key={tag}>{tag}</option>)}</select></label></div>
    </section>
    <div className={styles.sectionHeading}><span className={styles.muted}>找到 <strong>{result.length}</strong> 道题{query && ` · “${query}”`}</span><div className={styles.actions}><select aria-label="排序" value={params.get('sort') ?? ''} onChange={e => update('sort', e.target.value)}><option value="">按题目编号</option><option value="difficulty">按难度</option><option value="recent">按最近复习</option></select><button className={styles.iconButton} onClick={() => update('view', params.get('view') === 'compact' ? '' : 'compact')} aria-pressed={params.get('view') === 'compact'} aria-label="切换紧凑视图"><Icon name="menu"/></button>{params.toString() && <button className={styles.tab} onClick={() => { setQuery(''); setParams({}); setFilters('') }}>重置</button>}{!params.toString() && previousFilters.current && <button className={styles.tab} onClick={() => setParams(previousFilters.current)}>恢复上次筛选</button>}</div></div>
    {result.length ? <div className={`${styles.questionList} ${params.get('view') === 'compact' ? styles.compact : ''}`}>{result.map(question => <article className={styles.questionRow} key={question.id}><span className={styles.questionNumber}>{String(question.id).padStart(3, '0')}</span><Link className={styles.questionLink} to={`/questions/${question.id}`}><h3>{question.title}</h3><div className={styles.questionMeta}><span>{categoryNames[question.category]}</span><span>{typeNames[question.type]}</span><span>{difficultyNames[question.difficulty]}</span><span>{question.estimatedMinutes} 分钟</span></div></Link><Badge mastery={progress[question.id]?.mastery}/><button className={`${styles.iconButton} ${progress[question.id]?.favorite ? styles.favorite : ''}`} aria-label={`${progress[question.id]?.favorite ? '取消收藏' : '收藏'}题目 ${question.id}`} aria-pressed={!!progress[question.id]?.favorite} onClick={() => favorite(question.id)}><Icon name="star" size={17}/></button></article>)}</div> : <Empty title={review && effective.get('status') === 'due' ? '今天的复习已安排妥当' : '没有找到符合条件的题目'}>{review ? '可以切换到错题、收藏，或开始一组新练习。' : '试试其他关键词，或清除部分筛选条件。'}</Empty>}
    {replace && <ConfirmDialog title="开始新的练习？" confirmLabel="开始新练习" onClose={() => setReplace(false)} onConfirm={begin}><p>将替换当前未完成的练习场次。已保存的草稿、自评和学习记录会保留。</p></ConfirmDialog>}
  </>
}
