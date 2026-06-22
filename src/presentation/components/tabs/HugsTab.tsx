'use client'

import { useHugs } from '../../hooks/useHugs'
import type { User } from '../../../domain/entities/User'
import { useActiveUsers } from '../../hooks/useActiveUsers'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface Props {
  user: User
  country: string
}

export function HugsTab({ user, country }: Props) {
  const { receivedHugs, sendHug } = useHugs(user.id)
  const presences = useActiveUsers(user.id)

  async function handleSendBack(toUserId: string) {
    await sendHug(toUserId, country)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Hugs</h2>
        <p className="text-sm text-stone-400 mt-0.5">Hugs you've received — and people awake right now.</p>
      </div>

      <div className="px-5 py-4 space-y-4 pb-10">
        {/* Received hugs */}
        {receivedHugs.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Received</p>
            <div className="space-y-2">
              {receivedHugs.map((hug) => {
                const sender = presences.find(p => p.userId === hug.fromUserId)
                return (
                  <div key={hug.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-stone-700">🤗 From <span className="font-medium">{hug.fromCountry}</span></p>
                      <p className="text-xs text-stone-400 mt-0.5">{timeAgo(hug.sentAt)}</p>
                    </div>
                    {sender && (
                      <button onClick={() => handleSendBack(hug.fromUserId)}
                        className="text-xs px-3 py-1.5 rounded-full text-white font-medium"
                        style={{ background: ACCENT }}>
                        Hug back
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {receivedHugs.length === 0 && (
          <p className="text-sm text-stone-300 text-center mt-8">No hugs yet — tap a dot on the map to send one.</p>
        )}

        {/* People awake now */}
        {presences.filter(p => p.userId !== user.id).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Awake right now</p>
            <div className="space-y-2">
              {presences.filter(p => p.userId !== user.id).map((p) => (
                <div key={p.userId} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-700">{p.username}</p>
                    <p className="text-xs text-stone-400">{p.city ? `${p.city}, ${p.country}` : p.country}</p>
                  </div>
                  <button onClick={() => handleSendBack(p.userId)}
                    className="text-xs px-3 py-1.5 rounded-full text-white font-medium"
                    style={{ background: ACCENT }}>
                    Send hug
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
