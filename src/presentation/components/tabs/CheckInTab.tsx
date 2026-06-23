'use client'

import { useState } from 'react'

const BG = 'var(--bg)'
const ACCENT = 'var(--accent)'

const moods = [
  { value: 1, emoji: '😰', label: 'Very anxious' },
  { value: 2, emoji: '😟', label: 'Anxious' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Okay' },
  { value: 5, emoji: '😊', label: 'Good' },
]

export function CheckInTab() {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-6" style={{ background: BG }}>
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${ACCENT}25 0%, transparent 70%)` }} />
          <div className="w-12 h-12 rounded-full text-2xl flex items-center justify-center" style={{ background: ACCENT }}>🌙</div>
        </div>
        <h2 className="text-2xl font-bold text-stone-800">Thank you for checking in</h2>
        <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
          Whatever you&apos;re feeling right now is valid. You&apos;re not alone — others are awake with you tonight.
        </p>
        <button onClick={() => { setSelected(null); setSubmitted(false) }} className="text-sm" style={{ color: ACCENT }}>
          Check in again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full px-6" style={{ background: BG }}>
      <div className="flex-1 flex flex-col justify-center space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-stone-800">How are you feeling?</h2>
          <p className="text-sm text-stone-400">A gentle check-in, just for you.</p>
        </div>

        <div className="flex justify-between gap-2">
          {moods.map((mood) => (
            <button key={mood.value} onClick={() => setSelected(mood.value)}
              className="flex flex-col items-center gap-1.5 flex-1 py-3 rounded-2xl border transition-all"
              style={{
                background: selected === mood.value ? ACCENT : '#fff',
                borderColor: selected === mood.value ? ACCENT : '#e7e5e4',
                transform: selected === mood.value ? 'scale(1.05)' : 'scale(1)',
              }}>
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[10px] leading-tight text-center px-1"
                style={{ color: selected === mood.value ? 'rgba(255,255,255,0.9)' : '#a8a29e' }}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-center text-stone-400 leading-relaxed">
              {selected <= 2 ? "It's okay to have a hard night. You made it this far."
                : selected === 3 ? "Somewhere between the dark and the light — that counts too."
                : "Glad to hear you're doing a bit better."}
            </p>
            <button onClick={() => setSubmitted(true)}
              className="w-full py-3.5 rounded-2xl text-sm text-white font-medium"
              style={{ background: ACCENT }}>
              Submit check-in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
