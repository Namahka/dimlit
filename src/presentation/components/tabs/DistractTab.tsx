'use client'

import { useState } from 'react'
import { QuizScreen } from './quiz/QuizScreen'
import { popCultureQuestions } from './quiz/popCultureQuiz'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

type View = 'home' | 'quiz-categories' | 'quiz-pop-culture'

const quizCategories = [
  { id: 'pop-culture', label: 'Pop Culture 🎬', description: 'Movies, music, social media & gaming', available: true },
  { id: '90s', label: 'The 90s 📼', description: 'A decade of iconic pop culture', available: false },
  { id: 'gaming', label: 'Gaming 🎮', description: 'Consoles, characters & franchises', available: false },
  { id: 'celebrities', label: 'Celebrities ⭐', description: 'Famous faces and their stories', available: false },
]

export function DistractTab() {
  const [view, setView] = useState<View>('home')

  if (view === 'quiz-pop-culture') {
    return <QuizScreen title="Pop Culture Quiz 🎬" questions={popCultureQuestions} onBack={() => setView('quiz-categories')} />
  }

  if (view === 'quiz-categories') {
    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
        <div className="px-5 pt-5 pb-4 border-b border-stone-200">
          <button onClick={() => setView('home')} className="text-sm mb-2" style={{ color: ACCENT }}>← Back</button>
          <h2 className="text-xl font-bold text-stone-800">Quiz</h2>
          <p className="text-sm text-stone-400 mt-0.5">Pick a category</p>
        </div>
        <div className="px-5 py-4 space-y-3 pb-10">
          {quizCategories.map((cat) => (
            <button key={cat.id} disabled={!cat.available}
              onClick={() => cat.id === 'pop-culture' && setView('quiz-pop-culture')}
              className="w-full text-left px-5 py-4 rounded-2xl bg-white border border-stone-100 shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800">{cat.label}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{cat.description}</p>
                </div>
                {cat.available
                  ? <span className="text-xs text-white px-2 py-1 rounded-full" style={{ background: ACCENT }}>20 Qs</span>
                  : <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full">Soon</span>
                }
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Home view
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Distract yourself</h2>
        <p className="text-sm text-stone-400 mt-0.5">Something to take your mind off things.</p>
      </div>
      <div className="px-5 py-4 space-y-3 pb-10">
        <button onClick={() => setView('quiz-categories')}
          className="w-full text-left px-5 py-5 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🧠</span>
            <div>
              <p className="font-semibold text-stone-800 text-base">Quiz</p>
              <p className="text-sm text-stone-400 mt-0.5">Test your knowledge across fun categories</p>
            </div>
          </div>
        </button>

        {/* Coming soon */}
        <div className="px-5 py-5 rounded-2xl bg-white border border-stone-100 opacity-50">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎲</span>
            <div>
              <p className="font-semibold text-stone-800 text-base">This or That</p>
              <p className="text-sm text-stone-400 mt-0.5">Quick choices, no wrong answers — coming soon</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 rounded-2xl bg-white border border-stone-100 opacity-50">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🤔</span>
            <div>
              <p className="font-semibold text-stone-800 text-base">Would You Rather</p>
              <p className="text-sm text-stone-400 mt-0.5">Impossible choices — coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
