'use client'

export type Tab = 'home' | 'messages' | 'hugs' | 'distract' | 'tips' | 'settings' | 'help' | 'admin'

interface TabDef { id: Tab; label: string; icon: React.ReactNode }

const baseTabs: TabDef[] = [
  { id: 'home', label: 'Home', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg> },
  { id: 'messages', label: 'Messages', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg> },
  { id: 'hugs', label: 'Hugs', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg> },
  { id: 'distract', label: 'Distract', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg> },
  { id: 'tips', label: 'Tips', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg> },
]

const adminTab: TabDef = {
  id: 'admin', label: 'Admin',
  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
}

interface Props {
  active: Tab
  onChange: (t: Tab) => void
  isAdmin: boolean
  hugCount?: number
  reportCount?: number
}

export function BottomNav({ active, onChange, isAdmin, hugCount = 0, reportCount = 0 }: Props) {
  const tabs = isAdmin ? [...baseTabs, adminTab] : baseTabs

  return (
    <nav className="flex-shrink-0 h-14 flex items-center justify-around px-1" style={{ background: '#faf7f0', borderTop: '1px solid #e7e5e4' }}>
      {tabs.map((tab) => {
        const badge = tab.id === 'hugs' ? hugCount : tab.id === 'admin' ? reportCount : 0
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all flex-shrink-0 relative"
            style={{ color: active === tab.id ? '#7c3aed' : '#c4bfb8' }}>
            <div className="relative">
              {tab.icon}
              {badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center"
                  style={{ background: tab.id === 'admin' ? '#ef4444' : '#7c3aed', fontSize: 9, fontWeight: 700, lineHeight: 1 }}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
