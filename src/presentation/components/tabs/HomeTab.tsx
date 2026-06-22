'use client'

import dynamic from 'next/dynamic'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firebaseApp'
import { useActiveUsers } from '../../hooks/useActiveUsers'
import { usePresence } from '../../hooks/usePresence'
import { useHugs } from '../../hooks/useHugs'
import { useMessages } from '../../hooks/useMessages'
import type { User } from '../../../domain/entities/User'

async function reportMessage(messageId: string, text: string, username: string, reporterUserId: string) {
  try {
    await addDoc(collection(db, 'reports'), { messageId, text, username, reporterUserId, reportedAt: serverTimestamp() })
    await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, text, messageId }) })
    alert('Report sent.')
  } catch { alert('Could not send report.') }
}

const ACCENT = '#7c3aed'
const MAP_MAX = 700

const MapCard = dynamic(
  () => import('./MapCardInner').then((m) => m.MapCardInner),
  { ssr: false, loading: () => <div style={{ height: 480, background: '#1a1a2e', borderRadius: 12 }} /> }
)

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function HomeTab({ user, onGoToMessages }: { user: User; onGoToMessages: () => void }) {
  const presences = useActiveUsers(user.id)
  const { country, userCoords, isReady, locationDenied, requestLocation } = usePresence(user)
  const { latestHug, sendHug, clearLatestHug } = useHugs(user.id)
  const { messages, toggleLike } = useMessages(user)

  return (
    <div className="overflow-y-auto h-full" style={{ background: '#faf7f0' }}>
      <div className="px-5 py-5">

        {/* Hug banner */}
        {latestHug && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-violet-50 border border-violet-200 mb-4">
            <span className="text-xl">🤗</span>
            <p className="text-sm text-violet-800 flex-1">Someone from {latestHug.fromCountry} sent you a hug</p>
            <button onClick={clearLatestHug} className="text-violet-300 text-xl">×</button>
          </div>
        )}

        {/* Welcome — full width */}
        <div className="mb-5">
          <p className="text-sm text-stone-400">Welcome back,</p>
          <h1 className="text-3xl font-bold text-stone-800">{user.username}</h1>
        </div>

        {/* Map block — centered, max 700px */}
        <div style={{ maxWidth: MAP_MAX, margin: '0 auto' }}>

          {/* Count pill — above the map */}
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
              <span className="text-sm text-stone-700 font-medium">
                {presences.length === 0 ? "You're not alone"
                  : presences.length === 1 ? '1 person is here with you'
                  : `${presences.length} people here to make you feel less alone`}
              </span>
            </div>
          </div>

          {locationDenied && (
            <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl mb-3">
              <p className="text-sm text-amber-700">Allow location to appear on the map.</p>
              <button onClick={requestLocation} className="text-xs font-medium text-white bg-amber-500 px-3 py-1.5 rounded-full">Allow</button>
            </div>
          )}

          {/* Map */}
          <MapCard presences={presences} userId={user.id} userCoords={userCoords} isReady={isReady}
            onSendHug={async (id) => { await sendHug(id, country) }} />

          {/* Lift each other up — same width as map, directly below */}
          <div className="mt-4 bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h2 className="font-semibold text-stone-800">Lift each other up</h2>
              <button onClick={onGoToMessages} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base leading-none"
                style={{ background: ACCENT }}>+</button>
            </div>
            {messages.length === 0 ? (
              <p className="text-sm text-stone-400 px-5 pb-4">Be the first to share something right now.</p>
            ) : (
              <>
                <div className="divide-y divide-stone-50">
                  {messages.slice(0, 3).map((msg) => {
                    const liked = msg.likes.includes(user.id)
                    return (
                      <div key={msg.id} className="px-5 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">{msg.username.slice(0, 1).toUpperCase()}</div>
                            <span className="text-xs text-stone-400">{msg.username} · {timeAgo(msg.createdAt)}</span>
                          </div>
                          <button onClick={() => reportMessage(msg.id, msg.text, msg.username, user.id)}
                            className="text-xs text-stone-300 hover:text-red-400 transition-colors">Report</button>
                        </div>
                        <p className="text-sm text-stone-700 leading-relaxed mb-1.5">{msg.text}</p>
                        <button onClick={() => toggleLike(msg.id, user.id, liked)}
                          className="flex items-center gap-1 text-xs transition-colors"
                          style={{ color: liked ? ACCENT : '#c4bfb8' }}>
                          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                          {msg.likes.length > 0 && <span>{msg.likes.length}</span>}
                        </button>
                      </div>
                    )
                  })}
                </div>
                {messages.length > 3 && (
                  <button onClick={onGoToMessages} className="w-full text-center text-sm py-3 border-t border-stone-50" style={{ color: ACCENT }}>
                    See all {messages.length} →
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
