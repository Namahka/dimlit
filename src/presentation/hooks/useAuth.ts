'use client'

import { useState, useEffect } from 'react'
import { FirebaseUserRepository } from '../../infrastructure/repositories/FirebaseUserRepository'
import type { User } from '../../domain/entities/User'

const userRepo = new FirebaseUserRepository()

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(undefined) // undefined = loading
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = userRepo.onAuthStateChanged(setUser)
    return unsubscribe
  }, [])

  async function signInWithGoogle() {
    try {
      setError(null)
      await userRepo.signInWithGoogle()
    } catch (e) {
      setError(getErrorMessage(e))
    }
  }

  async function signInWithEmail(email: string, password: string) {
    try {
      setError(null)
      await userRepo.signInWithEmailPassword(email, password)
    } catch (e) {
      setError(getErrorMessage(e))
    }
  }

  async function register(email: string, password: string, username: string) {
    try {
      setError(null)
      await userRepo.registerWithEmailPassword(email, password, username)
    } catch (e) {
      setError(getErrorMessage(e))
    }
  }

  async function signOut() {
    await userRepo.signOut()
  }

  return { user, error, signInWithGoogle, signInWithEmail, register, signOut }
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    const code = (e as { code?: string }).code ?? ''
    if (code === 'auth/email-already-in-use') return 'This email is already in use.'
    if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') return 'Incorrect email or password.'
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.'
    if (code === 'auth/invalid-email') return 'Invalid email address.'
    if (code === 'auth/popup-closed-by-user') return ''
    return e.message
  }
  return 'Something went wrong.'
}
