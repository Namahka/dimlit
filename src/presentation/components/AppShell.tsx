'use client'

import { useState, useEffect } from 'react'
import { BottomNav, type Tab } from './BottomNav'
import { LoginScreen } from './LoginScreen'
import { OnboardingFlow } from './OnboardingFlow'
import { EmailVerificationScreen } from './EmailVerificationScreen'
import { HomeTab } from './tabs/HomeTab'
import { MessagesTab } from './tabs/MessagesTab'
import { HelpTab } from './tabs/HelpTab'
import { TipsTab } from './tabs/TipsTab'
import { SettingsTab } from './tabs/SettingsTab'
import { useAuth } from '../hooks/useAuth'
import { usePresence } from '../hooks/usePresence'

export function AppShell() {
  const { user, error: authError, signInWithGoogle, signInWithEmail, register, signOut,
    updateUsername, sendPasswordReset, deleteAccount, sendVerificationEmail, reloadUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
  const { country } = usePresence(user ?? null)

  useEffect(() => {
    setOnboardingDone(!!localStorage.getItem('dimlit_onboarding_done'))
  }, [])

  if (user === undefined || onboardingDone === null) {
    return <div className="flex items-center justify-center h-full text-sm text-stone-400" style={{ background: '#faf7f0' }}>Loading…</div>
  }
  if (user === null) {
    return <LoginScreen onGoogle={signInWithGoogle} onEmailSignIn={signInWithEmail} onRegister={register} error={authError} />
  }

  // Email not verified (email/password users only)
  if (!user.emailVerified && user.email) {
    return (
      <EmailVerificationScreen
        email={user.email}
        onResend={sendVerificationEmail}
        onCheck={reloadUser}
        onSignOut={signOut}
      />
    )
  }

  if (!onboardingDone) {
    return <OnboardingFlow onComplete={() => setOnboardingDone(true)} />
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#faf7f0' }}>
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-stone-200">
        <button onClick={() => setActiveTab('home')} className="text-3xl font-love" style={{ color: '#7c3aed' }}>
          dimlit
        </button>
      </div>

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className={`absolute inset-0 ${activeTab === 'home' ? 'block' : 'hidden'}`}>
          <HomeTab user={user} onGoToMessages={() => setActiveTab('messages')} />
        </div>
        <div className={`absolute inset-0 flex flex-col ${activeTab === 'messages' ? 'flex' : 'hidden'}`}>
          <MessagesTab user={user} country={country} />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'tips' ? 'block' : 'hidden'}`}>
          <TipsTab />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'help' ? 'block' : 'hidden'}`}>
          <HelpTab />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'settings' ? 'block' : 'hidden'}`}>
          <SettingsTab
            username={user.username}
            email={user.email}
            onUpdateUsername={updateUsername}
            onSendPasswordReset={sendPasswordReset}
            onDeleteAccount={deleteAccount}
            onSignOut={signOut}
          />
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-stone-200">
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}
