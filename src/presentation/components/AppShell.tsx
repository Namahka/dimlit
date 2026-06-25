'use client'

import { useState, useEffect } from 'react'
import { BottomNav, type Tab } from './BottomNav'
import { LoginScreen } from './LoginScreen'
import { OnboardingFlow } from './OnboardingFlow'
import { HomeTab } from './tabs/HomeTab'
import { MessagesTab } from './tabs/MessagesTab'
import { HugsTab } from './tabs/HugsTab'
import { TipsTab } from './tabs/TipsTab'
import { HelpTab } from './tabs/HelpTab'
import { SettingsTab } from './tabs/SettingsTab'
import { AdminTab } from './tabs/AdminTab'
import { DistractTab } from './tabs/DistractTab'
import { useAuth } from '../hooks/useAuth'
import { usePresence } from '../hooks/usePresence'
import { useHugs } from '../hooks/useHugs'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../infrastructure/firebase/firebaseApp'

const ADMIN_EMAIL = 'namahka@hotmail.com'

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
)

export function AppShell() {
  const { user, error: authError, signInWithGoogle, signOut,
    updateUsername, sendPasswordReset, deleteAccount, sendVerificationEmail, reloadUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
  const [totalReports, setTotalReports] = useState(0)
  const [seenReportCount, setSeenReportCount] = useState(0)
  const [seenHugIds, setSeenHugIds] = useState<Set<string>>(new Set())
  const reportCount = Math.max(0, totalReports - seenReportCount)
  const [locationEnabled, setLocationEnabled] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('dimlit_location_enabled') !== '0' : true
  )
  const { country } = usePresence(user ?? null, locationEnabled)
  const { receivedHugs } = useHugs(user?.id ?? null)

  const isAdmin = user?.email === ADMIN_EMAIL
  const hugCount = receivedHugs.filter(h => !seenHugIds.has(h.id)).length

  // Load seen hug IDs from localStorage when user is known
  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem(`dimlit_seen_hug_ids_${user.id}`)
      setSeenHugIds(new Set(stored ? JSON.parse(stored) : []))
    } catch { setSeenHugIds(new Set()) }
    setActiveTab('home')
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // When user opens Hugs tab, mark ALL current hugs as seen
  useEffect(() => {
    if (activeTab !== 'hugs' || !user) return
    if (receivedHugs.length === 0) return
    const ids = receivedHugs.map(h => h.id)
    setSeenHugIds(prev => {
      const next = new Set([...prev, ...ids])
      try { localStorage.setItem(`dimlit_seen_hug_ids_${user.id}`, JSON.stringify([...next])) } catch {}
      return next
    })
  }, [activeTab, user?.id, receivedHugs.map(h => h.id).join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    import('firebase/firestore').then(({ doc, getDoc }) => {
      import('../../infrastructure/firebase/firebaseApp').then(({ db }) => {
        getDoc(doc(db, 'users', user.id))
          .then(snap => setOnboardingDone(!!(snap.exists() && snap.data().onboardingDone)))
          .catch(() => setOnboardingDone(true)) // on error, skip onboarding
      })
    })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Live report count for admin badge
  useEffect(() => {
    if (!isAdmin) return
    const unsub = onSnapshot(collection(db, 'reports'), snap => {
      setTotalReports(snap.size)
    }, () => {})
    return unsub
  }, [isAdmin])

  // Clear admin badge when admin tab is opened
  useEffect(() => {
    if (activeTab === 'admin') {
      setSeenReportCount(prev => Math.max(prev, totalReports))
    }
  }, [activeTab, totalReports])

  // Only show loading while auth is resolving (undefined)
  // If user is null (not logged in), skip straight to login screen
  if (user === undefined) {
    return <div className="flex items-center justify-center h-full text-sm text-neutral-500" style={{ background: 'var(--bg)' }}>Loading…</div>
  }
  if (user === null) {
    return <LoginScreen onGoogle={signInWithGoogle} error={authError} />
  }
  // User is logged in but onboarding check still running — show app skeleton briefly
  if (onboardingDone === null) {
    return <div className="flex items-center justify-center h-full text-sm text-neutral-500" style={{ background: 'var(--bg)' }}>Loading…</div>
  }
  if (!onboardingDone) {
    return <OnboardingFlow user={user} onUpdateUsername={updateUsername} onComplete={() => setOnboardingDone(true)} />
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button onClick={() => setActiveTab('home')} className="text-3xl font-dimlit" style={{ color: 'var(--accent)' }}>
          dimlit
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setActiveTab('help')}
            className="p-2 rounded-xl transition-colors"
            style={{ color: activeTab === 'help' ? 'var(--accent)' : '#555' }}
            title="I need help">
            <HelpIcon />
          </button>
          <button onClick={() => setActiveTab('settings')}
            className="p-2 rounded-xl transition-colors"
            style={{ color: activeTab === 'settings' ? 'var(--accent)' : '#555' }}
            title="Settings">
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <div className={`absolute inset-0 ${activeTab === 'home' ? 'block' : 'hidden'}`}>
          <HomeTab user={user} onGoToMessages={() => setActiveTab('messages')} />
        </div>
        <div className={`absolute inset-0 flex flex-col ${activeTab === 'messages' ? 'flex' : 'hidden'}`}>
          <MessagesTab user={user} country={country} />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'hugs' ? 'block' : 'hidden'}`}>
          <HugsTab user={user} country={country} />
        </div>
        <div className={`absolute inset-0 ${activeTab === 'distract' ? 'block' : 'hidden'}`}>
          <DistractTab />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'tips' ? 'block' : 'hidden'}`}>
          <TipsTab />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'help' ? 'block' : 'hidden'}`}>
          <HelpTab />
        </div>
        <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'settings' ? 'block' : 'hidden'}`}>
          <SettingsTab username={user.username} email={user.email}
            locationEnabled={locationEnabled}
            onToggleLocation={async (val) => {
              setLocationEnabled(val)
              if (!val) {
                const anonLat = Math.round((Math.random() * 160 - 80) * 10) / 10
                const anonLng = Math.round((Math.random() * 360 - 180) * 10) / 10
                await setDoc(doc(db, 'presences', user.id), {
                  userId: user.id, username: 'Anonymous', isAnonymous: true,
                  latitude: anonLat, longitude: anonLng,
                  country: 'Unknown', isActive: true, lastSeen: serverTimestamp(),
                }).catch(() => {})
              } else {
                await updateDoc(doc(db, 'presences', user.id), {
                  username: user.username, isAnonymous: false,
                }).catch(() => {})
              }
            }}
            onUpdateUsername={updateUsername}
            onSendPasswordReset={sendPasswordReset} onDeleteAccount={deleteAccount} onSignOut={signOut} />
        </div>
        {isAdmin && (
          <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'admin' ? 'block' : 'hidden'}`}>
            <AdminTab />
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-neutral-700">
        <BottomNav active={activeTab} onChange={setActiveTab} isAdmin={isAdmin} hugCount={hugCount} reportCount={reportCount} />
      </div>
    </div>
  )
}
