'use client'

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
  const { receivedHugs, sendHug, sentThisSession } = useHugs(user.id)

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Hugs</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Hugs you've received.</p>
      </div>
      <div className="px-5 py-4 space-y-2 pb-10">
        {receivedHugs.length === 0 && (
          <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>No hugs yet.</p>
        )}
        {receivedHugs.map((hug) => {
          const alreadySent = sentThisSession.has(hug.fromUserId)
          const displayName = hug.fromUsername && hug.fromUsername !== hug.fromCountry
            ? hug.fromUsername : hug.fromCountry
          return (
            <div key={hug.id} className="px-4 py-3 rounded-2xl flex items-center justify-between gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{displayName}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{timeAgo(hug.sentAt)}</p>
              </div>
              {/* 5 & 6: Hug back or Hugged */}
              {alreadySent ? (
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Hugged</span>
              ) : (
                <button onClick={() => sendHug(hug.fromUserId, country, user.username)}
                  className="text-xs px-3 py-1.5 rounded-full text-white font-medium flex-shrink-0"
                  style={{ background: 'var(--accent)' }}>
                  Hug back
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
