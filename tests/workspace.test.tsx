import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import QuestionWorkspace from '../src/components/QuestionWorkspace'
import { questions } from '../src/data/questions'
import { useLearning } from '../src/storage/store'
import { emptyData } from '../src/storage/validation'
import type { Question } from '../src/types'
const question: Question = { ...questions[0], promptHtml: '<p>独立思考题干</p>', answerSections: [{ id: 'test-answer', title: '核心答案', html: '<p>核心答案正文</p>' }, { id: 'test-follow', title: '追问', html: '<p>追问正文</p>' }] }
function Workspace() { const item = useLearning(s => s.details[1]); return <BrowserRouter><QuestionWorkspace question={question} item={item} context={{ kind: 'detail', questionId: 1 }}/></BrowserRouter> }
beforeEach(() => { useLearning.setState(emptyData()); useLearning.getState().ensureDetail(question) })
describe('active recall interaction', () => {
  it('initially hides answers, reveals only the first section, then saves self-assessment', () => {
    render(<Workspace/>); expect(screen.queryByText('核心答案正文')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /查看参考答案/ }))
    expect(screen.getByText('核心答案正文')).toBeVisible()
    expect(screen.queryByText('追问正文')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /追问/ }))
    expect(screen.getByText('追问正文')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '2 · 模糊' }))
    expect(useLearning.getState().progress[1].mastery).toBe('hard')
    expect(useLearning.getState().records).toHaveLength(1)
  })
  it('does not activate global shortcuts inside a draft', () => {
    render(<Workspace/>); const draft = screen.getByRole('textbox', { name: '回答草稿' })
    fireEvent.change(draft, { target: { value: 'F R 123' } }); fireEvent.keyDown(draft, { key: 'f' }); fireEvent.keyDown(draft, { code: 'Space', key: ' ' })
    expect(useLearning.getState().progress[1].favorite).toBe(false)
    expect(useLearning.getState().progress[1].draft).toBe('F R 123')
    expect(screen.queryByText('核心答案正文')).not.toBeInTheDocument()
  })
  it('does not render answers while a mock is active, even from the question route', () => {
    useLearning.getState().start('mock', [question], 10)
    render(<Workspace/>); expect(screen.queryByRole('button', { name: /查看参考答案/ })).not.toBeInTheDocument()
    fireEvent.keyDown(document.body, { code: 'Space', key: ' ' })
    expect(screen.queryByText('核心答案正文')).not.toBeInTheDocument()
  })
})
