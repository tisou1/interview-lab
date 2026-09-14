import roadmap from '../data/generated/roadmap.json'
import { HtmlContent, PageHeader } from '../components/ui'
import styles from '../styles/App.module.css'
export default function Roadmap() { return <><PageHeader eyebrow="A PATH TO DEEPER UNDERSTANDING" title="12 周，走得更深入。" description="从执行模型到项目架构，把原理学习、动手实践与求职表达连起来。"/><article className={`${styles.card} ${styles.roadmap}`}><HtmlContent html={roadmap.html}/></article></> }
