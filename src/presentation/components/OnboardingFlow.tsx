'use client'

import { useState } from 'react'

const BG = 'var(--bg)'
const ACCENT = 'var(--accent)'

// ── Add names here ─────────────────────────────────────────────────
const SPECIAL_THANKS: string[] = []
// ───────────────────────────────────────────────────────────────────

interface Props {
  user: { id: string; username: string }
  onUpdateUsername: (u: string) => Promise<void>
  onComplete: () => void
}

const infoSlides = [
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
  },
]

// 0..infoSlides.length-1 = info slides
// infoSlides.length     = username slide
// infoSlides.length + 1 = location slide
// infoSlides.length + 2 = Beacon thanks slide
// infoSlides.length + 3 = dimlit special thanks (last)
const TOTAL = infoSlides.length + 4

export function OnboardingFlow({ user, onUpdateUsername, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState(user.username)
  const [saving, setSaving] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'granted' | 'denied'>('idle')

  async function next() {
    if (isUsernameSlide) {
      if (username.trim().length >= 2 && username.trim() !== user.username) {
        setSaving(true)
        await onUpdateUsername(username.trim())
        setSaving(false)
      }
    }
    if (step < TOTAL - 1) setStep(step + 1)
    else {
      // Save to Firestore — single source of truth
      import('firebase/firestore').then(({ doc, updateDoc }) => {
        import('../../infrastructure/firebase/firebaseApp').then(({ db }) => {
          updateDoc(doc(db, 'users', user.id), { onboardingDone: true }).catch(() => {})
        })
      })
      onComplete()
    }
  }

  const isUsernameSlide = step === infoSlides.length
  const isLocationSlide = step === infoSlides.length + 1
  const isBeaconSlide = step === TOTAL - 2
  const isdimlitSlide = step === TOTAL - 1
  const slide = (!isUsernameSlide && !isLocationSlide && !isBeaconSlide && !isdimlitSlide) ? infoSlides[step] : null

  function requestLocation() {
    navigator.geolocation.getCurrentPosition(
      () => { setLocationStatus('granted'); setTimeout(() => setStep(s => s + 1), 800) },
      () => setLocationStatus('denied'),
      { timeout: 10000 }
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ background: BG }}>
      {/* Progress dots */}
      <div className="flex-shrink-0 flex justify-center gap-1.5 pt-14 pb-2">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className="h-1 rounded-full transition-all"
            style={{ width: i === step ? 24 : 6, background: i <= step ? ACCENT : '#e7e5e4' }} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-8 text-center">
        {slide && (
          <>
            {slide.icon && (
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-8"
                style={{ background: `${ACCENT}12` }}>
                {slide.icon}
              </div>
            )}
            <div className="space-y-5 mb-14">
              <h1 className="text-4xl font-bold text-neutral-200 leading-tight whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="text-neutral-500 text-base leading-relaxed whitespace-pre-line">
                {slide.body}
              </p>
            </div>
          </>
        )}

        {isUsernameSlide && (
          <div className="space-y-6 mb-10 w-full max-w-xs">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-neutral-200">What should we call you?</h1>
              <p className="text-neutral-500 text-sm">This is how others will see you.</p>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 24))}
              placeholder="Your name"
              minLength={2}
              maxLength={24}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none bg-neutral-800 border border-neutral-700 text-neutral-200 text-center text-lg"
              style={{ borderColor: username.trim().length >= 2 ? ACCENT : '#e7e5e4' }}
            />
            <p className="text-xs text-neutral-600 text-center">2–24 characters</p>
          </div>
        )}

        {isLocationSlide && (
          <div className="space-y-6 mb-10 w-full max-w-xs text-center">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
              style={{ background: `${ACCENT}12` }}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={ACCENT} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-neutral-200">Allow location?</h1>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Your location is only used to place a dot on the map so others can see you're there too.
            </p>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Your exact position is never stored. It's rounded to approximately 1 km.
            </p>

            {locationStatus === 'granted' && (
              <p className="text-green-600 text-sm font-medium">Location allowed</p>
            )}
            {locationStatus === 'denied' && (
              <p className="text-neutral-500 text-sm">No worries — you can allow it later in your browser settings.</p>
            )}

            {locationStatus === 'idle' && (
              <button onClick={requestLocation}
                className="w-full py-3.5 rounded-2xl text-white font-medium text-sm"
                style={{ background: ACCENT }}>
                Allow location
              </button>
            )}
          </div>
        )}

        {isBeaconSlide && (
          <div className="space-y-5 mb-10 max-w-xs">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-2"
              style={{ background: `${ACCENT}12` }}>
              <span className="text-3xl">🕯️</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-200">Special Thanks</h1>
            <p className="text-neutral-400 text-sm leading-relaxed">
              dimlit was inspired by{' '}
              <a href="https://beaconpostpartum.com/" target="_blank" rel="noopener noreferrer"
                className="font-semibold underline" style={{ color: ACCENT }}>
                Beacon Postpartum
              </a>
              , an app built for new mothers awake in the hardest hours.
            </p>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Beacon proved that just knowing someone else is awake can change how a hard night feels. dimlit takes that same idea further.
            </p>
            <p className="text-neutral-500 text-xs leading-relaxed">
              Thank you to the Beacon team for building something that matters.
            </p>
            {SPECIAL_THANKS.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">Also thanks to</p>
                {SPECIAL_THANKS.map((name) => (
                  <p key={name} className="text-neutral-400 text-sm">{name}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {isdimlitSlide && (
          <div className="space-y-4 mb-10">
            <img src="/icon-512.png" alt="dimlit" className="w-20 h-20 rounded-3xl mx-auto mb-2 shadow-md" />
            <h1 className="text-3xl font-bold text-neutral-200">dimlit</h1>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
              Built for everyone who has ever felt alone in the hardest hours.
            </p>
          </div>
        )}

        {!isLocationSlide && (
          <button
            onClick={next}
            disabled={isUsernameSlide ? username.trim().length < 2 || saving : false}
            className="w-full max-w-xs py-4 rounded-2xl text-white font-medium text-base disabled:opacity-50"
            style={{ background: ACCENT }}>
            {saving ? 'Saving…' : isdimlitSlide ? "I'm ready" : 'Continue'}
          </button>
        )}
        {isLocationSlide && locationStatus !== 'idle' && locationStatus !== 'granted' && (
          <button onClick={next}
            className="w-full max-w-xs py-3 rounded-2xl text-sm font-medium text-neutral-500 bg-neutral-800">
            Skip for now
          </button>
        )}
        {isLocationSlide && locationStatus === 'denied' && (
          <button onClick={next}
            className="w-full max-w-xs py-3 rounded-2xl text-sm font-medium text-neutral-500 bg-neutral-800 mt-2">
            Continue without location
          </button>
        )}
      </div>
    </div>
  )
}
