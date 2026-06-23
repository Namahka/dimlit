'use client'

export function HelpTab() {
  return (
    <div className="overflow-y-auto h-full" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>I need help</h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          If you're experiencing thoughts of harming yourself or others, please reach out to a crisis line or emergency services in your country.
        </p>
      </div>

      <div className="px-5 py-6 space-y-4">
        <div className="px-4 py-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
            In case of emergency, please call your local emergency number or go to your nearest hospital.
          </p>
        </div>

        <div className="px-4 py-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Find a helpline in your country</p>
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            A global directory of crisis lines and mental health support, available in most countries.
          </p>
          <a
            href="https://findahelpline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            Open findahelpline.com
          </a>
        </div>
      </div>
    </div>
  )
}
