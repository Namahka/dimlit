'use client'

import { useState } from 'react'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

interface Props {
  onGoogle: () => void
  onEmailSignIn: (email: string, password: string) => void
  onRegister: (email: string, password: string, username: string) => void
  error: string | null
}

export function LoginScreen({ onGoogle, onEmailSignIn, onRegister, error }: Props) {
  const [mode, setMode] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'signin') onEmailSignIn(email, password)
    else onRegister(email, password, username)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6" style={{ background: BG }}>
      <div className="w-full max-w-sm space-y-7">
        <div className="text-center space-y-3">
          <img src="/icon-512.png" alt="DimLit" style={{ width: 160, height: 160, borderRadius: 36, display: 'block', margin: '0 auto 12px' }} />
          <h1 className="text-6xl font-love" style={{ color: ACCENT }}>dimlit</h1>
          <p className="text-sm text-stone-400">You&apos;re not alone.</p>
        </div>

        <button onClick={onGoogle}
          className="w-full flex items-center justify-center gap-3 font-medium py-3 rounded-2xl bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 transition-colors">
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-300">or</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input type="text" placeholder="Username" value={username}
              onChange={(e) => setUsername(e.target.value)} required minLength={2} maxLength={24}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none bg-white border border-stone-200 text-stone-800 placeholder-stone-300" />
          )}
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none bg-white border border-stone-200 text-stone-800 placeholder-stone-300" />
          <input type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none bg-white border border-stone-200 text-stone-800 placeholder-stone-300" />

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button type="submit" className="w-full py-3 rounded-2xl text-sm text-white font-medium"
            style={{ background: ACCENT }}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-400">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')} style={{ color: ACCENT }}>
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
