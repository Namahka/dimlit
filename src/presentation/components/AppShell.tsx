'use client'

import { useState, useEffect } from 'react'
import { BottomNav, type Tab } from './BottomNav'
import { LoginScreen } from './LoginScreen'
import { OnboardingFlow } from './OnboardingFlow'
import { HomeTab } from './tabs/HomeTab'
import { MessagesTab } from './tabs/MessagesTab'
import { CheckInTab } from './tabs/CheckInTab'
import { TipsTab } from './tabs/TipsTab'
import { HelpTab } from './tabs/HelpTab'
import { SettingsTab } from './tabs/SettingsTab'
import { useAuth } from '../hooks/useAuth'

export function AppShell() {
  const { user, error: authError, signInWithGoogle, signInWithEmail, register, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)

  useEffect(() => {
    setOnboardingDone(!!localStorage.getItem('dimlit_onboarding_done'))
  }, [])

  if (user === undefined || onboardingDone === null) return <div className="flex items-center justify-center h-full text-sm text-stone-400">Loading…</div>
  if (user === null) return <LoginScreen onGoogle={signInWithGoogle} onEmailSignIn={signInWithEmail} onRegister={register} error={authError} />
  if (!onboardingDone) return <OnboardingFlow onComplete={() => setOnboardingDone(true)} />

  return (
    <div className="flex flex-col h-full" style={{ background: '#faf7f0' }}>
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-stone-200">
        {/* DimLit logo — klick navigerar till Home */}
        <button onClick={() => setActiveTab('home')} className="font-bold text-lg" style={{ color: '#7c3aed' }}>
          DimLit
        </button>
      </div>

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className={`absolute inset-0 ${activeTab === 'home' ? 'block' : 'hidden'}`}><HomeTab user={user} onGoToMessages={() => setActiveTab('messages')} /></div>
        <div className={`absolute inset-0 flex flex-col ${activeTab === 'messages' ? 'flex' : 'hidden'}`}><MessagesTab user={user} country="Unknown" /></div>
        <div className={`absolute inset-0 ${activeTab === 'checkin' ? 'block' : 'hidden'}`}><CheckInTab /></div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'tips' ? 'block' : 'hidden'}`}><TipsTab /></div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'help' ? 'block' : 'hidden'}`}><HelpTab /></div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'settings' ? 'block' : 'hidden'}`}><SettingsTab username={user.username} onSignOut={signOut} /></div>
      </div>

      <div className="flex-shrink-0 border-t border-stone-200">
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}
