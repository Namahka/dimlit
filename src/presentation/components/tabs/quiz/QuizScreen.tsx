'use client'

import { useState } from 'react'
import type { Question } from './popCultureQuiz'

const LABELS = ['A', 'B', 'C', 'D']

function getScore(score: number, total: number) {
  const pct = score / total
  if (pct >= 0.9) return 'Expert'
  if (pct >= 0.75) return 'Very Impressive'
  if (pct >= 0.5) return 'Solid Knowledge'
  if (pct >= 0.25) return 'Casual Fan'
  return 'Try again!'
}

export function QuizScreen({ title, questions, onBack }: { title: string; questions: Question[]; onBack: () => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [submitted, setSubmitted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)

  function selectAnswer(idx: number) {
    if (submitted) return
    const next = [...answers]
    next[currentQ] = idx
    setAnswers(next)
    setTimeout(() => { if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1) }, 400)
  }

  if (submitted) {
    const score = answers.filter((a, i) => a === questions[i].correctIndex).length
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center" style={{ background: 'var(--bg)' }}>
        <h2 className="text-4xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{score}/{questions.length}</h2>
        <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>{getScore(score, questions.length)}</p>
        <div className="w-full max-w-md text-left space-y-2 mb-8 max-h-64 overflow-y-auto">
          {questions.map((q, i) => {
            if (answers[i] === q.correctIndex) return null
            return (
              <div key={i} className="px-4 py-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{q.question}</p>
                <p className="text-xs text-red-400">You: {answers[i] !== null ? q.options[answers[i]!] : '—'}</p>
                <p className="text-xs text-green-500">Correct: {q.options[q.correctIndex]}</p>
              </div>
            )
          })}
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={() => { setAnswers(Array(questions.length).fill(null)); setSubmitted(false); setCurrentQ(0) }}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-white" style={{ background: 'var(--accent)' }}>
            Try again
          </button>
          <button onClick={onBack} className="flex-1 py-3 rounded-2xl text-sm font-medium" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
            Back
          </button>
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  const answered = answers[currentQ]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} className="text-sm mb-2" style={{ color: 'var(--accent)' }}>← Back</button>
        <div className="flex items-center justify-between">
          <h2 className="font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentQ + 1}/{questions.length}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--accent)' }}>{q.category}</p>
        <h3 className="text-lg font-semibold leading-snug mb-6" style={{ color: 'var(--text)' }}>{q.question}</h3>
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let bg = 'var(--surface)'
            let border = 'var(--border)'
            let textColor = 'var(--text)'
            let labelBg = 'var(--surface-2)'
            let labelColor = 'var(--text-muted)'
            if (answered !== null) {
              if (i === q.correctIndex) { bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.4)'; textColor = '#4ade80'; labelBg = 'rgba(34,197,94,0.2)'; labelColor = '#4ade80' }
              else if (i === answered) { bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.4)'; textColor = '#f87171'; labelBg = 'rgba(239,68,68,0.2)'; labelColor = '#f87171' }
            }
            return (
              <button key={i} onClick={() => selectAnswer(i)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
                style={{ background: bg, border: `1.5px solid ${border}`, color: textColor }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: labelBg, color: labelColor }}>{LABELS[i]}</span>
                <span className="text-sm">{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)} className="px-4 py-2.5 rounded-2xl text-sm font-medium"
            style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>← Prev</button>
        )}
        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(currentQ + 1)} className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>Next →</button>
        ) : (
          <button onClick={() => setSubmitted(true)} className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-white"
            style={{ background: '#16a34a' }}>Done — see results</button>
        )}
      </div>
    </div>
  )
}
