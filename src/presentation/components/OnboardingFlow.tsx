'use client'

import { useState } from 'react'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

// ── Edit this to add your special thanks ──────────────────────────
const SPECIAL_THANKS: string[] = [
  // e.g. 'My sister Sara', 'Beacon for the inspiration'
]
// ──────────────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void
}

const slides = [
  {
    title: 'Some nights feel\nheavier than others.',
    body: "You don't need to fix it right now.\nYou just need to know you're not alone.",
    icon: null,
  },
  {
    title: "You're always\nprivate here.",
    body: 'No names shown to others.\nNo exact location.\nJust a quiet signal that you exist.',
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: 'Connection here\nis quiet.',
    body: "You don't have to talk.\nYou don't have to explain.\n\nSometimes, a small signal\nis enough.",
    icon: null,
    isLast: false,
  },
]

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0)

  const totalSlides = slides.length + 1 // +1 for special thanks
  const isSpecialThanks = step === totalSlides - 1

  function next() {
    if (step < totalSlides - 1) {
      setStep(step + 1)
    } else {
      localStorage.setItem('dimlit_onboarding_done', '1')
      onComplete()
    }
  }

  const slide = !isSpecialThanks ? slides[step] : null

  return (
    <div className="h-full flex flex-col" style={{ background: BG }}>
      {/* Progress dots */}
      <div className="flex-shrink-0 flex justify-center gap-1.5 pt-14 pb-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div key={i} className="h-1 rounded-full transition-all"
            style={{ width: i === step ? 24 : 6, background: i <= step ? ACCENT : '#e7e5e4' }} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-8 text-center">
        {!isSpecialThanks && slide ? (
          <>
            {slide.icon && (
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-8"
                style={{ background: `${ACCENT}12` }}>
                {slide.icon}
              </div>
            )}
            <div className="space-y-5 mb-14">
              <h1 className="text-4xl font-bold text-stone-800 leading-tight whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="text-stone-500 text-base leading-relaxed whitespace-pre-line">
                {slide.body}
              </p>
            </div>
          </>
        ) : (
          /* Special Thanks */
          <>
            <img src="/icon-512.png" alt="DimLit" className="w-20 h-20 rounded-3xl mb-6 shadow-md" />
            <div className="space-y-4 mb-10">
              <h1 className="text-3xl font-bold text-stone-800">DimLit</h1>
              <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
                Built for everyone who has ever felt alone in the middle of the night.
              </p>
              {SPECIAL_THANKS.length > 0 && (
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">Special Thanks</p>
                  {SPECIAL_THANKS.map((name) => (
                    <p key={name} className="text-stone-600 text-sm">{name}</p>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <button onClick={next}
          className="w-full max-w-xs py-4 rounded-2xl text-white font-medium text-base"
          style={{ background: ACCENT }}>
          {step === totalSlides - 1 ? "I'm ready" : 'Continue'}
        </button>
      </div>
    </div>
  )
}
