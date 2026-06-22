'use client'

import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firebaseApp'
import { useMessages } from '../../hooks/useMessages'
import type { User } from '../../../domain/entities/User'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

async function reportMessage(messageId: string, text: string, reporterUserId: string) {
  try {
    await addDoc(collection(db, 'reports'), {
      messageId,
      text,
      reporterUserId,
      reportedAt: serverTimestamp(),
    })
    alert('Report sent. Thank you.')
  } catch {
    alert('Could not send report.')
  }
}

export function MessagesTab({ user, country }: { user: User; country: string }) {
  const { messages, sending, sendError, addMessage } = useMessages(user)
  const [text, setText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await addMessage(text, country)
    setText('')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Messages of Hope</h2>
        <p className="text-sm text-stone-400 mt-0.5">Anonymous words from people awake right now.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-center text-stone-300 mt-12">Be the first to leave a message tonight.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="px-4 py-3.5 rounded-2xl bg-white border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">{msg.username.slice(0, 1).toUpperCase()}</div>
                <span className="text-xs text-stone-400">{msg.username} · {timeAgo(msg.createdAt)}</span>
              </div>
              <button
                onClick={() => reportMessage(msg.id, msg.text, user.id)}
                className="text-xs text-stone-300 hover:text-red-400 transition-colors"
                title="Report this message"
              >
                Report
              </button>
            </div>
            <p className="text-sm leading-relaxed text-stone-700">{msg.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="px-5 pb-4 pt-3 border-t border-stone-200">
        <div className="flex gap-2">
          <input type="text" value={text}
            onChange={(e) => setText(e.target.value.slice(0, 280))}
            placeholder="Share something kind…"
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none bg-white border border-stone-200 text-stone-800 placeholder-stone-300" />
          <button type="submit" disabled={!text.trim() || sending}
            className="px-4 py-2.5 rounded-2xl text-sm font-medium text-white disabled:opacity-40 transition-colors"
            style={{ background: ACCENT }}>
            Send
          </button>
        </div>
        {sendError && <p className="text-xs mt-1 text-red-500">{sendError}</p>}
        <p className="text-xs mt-1 text-right text-stone-300">{text.length}/280</p>
      </form>
    </div>
  )
}
