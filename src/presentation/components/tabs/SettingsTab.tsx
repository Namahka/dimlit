'use client'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

interface Props {
  username: string
  onSignOut: () => void
}

export function SettingsTab({ username, onSignOut }: Props) {
  return (
    <div className="overflow-y-auto h-full" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Settings</h2>
      </div>

      <div className="px-5 py-4 space-y-3 pb-10">
        {/* Account */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-50">
            <p className="text-xs text-stone-400 mb-0.5">Signed in as</p>
            <p className="font-semibold text-stone-800">{username}</p>
          </div>
          <button
            onClick={onSignOut}
            className="w-full text-left px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
          <h3 className="font-semibold text-stone-800 mb-2 text-sm">Privacy</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Your exact location is never stored. Coordinates are rounded to ~10 km. You appear on the map only while the app is open.
          </p>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
          <h3 className="font-semibold text-stone-800 mb-2 text-sm">About DimLit</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            DimLit shows you that others are awake with anxiety right now. A quiet signal that you&apos;re not alone.
          </p>
          <p className="text-xs text-stone-300 mt-3">Version 0.1.0</p>
        </div>
      </div>
    </div>
  )
}
