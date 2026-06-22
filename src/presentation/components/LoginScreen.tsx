'use client'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

interface Props {
  onGoogle: () => void
  error: string | null
}

export function LoginScreen({ onGoogle, error }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6" style={{ background: BG }}>
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <img src="/icon-512.png" alt="dimlit" style={{ width: 160, height: 160, borderRadius: 36, display: 'block', margin: '0 auto 12px' }} />
          <h1 className="text-6xl font-love" style={{ color: ACCENT }}>dimlit</h1>
          <p className="text-sm text-stone-400">You&apos;re not alone.</p>
        </div>

        <div className="space-y-3">
          <button onClick={onGoogle}
            className="w-full flex items-center justify-center gap-3 font-medium py-3.5 rounded-2xl bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 transition-colors shadow-sm">
            <GoogleIcon />
            Continue with Google
          </button>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        </div>
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
