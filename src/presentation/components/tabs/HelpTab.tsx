'use client'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

export function HelpTab() {
  return (
    <div className="overflow-y-auto h-full" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Help & Resources</h2>
        <p className="text-sm text-stone-500 mt-0.5 leading-relaxed">If you&apos;re experiencing thoughts of harming yourself or others, please reach out to a crisis line or emergency services in your country.</p>
      </div>

      <div className="px-5 py-6 space-y-4">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-5">
          <p className="text-sm text-stone-600 leading-relaxed">
            In case of emergency, please call your local emergency number or go to your nearest hospital.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-5">
          <p className="text-sm font-semibold text-stone-800 mb-1">Find a helpline in your country</p>
          <p className="text-sm text-stone-500 mb-3">
            A global directory of crisis lines and mental health support, available in most countries.
          </p>
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: ACCENT }}
          >
            Open findahelpline.com
          </a>
        </div>
      </div>
    </div>
  )
}
