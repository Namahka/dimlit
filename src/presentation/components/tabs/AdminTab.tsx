'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firebaseApp'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

interface UserRecord { id: string; username: string; email?: string }
interface MessageRecord { id: string; username: string; text: string; createdAt: Date }

export function AdminTab() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [messages, setMessages] = useState<MessageRecord[]>([])
  const [activeSection, setActiveSection] = useState<'users' | 'messages'>('messages')

  async function loadUsers() {
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ id: d.id, username: d.data().username, email: d.data().email })))
  }

  async function loadMessages() {
    const snap = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')))
    setMessages(snap.docs.map(d => ({
      id: d.id,
      username: d.data().username ?? 'Unknown',
      text: d.data().text,
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    })))
  }

  useEffect(() => {
    loadUsers()
    loadMessages()
  }, [])

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    await deleteDoc(doc(db, 'messages', id))
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user from Firestore? (Firebase Auth account must be deleted separately)')) return
    await deleteDoc(doc(db, 'users', id))
    await deleteDoc(doc(db, 'presences', id))
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Admin</h2>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setActiveSection('messages')}
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: activeSection === 'messages' ? ACCENT : '#e7e5e4', color: activeSection === 'messages' ? '#fff' : '#78716c' }}>
            Messages ({messages.length})
          </button>
          <button onClick={() => setActiveSection('users')}
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: activeSection === 'users' ? ACCENT : '#e7e5e4', color: activeSection === 'users' ? '#fff' : '#78716c' }}>
            Users ({users.length})
          </button>
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
              <button onClick={() => deleteMessage(m.id)}
                className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">
                Delete
              </button>
            </div>
          </div>
        ))}

        {activeSection === 'users' && users.map(u => (
          <div key={u.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-stone-700">{u.username}</p>
                <p className="text-xs text-stone-400">{u.email ?? 'No email (Google)'}</p>
                <p className="text-xs text-stone-300">{u.id}</p>
              </div>
              <button onClick={() => deleteUser(u.id)}
                className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
