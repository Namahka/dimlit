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

async function reportMessage(messageId: string, text: string, username: string, reporterUserId: string) {
  try {
    await addDoc(collection(db, 'reports'), { messageId, text, username, reporterUserId, reportedAt: serverTimestamp() })
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text, messageId }),
    })
    alert('Report sent. Thank you.')
  } catch { alert('Could not send report.') }
}

export function MessagesTab({ user, country }: { user: User; country: string }) {
  const { messages, sending, sendError, addMessage, toggleLike } = useMessages(user)
  const [text, setText] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await addMessage(text, country)
    setText('')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-3 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Messages of Hope</h2>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-2 leading-relaxed">
          Please keep messages kind and supportive. Harmful content will be removed.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-center text-stone-300 mt-12">Be the first to leave a message tonight.</p>
        )}
        {messages.map((msg) => {
          const liked = msg.likes.includes(user.id)
          return (
            <div key={msg.id} className="px-4 py-3.5 rounded-2xl bg-white border border-stone-100 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">
                    {msg.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs text-stone-400">{msg.username} · {timeAgo(msg.createdAt)}</span>
                </div>
                <button onClick={() => reportMessage(msg.id, msg.text, msg.username, user.id)}
                  className="text-xs text-stone-300 hover:text-red-400 transition-colors">
                  Report
                </button>
              </div>
              <p className="text-sm leading-relaxed text-stone-700 mb-2">{msg.text}</p>
              <button
                onClick={() => toggleLike(msg.id, user.id, liked)}
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: liked ? ACCENT : '#c4bfb8' }}
              >
                <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                {msg.likes.length > 0 && <span>{msg.likes.length}</span>}
              </button>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="px-5 pb-4 pt-3 border-t border-stone-200">
        <div className="flex gap-2">
          <input type="text" value={text}
            onChange={(e) => setText(e.target.value.slice(0, 280))}
            placeholder="Share something kind…"
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none bg-white border border-stone-200 text-stone-800 placeholder-stone-300" />
          <button type="submit" disabled={!text.trim() || sending}
            className="px-4 py-2.5 rounded-2xl text-sm font-medium text-white disabled:opacity-40"
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
