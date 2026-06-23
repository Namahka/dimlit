'use client'

import { useState } from 'react'

const BG = 'var(--bg)'
const ACCENT = 'var(--accent)'

interface Props {
  email?: string
  onResend: () => Promise<void>
  onCheck: () => Promise<boolean>
  onSignOut: () => void
}

export function EmailVerificationScreen({ email, onResend, onCheck, onSignOut }: Props) {
  const [sent, setSent] = useState(false)
  const [checking, setChecking] = useState(false)
  const [notYet, setNotYet] = useState(false)

  async function handleResend() {
    await onResend()
    setSent(true)
  }

  async function handleCheck() {
    setChecking(true)
    setNotYet(false)
    const verified = await onCheck()
    if (!verified) setNotYet(true)
    setChecking(false)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center" style={{ background: BG }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
        style={{ background: `${ACCENT}18` }}>
        ✉️
      </div>
      <h2 className="text-2xl font-bold text-neutral-200 mb-2">Verify your email</h2>
      <p className="text-neutral-500 text-sm leading-relaxed mb-1">
        We sent a verification link to
      </p>
      {email && <p className="font-medium text-neutral-300 text-sm">{email}</p>}
      <p className="text-xs text-neutral-500 mb-6 mt-1">
        Sent from <span className="font-medium">noreply@dimlit-f84ef.firebaseapp.com</span> — check your junk/spam folder if you don't see it.
      </p>
      <p className="text-neutral-500 text-sm mb-8">
        Click the link in the email, then come back here.
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button onClick={handleCheck} disabled={checking}
          className="w-full py-3 rounded-2xl text-white font-medium text-sm disabled:opacity-60"
          style={{ background: ACCENT }}>
          {checking ? 'Checking…' : "I've verified my email"}
        </button>

        {notYet && <p className="text-red-400 text-xs">Not verified yet — check your inbox and click the link.</p>}

        <button onClick={handleResend} disabled={sent}
          className="w-full py-3 rounded-2xl text-sm font-medium border border-neutral-700 text-neutral-400 disabled:opacity-50">
          {sent ? 'Email sent!' : 'Resend email'}
        </button>

        <button onClick={onSignOut} className="text-xs text-neutral-500 mt-2">
          Go back
        </button>
      </div>
    </div>
  )
}
