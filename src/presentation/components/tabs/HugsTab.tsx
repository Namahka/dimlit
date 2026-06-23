'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firebaseApp'
import { useHugs } from '../../hooks/useHugs'
import type { User } from '../../../domain/entities/User'

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function HugsTab({ user, country }: { user: User; country: string }) {
  const { receivedHugs, sendHug, canSendHug } = useHugs(user.id)
  const [usernameMap, setUsernameMap] = useState<Record<string, string>>({})

  // Look up usernames for hugs that only have country code
  useEffect(() => {
    const toFetch = receivedHugs.filter(h =>
      !h.fromUsername || h.fromUsername === h.fromCountry
    )
    if (toFetch.length === 0) return

    Promise.all(
      toFetch.map(async h => {
        try {
          const snap = await getDoc(doc(db, 'users', h.fromUserId))
          if (snap.exists()) return [h.fromUserId, snap.data().username as string] as const
        } catch { /* ignore */ }
        return null
      })
    ).then(results => {
      const map: Record<string, string> = {}
      for (const r of results) { if (r) map[r[0]] = r[1] }
      setUsernameMap(prev => ({ ...prev, ...map }))
    })
  }, [receivedHugs.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Hugs</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Hugs you've received.</p>
      </div>

      <div className="px-5 py-4 space-y-2 pb-10">
        {receivedHugs.length === 0 && (
          <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>No hugs yet — tap a dot on the map to send one.</p>
        )}
        {receivedHugs.map((hug) => {
          const canSend = canSendHug(hug.fromUserId)
          const displayName = usernameMap[hug.fromUserId]
            ?? (hug.fromUsername && hug.fromUsername !== hug.fromCountry ? hug.fromUsername : null)
            ?? hug.fromCountry
          return (
            <div key={hug.id} className="px-4 py-3 rounded-2xl flex items-center justify-between gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{displayName}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{timeAgo(hug.sentAt)}</p>
              </div>
              {canSend ? (
                <button onClick={() => sendHug(hug.fromUserId, country, user.username)}
                  className="text-xs px-3 py-1.5 rounded-full text-white font-medium flex-shrink-0"
                  style={{ background: 'var(--accent)' }}>
                  Hug back
                </button>
              ) : (
                <span className="text-xs flex-shrink-0" style={{ color: '#555' }}>Hugged</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
