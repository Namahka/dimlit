'use client'

import { useState } from 'react'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

const moodTags = ['Anxious', 'Overwhelmed', 'Isolated', 'Numb', 'Heavy', 'A mix of everything']
const causeTags = ['Racing thoughts', 'Anxiety', 'Overthinking', 'Physical tension', "Just can't sleep", 'Something else']

interface SlideProps {
  onNext: () => void
  nextLabel?: string
}

// ── EDIT THIS to add your special thanks ──────────────────────────────────
const SPECIAL_THANKS: string[] = [
  // Add names here, e.g.: 'My sister Sara', 'The Beacon team for the inspiration'
]
// ──────────────────────────────────────────────────────────────────────────

function SlideSpecialThanks({ onNext }: SlideProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full px-8 text-center" style={{ background: BG }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8"
        style={{ background: `${ACCENT}18` }}>
        🌙
      </div>
      <div className="space-y-4 mb-10">
        <h1 className="text-3xl font-bold text-stone-800">DimLit</h1>
        <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
          Built for everyone who has ever felt alone in the middle of the night.
        </p>
        {SPECIAL_THANKS.length > 0 && (
          <div className="mt-6 space-y-1">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">Special Thanks</p>
            {SPECIAL_THANKS.map((name) => (
              <p key={name} className="text-stone-600 text-sm">{name}</p>
            ))}
          </div>
        )}
      </div>
      <button onClick={onNext} className="w-full max-w-xs py-4 rounded-2xl text-white font-medium text-base"
        style={{ background: ACCENT }}>
        Continue
      </button>
    </div>
  )
}

function Slide1({ onNext }: SlideProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full px-8 text-center" style={{ background: BG }}>
      <div className="space-y-6 mb-16">
        <h1 className="text-4xl font-bold text-stone-800 leading-tight">
          Some nights feel<br />heavier than others.
        </h1>
        <p className="text-stone-400 text-lg leading-relaxed">
          You don&apos;t need to fix it right now.<br />
          You just need to know you&apos;re not alone.
        </p>
      </div>
      <button onClick={onNext} className="w-full max-w-xs py-4 rounded-2xl text-white font-medium text-base"
        style={{ background: ACCENT }}>
        Continue
      </button>
    </div>
  )
}

function Slide2({ onNext }: SlideProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full px-8 text-center" style={{ background: BG }}>
      <div className="space-y-6 mb-16">
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
          style={{ background: 'rgba(124,58,237,0.1)' }}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-stone-800 leading-tight">
          You&apos;re always<br />private here.
        </h1>
        <p className="text-stone-400 text-base leading-relaxed">
          No names shown to others.<br />
          No exact location.<br />
          Just a quiet signal that you exist.
        </p>
      </div>
      <button onClick={onNext} className="w-full max-w-xs py-4 rounded-2xl text-white font-medium text-base"
        style={{ background: ACCENT }}>
        Continue
      </button>
    </div>
  )
}

function Slide3({ onNext }: SlideProps) {
  const [selected, setSelected] = useState<string[]>([])

  function toggle(tag: string) {
    setSelected((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  return (
    <div className="flex flex-col justify-center h-full px-6" style={{ background: BG }}>
      <div className="space-y-8 mb-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-stone-800 leading-tight">
            How have nights<br />been feeling lately?
          </h1>
          <p className="text-stone-400 text-sm">There&apos;s no right answer.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {moodTags.map((tag) => (
            <button key={tag} onClick={() => toggle(tag)}
              className="px-4 py-2 rounded-full text-sm border transition-all"
              style={{
                background: selected.includes(tag) ? ACCENT : '#fff',
                color: selected.includes(tag) ? '#fff' : '#57534e',
                borderColor: selected.includes(tag) ? ACCENT : '#e7e5e4',
              }}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-medium text-base transition-all"
        style={{ background: selected.length ? ACCENT : '#e7e5e4', color: selected.length ? '#fff' : '#a8a29e' }}>
        Continue
      </button>
    </div>
  )
}

function Slide4({ onNext }: SlideProps) {
  const [selected, setSelected] = useState<string[]>([])

  function toggle(tag: string) {
    setSelected((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  return (
    <div className="flex flex-col justify-center h-full px-6" style={{ background: BG }}>
      <div className="space-y-8 mb-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-stone-800 leading-tight">
            What usually<br />keeps you awake?
          </h1>
          <p className="text-stone-400 text-sm">Choose what fits most nights.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {causeTags.map((tag) => (
            <button key={tag} onClick={() => toggle(tag)}
              className="px-4 py-2 rounded-full text-sm border transition-all"
              style={{
                background: selected.includes(tag) ? ACCENT : '#fff',
                color: selected.includes(tag) ? '#fff' : '#57534e',
                borderColor: selected.includes(tag) ? ACCENT : '#e7e5e4',
              }}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-medium text-base transition-all"
        style={{ background: selected.length ? ACCENT : '#e7e5e4', color: selected.length ? '#fff' : '#a8a29e' }}>
        Continue
      </button>
    </div>
  )
}

function Slide5({ onNext }: SlideProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full px-8 text-center" style={{ background: BG }}>
      {/* Glow dot */}
      <div className="relative w-28 h-28 mx-auto mb-10 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
        <div className="w-10 h-10 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 30px ${ACCENT}60` }} />
      </div>
      <div className="space-y-6 mb-16">
        <h1 className="text-4xl font-bold text-stone-800 leading-tight">
          Connection here<br />is quiet.
        </h1>
        <p className="text-stone-500 text-base leading-relaxed">
          You don&apos;t have to talk.<br />
          You don&apos;t have to explain.<br /><br />
          Sometimes, a small signal<br />is enough.
        </p>
      </div>
      <button onClick={onNext} className="w-full max-w-xs py-4 rounded-2xl text-white font-medium text-base"
        style={{ background: ACCENT }}>
        I&apos;m ready
      </button>
    </div>
  )
}

interface Props {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0)

  function next() {
    if (step < 5) setStep(step + 1)
    else {
      localStorage.setItem('dimlit_onboarding_done', '1')
      onComplete()
    }
  }

  const slides = [SlideSpecialThanks, Slide1, Slide2, Slide3, Slide4, Slide5]
  const Slide = slides[step]

  return (
    <div className="h-full flex flex-col" style={{ background: BG }}>
      {/* Progress dots */}
      <div className="flex-shrink-0 flex justify-center gap-1.5 pt-14 pb-2">
        {slides.map((_, i) => (
          <div key={i} className="h-1 rounded-full transition-all"
            style={{ width: i === step ? 24 : 6, background: i <= step ? ACCENT : '#e7e5e4' }} />
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <Slide onNext={next} />
      </div>
    </div>
  )
}
