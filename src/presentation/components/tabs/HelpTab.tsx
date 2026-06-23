'use client'

import { useMemo } from 'react'

const resources: { countryCode: string; country: string; name: string; phone: string; url?: string }[] = [
  { countryCode: 'SE', country: 'Sweden', name: 'Mind Självmordslinjen', phone: '90101', url: 'https://mind.se' },
  { countryCode: 'SE', country: 'Sweden', name: 'Bris (under 18)', phone: '116 111', url: 'https://bris.se' },
  { countryCode: 'US', country: 'USA', name: '988 Suicide & Crisis Lifeline', phone: '988', url: 'https://988lifeline.org' },
  { countryCode: 'GB', country: 'UK', name: 'Samaritans', phone: '116 123', url: 'https://samaritans.org' },
  { countryCode: 'AU', country: 'Australia', name: 'Lifeline', phone: '13 11 14', url: 'https://lifeline.org.au' },
  { countryCode: 'CA', country: 'Canada', name: 'Talk Suicide Canada', phone: '1-833-456-4566', url: 'https://talksuicide.ca' },
  { countryCode: 'DE', country: 'Germany', name: 'Telefonseelsorge', phone: '0800 111 0 111', url: 'https://online.telefonseelsorge.de' },
  { countryCode: 'FR', country: 'France', name: 'Numéro National Prévention Suicide', phone: '3114', url: 'https://3114.fr' },
  { countryCode: 'NO', country: 'Norway', name: 'Mental Helse Hjelpetelefonen', phone: '116 123', url: 'https://mentalhelse.no' },
  { countryCode: 'DK', country: 'Denmark', name: 'Livslinien', phone: '70 201 201', url: 'https://livslinien.dk' },
  { countryCode: 'FI', country: 'Finland', name: 'Kriisipuhelin', phone: '09 2525 0111', url: 'https://mieli.fi' },
  { countryCode: 'NL', country: 'Netherlands', name: '113 Zelfmoordpreventie', phone: '113', url: 'https://113.nl' },
  { countryCode: 'ES', country: 'Spain', name: 'Teléfono de la Esperanza', phone: '717 003 717' },
  { countryCode: 'IT', country: 'Italy', name: 'Telefono Amico', phone: '02 2327 2327' },
  { countryCode: 'INT', country: 'International', name: 'Findahelpline.com', phone: '', url: 'https://findahelpline.com' },
]

function detectCountryCode(): string {
  const lang = navigator.language || ''
  const region = lang.split('-')[1]?.toUpperCase()
  if (region && resources.some(r => r.countryCode === region)) return region
  const map: Record<string, string> = { SV: 'SE', EN: 'GB', DE: 'DE', FR: 'FR', NL: 'NL', IT: 'IT', ES: 'ES', NB: 'NO', DA: 'DK', FI: 'FI' }
  return map[lang.split('-')[0].toUpperCase()] ?? ''
}

export function HelpTab() {
  const myCountry = useMemo(() => { try { return detectCountryCode() } catch { return '' } }, [])
  const sorted = useMemo(() => ({
    mine: resources.filter(r => r.countryCode === myCountry),
    rest: resources.filter(r => r.countryCode !== myCountry),
  }), [myCountry])

  return (
    <div className="overflow-y-auto h-full" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>I need help</h2>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          If you're experiencing thoughts of harming yourself or others, please reach out to a crisis line or emergency services in your country.
        </p>
      </div>
      <div className="px-5 py-4 space-y-3 pb-10">
        <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(232,124,40,0.12)', border: '1px solid rgba(232,124,40,0.3)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>In an emergency, always call your local emergency number (112 / 911).</p>
        </div>
        {sorted.mine.length > 0 && (
          <p className="text-xs font-semibold uppercase tracking-widest pt-1" style={{ color: '#555' }}>In your country</p>
        )}
        {sorted.mine.map(r => <ResourceCard key={r.name} r={r} highlight />)}
        {sorted.mine.length > 0 && sorted.rest.length > 0 && (
          <p className="text-xs font-semibold uppercase tracking-widest pt-2" style={{ color: '#555' }}>Other countries</p>
        )}
        {sorted.rest.map(r => <ResourceCard key={r.name} r={r} />)}
      </div>
    </div>
  )
}

function ResourceCard({ r, highlight }: { r: typeof resources[0]; highlight?: boolean }) {
  return (
    <div className="px-4 py-3.5 rounded-2xl" style={{
      background: highlight ? 'rgba(232,124,40,0.08)' : 'var(--surface)',
      border: `1px solid ${highlight ? 'rgba(232,124,40,0.25)' : 'var(--border)'}`
    }}>
      <p className="text-xs mb-0.5" style={{ color: '#555' }}>{r.country}</p>
      <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{r.name}</p>
      {r.phone && <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="text-sm font-medium mt-0.5 block" style={{ color: 'var(--accent)' }}>{r.phone}</a>}
      {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs mt-0.5 block hover:underline" style={{ color: '#555' }}>{r.url.replace('https://', '')}</a>}
    </div>
  )
}
