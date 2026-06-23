'use client'

import { useState, useEffect } from 'react'
import { FirebaseUserRepository } from '../../infrastructure/repositories/FirebaseUserRepository'
import type { User } from '../../domain/entities/User'

const userRepo = new FirebaseUserRepository()

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Timeout: if auth doesn't resolve in 5s, show login screen
    const timeout = setTimeout(() => {
      setUser((current) => current === undefined ? null : current)
    }, 5000)

    const unsubscribe = userRepo.onAuthStateChanged((u) => {
      clearTimeout(timeout)
      setUser(u)
    })

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    try { setError(null); await userRepo.signInWithGoogle() } catch (e) { setError(getErr(e)) }
  }
  async function signInWithEmail(email: string, password: string) {
    try { setError(null); await userRepo.signInWithEmailPassword(email, password) } catch (e) { setError(getErr(e)) }
  }
  async function register(email: string, password: string, username: string) {
    try { setError(null); await userRepo.registerWithEmailPassword(email, password, username) } catch (e) { setError(getErr(e)) }
  }
  async function signOut() { await userRepo.signOut() }
  async function updateUsername(username: string) {
    if (!user) return
    await userRepo.updateUsername(user.id, username)
    setUser({ ...user, username })
  }
  async function updatePassword(newPassword: string) { await userRepo.updatePassword(newPassword) }
  async function sendPasswordReset(email: string) { await userRepo.sendPasswordResetEmail(email) }
  async function deleteAccount() {
    if (!user) return
    await userRepo.deleteAccount(user.id)
  }
  async function sendVerificationEmail() { await userRepo.sendVerificationEmail() }
  async function reloadUser() {
    const verified = await userRepo.reloadUser()
    if (verified && user) setUser({ ...user, emailVerified: true })
    return verified
  }

  return { user, error, signInWithGoogle, signInWithEmail, register, signOut, updateUsername, updatePassword, sendPasswordReset, deleteAccount, sendVerificationEmail, reloadUser }
}

function getErr(e: unknown): string {
  if (e instanceof Error) {
    const code = (e as { code?: string }).code ?? ''
    if (code === 'auth/email-already-in-use') return 'This email is already in use.'
    if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') return 'Incorrect email or password.'
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.'
    if (code === 'auth/invalid-email') return 'Invalid email address.'
    if (code === 'auth/requires-recent-login') return 'Please sign out and sign back in before doing this.'
    if (code === 'auth/popup-closed-by-user') return ''
    return e.message
  }
  return 'Something went wrong.'
}
