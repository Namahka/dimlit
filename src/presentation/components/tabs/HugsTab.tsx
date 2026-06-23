'use client'

import { useHugs } from '../../hooks/useHugs'
import type { User } from '../../../domain/entities/User'

const BG = 'var(--bg)'
const ACCENT = 'var(--accent)'

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function HugsTab({ user, country }: { user: User; country: string }) {
  const { receivedHugs, sendHug, canSendHug } = useHugs(user.id)

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Hugs</h2>
        <p className="text-sm text-stone-400 mt-0.5">Hugs you've received.</p>
      </div>

      <div className="px-5 py-4 space-y-2 pb-10">
        {receivedHugs.length === 0 && (
          <p className="text-sm text-stone-300 text-center mt-8">No hugs yet — tap a dot on the map to send one.</p>
        )}
        {receivedHugs.map((hug) => {
          const canSend = canSendHug(hug.fromUserId)
          return (
            <div key={hug.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-700">{hug.fromUsername || hug.fromCountry}</p>
                <p className="text-xs text-stone-400 mt-0.5">{timeAgo(hug.sentAt)}</p>
              </div>
              {canSend ? (
                <button onClick={() => sendHug(hug.fromUserId, country, user.username)}
                  className="text-xs px-3 py-1.5 rounded-full text-white font-medium flex-shrink-0"
                  style={{ background: ACCENT }}>
                  Hug back
                </button>
              ) : (
                <span className="text-xs text-stone-300 flex-shrink-0">Hugged</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
