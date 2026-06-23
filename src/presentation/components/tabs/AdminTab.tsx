'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firebaseApp'

const BG = 'var(--bg)'
const ACCENT = 'var(--accent)'

interface UserRecord { id: string; username: string; email?: string }
interface MessageRecord { id: string; username: string; userId: string; text: string; createdAt: Date }
interface ReportRecord { id: string; username: string; text: string; messageId: string; reportedAt: Date }

export function AdminTab() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [messages, setMessages] = useState<MessageRecord[]>([])
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [activeSection, setActiveSection] = useState<'messages' | 'users' | 'reports'>('messages')
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [userMessages, setUserMessages] = useState<MessageRecord[]>([])

  async function loadAll() {
    const [uSnap, mSnap, rSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'reports'), orderBy('reportedAt', 'desc'))),
    ])
    setUsers(uSnap.docs.map(d => ({ id: d.id, username: d.data().username, email: d.data().email })))
    setMessages(mSnap.docs.map(d => ({ id: d.id, username: d.data().username ?? 'Unknown', userId: d.data().userId, text: d.data().text, createdAt: d.data().createdAt?.toDate() ?? new Date() })))
    setReports(rSnap.docs.map(d => ({ id: d.id, username: d.data().username ?? 'Unknown', text: d.data().text, messageId: d.data().messageId, reportedAt: d.data().reportedAt?.toDate() ?? new Date() })))
  }

  useEffect(() => { loadAll() }, [])

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    await deleteDoc(doc(db, 'messages', id))
    setMessages(prev => prev.filter(m => m.id !== id))
    setUserMessages(prev => prev.filter(m => m.id !== id))
  }

  async function viewUser(u: UserRecord) {
    setSelectedUser(u)
    const snap = await getDocs(query(collection(db, 'messages'), where('userId', '==', u.id), orderBy('createdAt', 'desc')))
    setUserMessages(snap.docs.map(d => ({ id: d.id, username: d.data().username ?? 'Unknown', userId: d.data().userId, text: d.data().text, createdAt: d.data().createdAt?.toDate() ?? new Date() })))
  }

  if (selectedUser) {
    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
        <div className="px-5 pt-5 pb-4 border-b border-stone-200">
          <button onClick={() => setSelectedUser(null)} className="text-sm mb-2" style={{ color: ACCENT }}>← Back</button>
          <h2 className="text-lg font-bold text-stone-800">{selectedUser.username}</h2>
          <p className="text-xs text-stone-400">{selectedUser.email ?? 'Google user'}</p>
          <p className="text-xs text-stone-300">{selectedUser.id}</p>
        </div>
        <div className="px-5 py-4 space-y-2 pb-10">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">All messages by this user</p>
          {userMessages.length === 0 && <p className="text-sm text-stone-300">No messages.</p>}
          {userMessages.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-stone-700 flex-1">{m.text}</p>
                <button onClick={() => deleteMessage(m.id)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">Delete</button>
              </div>
              <p className="text-xs text-stone-300 mt-1">{m.createdAt.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Admin</h2>
        <div className="flex gap-2 mt-3">
          {(['messages', 'users', 'reports'] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium capitalize"
              style={{ background: activeSection === s ? ACCENT : '#e7e5e4', color: activeSection === s ? '#fff' : '#78716c' }}>
              {s} ({s === 'messages' ? messages.length : s === 'users' ? users.length : reports.length})
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-2 pb-10">
        {activeSection === 'messages' && messages.map(m => (
          <div key={m.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-stone-400 mb-1">{m.username}</p>
                <p className="text-sm text-stone-700">{m.text}</p>
              </div>
              <button onClick={() => deleteMessage(m.id)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">Delete</button>
            </div>
          </div>
        ))}

        {activeSection === 'users' && users.map(u => (
          <button key={u.id} onClick={() => viewUser(u)} className="w-full text-left bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3">
            <p className="text-sm font-medium text-stone-700">{u.username}</p>
            <p className="text-xs text-stone-400">{u.email ?? 'Google user'}</p>
            <p className="text-xs mt-1" style={{ color: ACCENT }}>View messages →</p>
          </button>
        ))}

        {activeSection === 'reports' && reports.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-red-100 shadow-sm px-4 py-3">
            <p className="text-xs text-stone-400 mb-1">Reported: <span className="font-medium text-stone-600">{r.username}</span></p>
            <p className="text-sm text-stone-700 mb-1">{r.text}</p>
            <p className="text-xs text-stone-300">{r.reportedAt.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
