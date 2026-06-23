'use client'

import { useState } from 'react'
import { QuizScreen } from './quiz/QuizScreen'
import { popCultureQuestions } from './quiz/popCultureQuiz'
import { tvSeriesQuestions } from './quiz/tvSeriesQuiz'
import { movieQuestions } from './quiz/movieQuiz'
import { celebrityQuestions } from './quiz/celebrityQuiz'
import { gamingQuestions } from './quiz/gamingQuiz'
import { ninetiesQuestions } from './quiz/ninetiesQuiz'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

type View = 'home' | 'quiz-categories' | string

const quizCategories = [
  { id: 'pop-culture', label: 'Pop Culture', description: 'Movies, music, social media & gaming', questions: popCultureQuestions },
  { id: 'tv-series', label: 'TV Series', description: 'Classic and modern television', questions: tvSeriesQuestions },
  { id: 'movies', label: 'Movies', description: 'Cinema from all decades', questions: movieQuestions },
  { id: 'celebrities', label: 'Celebrities', description: 'Famous faces and their stories', questions: celebrityQuestions },
  { id: 'gaming', label: 'Gaming', description: 'Consoles, characters & franchises', questions: gamingQuestions },
  { id: '90s', label: 'The 90s', description: 'A decade of iconic pop culture', questions: ninetiesQuestions },
]

export function DistractTab() {
  const [view, setView] = useState<View>('home')

  const activeQuiz = quizCategories.find(c => c.id === view)

  if (activeQuiz) {
    return <QuizScreen title={activeQuiz.label} questions={activeQuiz.questions} onBack={() => setView('quiz-categories')} />
  }

  if (view === 'quiz-categories') {
    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
        <div className="px-5 pt-5 pb-4 border-b border-stone-200">
          <button onClick={() => setView('home')} className="text-sm mb-2" style={{ color: ACCENT }}>Back</button>
          <h2 className="text-xl font-bold text-stone-800">Quiz</h2>
          <p className="text-sm text-stone-400 mt-0.5">Pick a category — 20 questions each</p>
        </div>
        <div className="px-5 py-4 space-y-3 pb-10">
          {quizCategories.map((cat) => (
            <button key={cat.id} onClick={() => setView(cat.id)}
              className="w-full text-left px-5 py-4 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all">
              <p className="font-semibold text-stone-800">{cat.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Distract yourself</h2>
        <p className="text-sm text-stone-400 mt-0.5">Something to take your mind off things.</p>
      </div>
      <div className="px-5 py-4 pb-10">
        <button onClick={() => setView('quiz-categories')}
          className="w-full text-left px-5 py-5 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-md transition-all">
          <p className="font-semibold text-stone-800 text-base">Quiz</p>
          <p className="text-sm text-stone-400 mt-0.5">6 categories — 20 questions each</p>
        </button>
      </div>
    </div>
  )
}
