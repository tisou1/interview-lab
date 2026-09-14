import { Link, useNavigate, useParams } from 'react-router'
import { useEffect } from 'react'
import { questions, questionMap } from '../data/questions'
import { Empty, useQuestion } from '../components/ui'
import { useLearning } from '../storage/store'
import QuestionWorkspace from '../components/QuestionWorkspace'
import styles from '../styles/App.module.css'

export default function Detail() {
  const id = Number(useParams().id)
  const meta = questionMap.get(id)
  const { question, error } = useQuestion(id)
  const item = useLearning(s => s.details[id])
  const ensureDetail = useLearning(s => s.ensureDetail)
  const navigate = useNavigate()
  const index = questions.findIndex(q => q.id === id)
  useEffect(() => { if (meta) ensureDetail(meta) }, [meta, ensureDetail])
  if (!meta) return <Empty title="这道题暂时不在题库中" to="/questions">题目可能已被移除，已有学习记录会保留。</Empty>
  if (error) return <Empty title="题目加载失败" to="/questions">请刷新重试，或返回题库选择其他题目。</Empty>
  return <><div className={styles.sectionHeading}><Link className={styles.textLink} to="/questions">← 返回题库</Link><span className={styles.muted}>独立思考，然后对照</span></div>{question && item ? <QuestionWorkspace key={item.recordId} question={question} item={item} context={{ kind: 'detail', questionId: id }} previous={index > 0 ? () => navigate(`/questions/${questions[index - 1].id}`) : undefined} next={index < questions.length - 1 ? () => navigate(`/questions/${questions[index + 1].id}`) : undefined}/> : <p role="status">正在加载题目…</p>}</>
}
