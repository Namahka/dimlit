'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, onSnapshot, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../../infrastructure/firebase/firebaseApp'

interface UserRecord { id: string; username: string; email?: string }
interface MessageRecord { id: string; username: string; userId: string; text: string; createdAt: Date }
interface ReportRecord { id: string; username: string; text: string; messageId: string; reportedAt: Date }

export function AdminTab() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [messages, setMessages] = useState<MessageRecord[]>([])
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [reportedMessageIds, setReportedMessageIds] = useState<Set<string>>(new Set())
  const [reportedUserIds, setReportedUserIds] = useState<Set<string>>(new Set())
  const [solvedUserIds, setSolvedUserIds] = useState<Set<string>>(new Set())
  const [activeSection, setActiveSection] = useState<'users' | 'messages' | 'reports'>('users')
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [userMessages, setUserMessages] = useState<MessageRecord[]>([])
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)

    const uSnap = await getDocs(collection(db, 'users')).catch(() => null)
    const mSnap = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc'))).catch(() => null)
    const rSnap = await getDocs(query(collection(db, 'reports'), orderBy('reportedAt', 'desc'))).catch(() => null)

    const userList = uSnap?.docs.map(d => ({ id: d.id, username: d.data().username ?? 'Unknown', email: d.data().email })) ?? []
    const msgList = mSnap?.docs.map(d => ({ id: d.id, username: d.data().username ?? 'Unknown', userId: d.data().userId ?? '', text: d.data().text ?? '', createdAt: d.data().createdAt?.toDate() ?? new Date() })) ?? []
    const repList = rSnap?.docs.map(d => ({ id: d.id, username: d.data().username ?? 'Unknown', text: d.data().text ?? '', messageId: d.data().messageId ?? '', reportedAt: d.data().reportedAt?.toDate() ?? new Date() })) ?? []

    setUsers(userList)
    setMessages(msgList)
    setReports(repList)

    const repMsgIds = new Set(repList.map(r => r.messageId))
    setReportedMessageIds(repMsgIds)
    const repUserIds = new Set<string>()
    repList.forEach(r => {
      const m = msgList.find(x => x.id === r.messageId)
      if (m) repUserIds.add(m.userId)
    })
    setReportedUserIds(repUserIds)
    setLoading(false)
  }

  useEffect(() => {
    // Live messages listener
    const unsubMsg = onSnapshot(
      query(collection(db, 'messages'), orderBy('createdAt', 'desc')),
      (snap) => {
        setMessages(snap.docs.map(d => ({
          id: d.id, username: d.data().username ?? 'Unknown', userId: d.data().userId ?? '',
          text: d.data().text ?? '', createdAt: d.data().createdAt?.toDate() ?? new Date(),
        })))
      }, () => {}
    )
    // Live users listener
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, username: d.data().username, email: d.data().email })))
    }, () => {})
    // Live reports listener
    const unsub = onSnapshot(
      query(collection(db, 'reports'), orderBy('reportedAt', 'desc')),
      (snap) => {
        const repList = snap.docs.map(d => ({
          id: d.id, username: d.data().username ?? 'Unknown',
          text: d.data().text ?? '', messageId: d.data().messageId ?? '',
          reportedAt: d.data().reportedAt?.toDate() ?? new Date(),
        }))
        setReports(repList)
        const repMsgIds = new Set(repList.map(r => r.messageId))
        setReportedMessageIds(repMsgIds)
      },
      () => {}
    )
    return () => { unsubMsg(); unsubUsers(); unsub() }
  }, [])

  async function deleteMessage(id: string) {
    await deleteDoc(doc(db, 'messages', id)).catch(e => { alert('Error: ' + e.message); return })
    setMessages(prev => prev.filter(m => m.id !== id))
    setUserMessages(prev => prev.filter(m => m.id !== id))
    // Also delete all reports for this message
    const linkedReports = reports.filter(r => r.messageId === id)
    await Promise.all(linkedReports.map(r => deleteDoc(doc(db, 'reports', r.id)).catch(() => {})))
  }

  function viewUser(u: UserRecord) {
    setSelectedUser(u)
    setUserMessages(messages.filter(m => m.userId === u.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
  }

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }

  if (selectedUser) {
    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSelectedUser(null)} className="text-sm mb-2" style={{ color: 'var(--accent)' }}>Back</button>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{selectedUser.username}</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedUser.email ?? 'Google user'}</p>
        </div>
        <div className="px-5 py-4 space-y-2 pb-10">
          {userMessages.length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No messages.</p>}
          {userMessages.map(m => (
            <div key={m.id} className="px-4 py-3 rounded-2xl" style={{ ...card, borderColor: reportedMessageIds.has(m.id) ? 'rgba(239,68,68,0.5)' : 'var(--border)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {reportedMessageIds.has(m.id) && <span className="text-xs text-red-400 font-medium block mb-1">Reported</span>}
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{m.text}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{m.createdAt.toLocaleString()}</p>
                </div>
                <button onClick={() => deleteMessage(m.id)} className="text-xs text-red-400 flex-shrink-0">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Admin</h2>
        <div className="flex gap-2 mt-3">
          {(['users', 'messages', 'reports'] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)} className="px-3 py-1.5 rounded-full text-xs font-medium capitalize"
              style={{ background: activeSection === s ? 'var(--accent)' : 'var(--surface-2)', color: activeSection === s ? '#fff' : 'var(--text-muted)' }}>
              {s} ({s === 'users' ? users.length : s === 'messages' ? messages.length : reports.length})
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 py-4 space-y-2 pb-10">
        {activeSection === 'users' && users.map(u => (
          <button key={u.id} onClick={() => viewUser(u)} className="w-full text-left px-4 py-3 rounded-2xl"
            style={{ ...card, borderColor: reportedUserIds.has(u.id) ? 'rgba(239,68,68,0.4)' : 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.username}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email ?? 'Google user'}</p>
              </div>
              {solvedUserIds.has(u.id)
                ? <span className="text-xs text-green-500 font-medium">Solved</span>
                : reportedUserIds.has(u.id) && <span className="text-xs text-red-400 font-medium">Reported</span>}
            </div>
          </button>
        ))}

        {/* Messages and Reports use identical card layout */}
        {(activeSection === 'messages' ? messages.map(m => ({ id: m.id, username: m.username, text: m.text, date: m.createdAt, isReport: false, reportId: '', messageId: m.id }))
          : reports.map(r => ({ id: r.id, username: r.username, text: r.text, date: r.reportedAt, isReport: true, reportId: r.id, messageId: r.messageId }))
        ).map(item => (
          <div key={item.id} className="px-4 py-3 rounded-2xl"
            style={{ ...card, borderColor: item.isReport ? 'rgba(239,68,68,0.4)' : 'var(--border)' }}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {item.isReport ? <span style={{ color: '#ef4444' }}>Reported</span> : null} <span style={{ color: 'var(--text)' }}>{item.username}</span>
              </p>
              <p className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{item.date.toLocaleString()}</p>
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>{item.text}</p>
            <div className="flex gap-2">
              <button onClick={async () => {
                const res = await deleteDoc(doc(db, 'messages', item.messageId)).catch(e => e)
                if (res instanceof Error) { alert('Error: ' + res.message); return }
                const linked = reports.filter(r => r.messageId === item.messageId)
                await Promise.all(linked.map(r => deleteDoc(doc(db, 'reports', r.id)).catch(() => {})))
              }} className="text-xs px-3 py-1.5 rounded-full text-white font-medium" style={{ background: '#ef4444' }}>
                Delete
              </button>
              <button onClick={async () => {
                // Dismiss = keep message, just remove report if any
                if (item.isReport) {
                  await deleteDoc(doc(db, 'reports', item.reportId)).catch(() => {})
                }
                // For messages: just mark as reviewed (no action)
              }} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
