'use client'

import { useState } from 'react'
import type { Question } from './popCultureQuiz'

const ACCENT = '#7c3aed'
const LABELS = ['A', 'B', 'C', 'D']

interface Props {
  title: string
  questions: Question[]
  onBack: () => void
}

function getScore(score: number, total: number) {
  const pct = score / total
  if (pct >= 0.9) return { emoji: '🏆', label: 'Pop Culture Expert' }
  if (pct >= 0.75) return { emoji: '⭐', label: 'Very Impressive' }
  if (pct >= 0.5) return { emoji: '👍', label: 'Solid Knowledge' }
  if (pct >= 0.25) return { emoji: '😄', label: 'Casual Fan' }
  return { emoji: '📺', label: 'Time for a binge' }
}

export function QuizScreen({ title, questions, onBack }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [submitted, setSubmitted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)

  function selectAnswer(idx: number) {
    if (submitted) return
    const next = [...answers]
    next[currentQ] = idx
    setAnswers(next)
    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1)
    }, 400)
  }

  if (submitted) {
    const score = answers.filter((a, i) => a === questions[i].correctIndex).length
    const { emoji, label } = getScore(score, questions.length)
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center" style={{ background: '#faf7f0' }}>
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-3xl font-bold text-stone-800 mb-1">{score}/{questions.length}</h2>
        <p className="text-lg text-stone-500 mb-8">{label}</p>

        {/* Review wrong answers */}
        <div className="w-full max-w-md text-left space-y-2 mb-8 max-h-64 overflow-y-auto">
          {questions.map((q, i) => {
            const correct = answers[i] === q.correctIndex
            if (correct) return null
            return (
              <div key={i} className="bg-white rounded-xl px-4 py-3 border border-red-100">
                <p className="text-xs text-stone-500 mb-1">{q.question}</p>
                <p className="text-xs text-red-400">Your answer: {answers[i] !== null ? q.options[answers[i]!] : '—'}</p>
                <p className="text-xs text-green-600">Correct: {q.options[q.correctIndex]}</p>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={() => { setAnswers(Array(questions.length).fill(null)); setSubmitted(false); setCurrentQ(0) }}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-white"
            style={{ background: ACCENT }}>
            Try again
          </button>
          <button onClick={onBack}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-stone-600 bg-stone-100">
            Back
          </button>
        </div>
      </div>
    )
  }

  const q = questions[currentQ]
  const answered = answers[currentQ]

  return (
    <div className="flex flex-col h-full" style={{ background: '#faf7f0' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-stone-200">
        <button onClick={onBack} className="text-sm mb-2" style={{ color: ACCENT }}>← Back</button>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-stone-800">{title}</h2>
          <span className="text-xs text-stone-400">{currentQ + 1}/{questions.length}</span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-stone-200 rounded-full">
          <div className="h-full rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: ACCENT }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: ACCENT }}>{q.category}</p>
        <h3 className="text-lg font-semibold text-stone-800 leading-snug mb-6">{q.question}</h3>

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let bg = '#fff'
            let border = '#e7e5e4'
            let textColor = '#1c1917'
            if (answered !== null) {
              if (i === q.correctIndex) { bg = '#f0fdf4'; border = '#86efac'; textColor = '#166534' }
              else if (i === answered) { bg = '#fff1f2'; border = '#fca5a5'; textColor = '#991b1b' }
            } else if (answered === null) {
              // hover state handled by CSS
            }
            return (
              <button key={i} onClick={() => selectAnswer(i)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all"
                style={{ background: bg, border: `1.5px solid ${border}`, color: textColor }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: answered === null ? '#f5f4ff' : i === q.correctIndex ? '#bbf7d0' : i === answered ? '#fecdd3' : '#f5f4ff', color: answered === null ? ACCENT : i === q.correctIndex ? '#166534' : i === answered ? '#991b1b' : '#9ca3af' }}>
                  {LABELS[i]}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-5 pb-5 pt-3 border-t border-stone-200 flex gap-3">
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)}
            className="px-4 py-2.5 rounded-2xl text-sm text-stone-500 bg-stone-100">
            ← Prev
          </button>
        )}
        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(currentQ + 1)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-white"
            style={{ background: ACCENT }}>
            Next →
          </button>
        ) : (
          <button onClick={() => setSubmitted(true)}
            className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-white"
            style={{ background: '#16a34a' }}>
            Done — see results
          </button>
        )}
      </div>
    </div>
  )
}
