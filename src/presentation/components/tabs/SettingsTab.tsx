'use client'

import { useState } from 'react'

interface Props {
  username: string
  email?: string
  onUpdateUsername: (u: string) => Promise<void>
  onSendPasswordReset: (email: string) => Promise<void>
  onDeleteAccount: () => Promise<void>
  onSignOut: () => void
}

export function SettingsTab({ username, email, onUpdateUsername, onSendPasswordReset, onDeleteAccount, onSignOut }: Props) {
  const [newUsername, setNewUsername] = useState(username)
  const [usernameSaved, setUsernameSaved] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteEmailSent, setDeleteEmailSent] = useState(false)

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newUsername.trim() || newUsername === username) return
    await onUpdateUsername(newUsername.trim())
    setUsernameSaved(true)
    setTimeout(() => setUsernameSaved(false), 2000)
  }

  async function handleDelete() {
    await onDeleteAccount()
  }

  const cardStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }
  const inputStyle = { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 12px', fontSize: 14, outline: 'none', width: '100%' }

  return (
    <div className="overflow-y-auto h-full" style={{ background: 'var(--bg)' }}>
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Settings</h2>
      </div>
      <div className="px-5 py-4 space-y-4 pb-12">

        {/* Username */}
        <div className="px-5 py-4" style={cardStyle}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Change username</h3>
          <form onSubmit={handleUsernameSubmit} className="flex gap-2">
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
              minLength={2} maxLength={24} required style={{ ...inputStyle, flex: 1 }} />
            <button type="submit" className="px-4 py-2 rounded-xl text-sm text-white font-medium" style={{ background: 'var(--accent)' }}>
              {usernameSaved ? 'Saved!' : 'Save'}
            </button>
          </form>
        </div>

        {/* Sign out */}
        <div className="px-5 py-4" style={cardStyle}>
          <button onClick={onSignOut} className="w-full py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            Sign out
          </button>
        </div>

        {/* Delete */}
        <div className="px-5 py-4" style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.3)' }}>
          <h3 className="font-semibold text-sm mb-2" style={{ color: '#ef4444' }}>Delete account</h3>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="text-sm" style={{ color: '#ef4444' }}>
              I want to delete my account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Are you sure? This cannot be undone.</p>
              <button onClick={handleDelete} className="w-full py-2.5 rounded-xl text-sm text-white font-medium bg-red-500">
                Yes, delete my account
              </button>
              <button onClick={() => setShowDelete(false)} className="text-xs w-full text-center" style={{ color: '#555' }}>Cancel</button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
