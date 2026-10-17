import { useEffect, useRef } from 'react'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import {
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete'
import { tags } from '@lezer/highlight'
import { type CodeLanguage } from '../lib/codeLanguage'

const languageLoaders: Record<CodeLanguage, () => Promise<Extension>> = {
  text: () => Promise.resolve([]),
  javascript: () => import('@codemirror/lang-javascript').then((module) => module.javascript()),
  typescript: () =>
    import('@codemirror/lang-javascript').then((module) => module.javascript({ typescript: true })),
  html: () => import('@codemirror/lang-html').then((module) => module.html()),
  css: () => import('@codemirror/lang-css').then((module) => module.css()),
}

// 高亮与编辑器都消费 tokens.css 的 --syn-* 语义色，切主题时无需重建编辑器。
const highlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: 'var(--syn-comment)', fontStyle: 'italic' },
  { tag: [tags.keyword, tags.modifier, tags.operatorKeyword], color: 'var(--syn-keyword)' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--syn-string)' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--syn-number)' },
  {
    tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.labelName],
    color: 'var(--syn-function)',
  },
  { tag: [tags.typeName, tags.className, tags.tagName, tags.namespace], color: 'var(--syn-type)' },
  { tag: [tags.variableName, tags.propertyName, tags.attributeName], color: 'var(--syn-variable)' },
  { tag: [tags.operator, tags.punctuation, tags.bracket], color: 'var(--syn-operator)' },
])

const editorTheme = EditorView.theme({
  '&': {
    border: '1px solid var(--line)',
    borderRadius: '8px',
    background: 'var(--code-bg)',
    color: 'var(--text)',
    fontSize: '13px',
  },
  '&.cm-focused': { outline: 'none', borderColor: 'var(--border-strong)' },
  '.cm-scroller': { fontFamily: "Consolas, 'Cascadia Code', monospace", lineHeight: '1.7' },
  '.cm-content': { padding: '10px 0' },
  '.cm-gutters': { background: 'transparent', color: 'var(--muted)', border: 'none' },
  '.cm-activeLine': { background: 'var(--hover)' },
  '.cm-activeLineGutter': { background: 'transparent' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--text)' },
  '.cm-selectionBackground': { background: 'var(--accent-soft)' },
  '.cm-tooltip': { background: 'var(--surface)', border: '1px solid var(--line)' },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    background: 'var(--accent-soft)',
    color: 'var(--text)',
  },
})

export default function CodeEditor({
  value,
  onChange,
  language,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  language: CodeLanguage
  ariaLabel: string
  className?: string
}) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const change = useRef(onChange)
  const valueRef = useRef(value)

  useEffect(() => {
    change.current = onChange
  }, [onChange])

  // value 通过 valueRef 读取，编辑器只在语言或可访问名变化时重建，避免每次输入都重建。
  useEffect(() => {
    const parent = host.current
    if (!parent) return
    const languageCompartment = new Compartment()
    const instance = new EditorView({
      parent,
      state: EditorState.create({
        doc: valueRef.current,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          drawSelection(),
          dropCursor(),
          rectangularSelection(),
          history(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          indentOnInput(),
          syntaxHighlighting(highlightStyle),
          keymap.of([
            ...closeBracketsKeymap,
            ...completionKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            indentWithTab,
          ]),
          EditorState.tabSize.of(2),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
          languageCompartment.of([]),
          editorTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) change.current(update.state.doc.toString())
          }),
        ],
      }),
    })
    view.current = instance
    languageLoaders[language]()
      .then((extension) => {
        if (view.current === instance)
          instance.dispatch({ effects: languageCompartment.reconfigure(extension) })
      })
      .catch(() => undefined)
    return () => {
      view.current = null
      instance.destroy()
    }
  }, [language, ariaLabel])

  useEffect(() => {
    valueRef.current = value
    const instance = view.current
    if (!instance) return
    const current = instance.state.doc.toString()
    if (current !== value)
      instance.dispatch({ changes: { from: 0, to: current.length, insert: value } })
  }, [value])

  return <div ref={host} className={className} />
}
