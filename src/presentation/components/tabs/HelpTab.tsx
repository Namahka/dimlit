'use client'

import { useMemo } from 'react'

const BG = '#faf7f0'

const resources: { countryCode: string; country: string; name: string; phone: string; url?: string }[] = [
  { countryCode: 'SE', country: '🇸🇪 Sweden', name: 'Mind Självmordslinjen', phone: '90101', url: 'https://mind.se' },
  { countryCode: 'SE', country: '🇸🇪 Sweden', name: 'Bris (under 18)', phone: '116 111', url: 'https://bris.se' },
  { countryCode: 'US', country: '🇺🇸 USA', name: '988 Suicide & Crisis Lifeline', phone: '988', url: 'https://988lifeline.org' },
  { countryCode: 'GB', country: '🇬🇧 UK', name: 'Samaritans', phone: '116 123', url: 'https://samaritans.org' },
  { countryCode: 'AU', country: '🇦🇺 Australia', name: 'Lifeline', phone: '13 11 14', url: 'https://lifeline.org.au' },
  { countryCode: 'CA', country: '🇨🇦 Canada', name: 'Talk Suicide Canada', phone: '1-833-456-4566', url: 'https://talksuicide.ca' },
  { countryCode: 'DE', country: '🇩🇪 Germany', name: 'Telefonseelsorge', phone: '0800 111 0 111', url: 'https://online.telefonseelsorge.de' },
  { countryCode: 'FR', country: '🇫🇷 France', name: 'Numéro National Prévention Suicide', phone: '3114', url: 'https://3114.fr' },
  { countryCode: 'NO', country: '🇳🇴 Norway', name: 'Mental Helse Hjelpetelefonen', phone: '116 123', url: 'https://mentalhelse.no' },
  { countryCode: 'DK', country: '🇩🇰 Denmark', name: 'Livslinien', phone: '70 201 201', url: 'https://livslinien.dk' },
  { countryCode: 'FI', country: '🇫🇮 Finland', name: 'Kriisipuhelin', phone: '09 2525 0111', url: 'https://mieli.fi' },
  { countryCode: 'NL', country: '🇳🇱 Netherlands', name: '113 Zelfmoordpreventie', phone: '113', url: 'https://113.nl' },
  { countryCode: 'ES', country: '🇪🇸 Spain', name: 'Teléfono de la Esperanza', phone: '717 003 717', url: 'https://telefonodelaesperanza.org' },
  { countryCode: 'IT', country: '🇮🇹 Italy', name: 'Telefono Amico', phone: '02 2327 2327', url: 'https://telefonoamico.it' },
  { countryCode: 'INT', country: '🌍 International', name: 'Findahelpline.com', phone: '', url: 'https://findahelpline.com' },
]

function detectCountryCode(): string {
  const lang = navigator.language || ''
  const region = lang.split('-')[1]?.toUpperCase()
  if (region && resources.some(r => r.countryCode === region)) return region
  const langBase = lang.split('-')[0].toUpperCase()
  const map: Record<string, string> = { SV: 'SE', EN: 'GB', DE: 'DE', FR: 'FR', NL: 'NL', IT: 'IT', ES: 'ES', NB: 'NO', DA: 'DK', FI: 'FI' }
  return map[langBase] ?? ''
}

export function HelpTab() {
  const myCountry = useMemo(() => {
    try { return detectCountryCode() } catch { return '' }
  }, [])

  const sorted = useMemo(() => {
    const mine = resources.filter(r => r.countryCode === myCountry)
    const rest = resources.filter(r => r.countryCode !== myCountry)
    return { mine, rest }
  }, [myCountry])

  return (
    <div className="overflow-y-auto h-full" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Help & Resources</h2>
        <p className="text-sm text-stone-400 mt-0.5">
          You don&apos;t have to face this alone. Reach out.
        </p>
      </div>

      <div className="px-5 py-4 space-y-3 pb-10">
        <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-violet-800 font-medium">In an emergency, always call 112 (EU) or 911 (US/CA).</p>
        </div>

        {/* User's own country first */}
        {sorted.mine.length > 0 && (
          <>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest pt-1">In your country</p>
            {sorted.mine.map((r) => <ResourceCard key={r.name} r={r} highlight />)}
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest pt-2">Other countries</p>
          </>
        )}

        {sorted.rest.map((r) => <ResourceCard key={r.name} r={r} />)}
      </div>
    </div>
  )
}

function ResourceCard({ r, highlight }: { r: typeof resources[0]; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border shadow-sm px-4 py-3.5 ${highlight ? 'bg-violet-50 border-violet-200' : 'bg-white border-stone-100'}`}>
      <p className="text-xs text-stone-400 mb-0.5">{r.country}</p>
      <p className={`font-semibold text-sm ${highlight ? 'text-violet-900' : 'text-stone-800'}`}>{r.name}</p>
      {r.phone && (
        <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="text-sm font-medium mt-0.5 block" style={{ color: '#7c3aed' }}>
          {r.phone}
        </a>
      )}
      {r.url && (
        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-400 mt-0.5 block hover:underline">
          {r.url.replace('https://', '')}
        </a>
      )}
    </div>
  )
}
