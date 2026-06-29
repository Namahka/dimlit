'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firebaseApp'
import { useActiveUsers } from '../../hooks/useActiveUsers'
import { useHugs } from '../../hooks/useHugs'
import { useMessages } from '../../hooks/useMessages'
import type { User } from '../../../domain/entities/User'

async function reportMessage(messageId: string, text: string, username: string, reporterUserId: string) {
  await addDoc(collection(db, 'reports'), { messageId, text, username, reporterUserId, reportedAt: serverTimestamp() }).catch(() => {})
}

const ACCENT = 'var(--accent)'
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

export function HomeTab({ user, country, userCoords, isReady, onGoToMessages }: { user: User; country: string; userCoords: [number, number] | null; isReady: boolean; onGoToMessages: () => void }) {
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set())
  const presences = useActiveUsers(user.id)
  const { latestHug, sendHug, canSendHug, clearLatestHug } = useHugs(user.id)
  const { messages, toggleLike } = useMessages(user)

  return (
    <div className="overflow-y-auto h-full" style={{ background: 'var(--bg)' }}>
      <div className="px-5 py-5">

        {/* Hug banner */}

        {/* Welcome */}
        <div className="mb-5">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Welcome back,</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{user.username}</h1>
        </div>

        {/* Map block — centered, max 700px */}
        <div style={{ maxWidth: MAP_MAX, margin: '0 auto' }}>

          {/* Count pill — above the map */}
          <div className="flex items-center gap-2 mb-3">
            {(() => {
              const others = presences.filter(p => p.userId !== user.id)
              if (others.length === 0) {
                return (
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    You&apos;re the only one here at the moment. Try the quizzes in <span style={{ color: ACCENT }}>Distract</span> if you need to think of something else for a while.
                  </div>
                )
              }
              return (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {others.length === 1 ? '1 person is here with you' : `${others.length} people are here with you`}
                  </span>
                </div>
              )
            })()}
          </div>


          {/* Map */}
          <MapCard presences={presences} userId={user.id} userCoords={userCoords} isReady={isReady}
            onSendHug={async (id) => { await sendHug(id, country, user.username) }}
            canSendHug={canSendHug} />

          {/* Lift each other up — same width as map, directly below */}
          <div className="mt-4 bg-neutral-800 rounded-2xl border border-neutral-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h2 className="font-semibold text-neutral-200">Lift each other up</h2>
              <button onClick={onGoToMessages} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-base leading-none"
                style={{ background: ACCENT }}>+</button>
            </div>
            {messages.length === 0 ? (
              <p className="text-sm text-neutral-500 px-5 pb-4">Be the first to share something today.</p>
            ) : (
              <>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {messages.slice(0, 3).map((msg) => {
                    const liked = msg.likes.includes(user.id)
                    return (
                      <div key={msg.id} className="px-5 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{msg.username}</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {timeAgo(msg.createdAt)}</span>
                          </div>
                          {reportedIds.has(msg.id) ? (
                            <span className="text-xs" style={{ color: '#555' }}>Reported</span>
                          ) : (
                            <button onClick={async () => { await reportMessage(msg.id, msg.text, msg.username, user.id); setReportedIds(p => new Set(p).add(msg.id)) }}
                              className="text-xs" style={{ color: '#555' }}>Report</button>
                          )}
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed mb-1.5">{msg.text}</p>
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
                  <button onClick={onGoToMessages} className="w-full text-center text-sm py-3 border-t border-neutral-700" style={{ color: ACCENT }}>
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
