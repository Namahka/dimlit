'use client'

import { useState } from 'react'

const BG = '#faf7f0'
const ACCENT = '#7c3aed'

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
  const [passwordMsg, setPasswordMsg] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newUsername.trim() || newUsername === username) return
    await onUpdateUsername(newUsername.trim())
    setUsernameSaved(true)
    setTimeout(() => setUsernameSaved(false), 2000)
  }

  async function handlePasswordReset() {
    if (!email) return
    setPasswordMsg('')
    try {
      await onSendPasswordReset(email)
      setPasswordMsg('Email sent! Check your inbox to reset your password.')
    } catch {
      setPasswordMsg('Could not send email. Try again.')
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== 'DELETE') return
    await onDeleteAccount()
  }

  return (
    <div className="overflow-y-auto h-full" style={{ background: BG }}>
      <div className="px-5 pt-6 pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-800">Settings</h2>
      </div>

      <div className="px-5 py-4 space-y-4 pb-12">

        {/* Change username */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
          <h3 className="font-semibold text-stone-800 text-sm mb-3">Change username</h3>
          <form onSubmit={handleUsernameSubmit} className="flex gap-2">
            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
              minLength={2} maxLength={24} required
              className="flex-1 px-3 py-2 rounded-xl text-sm border border-stone-200 outline-none text-stone-800" />
            <button type="submit" className="px-4 py-2 rounded-xl text-sm text-white font-medium"
              style={{ background: ACCENT }}>
              {usernameSaved ? 'Saved!' : 'Save'}
            </button>
          </form>
        </div>

        {/* Change password (email users only) */}
        {email && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
            <h3 className="font-semibold text-stone-800 text-sm mb-1">Change password</h3>
            <p className="text-xs text-stone-400 mb-3">A reset link will be sent to {email}</p>
            {passwordMsg && (
              <p className={`text-xs mb-2 ${passwordMsg.includes('sent') ? 'text-green-500' : 'text-red-400'}`}>
                {passwordMsg}
              </p>
            )}
            <button onClick={handlePasswordReset}
              className="w-full py-2.5 rounded-xl text-sm text-white font-medium"
              style={{ background: ACCENT }}>
              Send password reset email
            </button>
          </div>
        )}

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
          <h3 className="font-semibold text-stone-800 text-sm mb-2">Privacy</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Your exact location is never stored. Coordinates are rounded to ~10 km. You appear on the map only while the app is open.
          </p>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4">
          <h3 className="font-semibold text-stone-800 text-sm mb-1">About DimLit</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            DimLit shows you that others are awake with anxiety right now.
          </p>
          <p className="text-xs text-stone-300 mt-2">Version 0.1.0</p>
        </div>

        {/* Sign out */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button onClick={onSignOut}
            className="w-full text-left px-5 py-4 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
            Sign out
          </button>
        </div>

        {/* Delete account */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm px-5 py-4">
          <h3 className="font-semibold text-red-500 text-sm mb-2">Delete account</h3>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)}
              className="text-sm text-red-400 hover:text-red-600">
              I want to delete my account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-stone-500">Type DELETE to confirm. This cannot be undone.</p>
              <input type="text" placeholder="DELETE" value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border border-red-200 outline-none text-stone-800" />
              <button onClick={handleDelete} disabled={deleteConfirm !== 'DELETE'}
                className="w-full py-2.5 rounded-xl text-sm text-white font-medium bg-red-500 disabled:opacity-40">
                Delete my account permanently
              </button>
              <button onClick={() => setShowDelete(false)} className="text-xs text-stone-400 w-full text-center">
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
