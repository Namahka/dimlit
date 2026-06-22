import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  deleteUser,
  sendEmailVerification,
  reload,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseApp'
import type { IUserRepository } from '../../domain/repositories/IUserRepository'
import type { User } from '../../domain/entities/User'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

async function getOrCreateUserDoc(uid: string, fallbackUsername: string, email?: string, emailVerified = true): Promise<User> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    const data = snap.data()
    return { id: uid, username: data.username as string, email: data.email as string | undefined, emailVerified, createdAt: data.createdAt?.toDate() ?? new Date() }
  }

  const username = fallbackUsername.trim() || 'Anonymous'
  await setDoc(ref, { username, email: email ?? null, createdAt: serverTimestamp() })
  return { id: uid, username, email, emailVerified, createdAt: new Date() }
}

export class FirebaseUserRepository implements IUserRepository {
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsub = firebaseOnAuthStateChanged(auth, async (fu) => {
        unsub()
        if (!fu) { resolve(null); return }
        resolve(await getOrCreateUserDoc(fu.uid, fu.displayName ?? fu.email?.split('@')[0] ?? 'Anonymous', fu.email ?? undefined, fu.emailVerified))
      })
    })
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, async (fu) => {
      if (!fu) { callback(null); return }
      callback(await getOrCreateUserDoc(fu.uid, fu.displayName ?? fu.email?.split('@')[0] ?? 'Anonymous', fu.email ?? undefined, fu.emailVerified))
    })
  }

  async signInWithGoogle(): Promise<User> {
    const { user: fu } = await signInWithPopup(auth, googleProvider)
    return getOrCreateUserDoc(fu.uid, fu.displayName ?? fu.email?.split('@')[0] ?? 'Anonymous', fu.email ?? undefined, fu.emailVerified)
  }

  async signInWithEmailPassword(email: string, password: string): Promise<User> {
    const { user: fu } = await signInWithEmailAndPassword(auth, email, password)
    return getOrCreateUserDoc(fu.uid, fu.email?.split('@')[0] ?? 'Anonymous', fu.email ?? undefined, fu.emailVerified)
  }

  async registerWithEmailPassword(email: string, password: string, username: string): Promise<User> {
    const { user: fu } = await createUserWithEmailAndPassword(auth, email, password)
    await sendEmailVerification(fu)
    return getOrCreateUserDoc(fu.uid, username, email, false)
  }

  async signOut(): Promise<void> { await firebaseSignOut(auth) }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await firebaseSendPasswordResetEmail(auth, email)
  }

  async updateUsername(userId: string, username: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { username })
    // Also update presence so the map shows the new username
    try {
      await updateDoc(doc(db, 'presences', userId), { username })
    } catch { /* presence might not exist yet */ }
  }

  async updatePassword(newPassword: string): Promise<void> {
    if (!auth.currentUser) throw new Error('Not authenticated')
    await firebaseUpdatePassword(auth.currentUser, newPassword)
  }

  async deleteAccount(userId: string): Promise<void> {
    if (!auth.currentUser) throw new Error('Not authenticated')
    await deleteDoc(doc(db, 'users', userId))
    await deleteDoc(doc(db, 'presences', userId))
    await deleteUser(auth.currentUser)
  }

  async sendVerificationEmail(): Promise<void> {
    if (!auth.currentUser) throw new Error('Not authenticated')
    await sendEmailVerification(auth.currentUser)
  }

  async reloadUser(): Promise<boolean> {
    if (!auth.currentUser) return false
    await reload(auth.currentUser)
    return auth.currentUser.emailVerified
  }
}
