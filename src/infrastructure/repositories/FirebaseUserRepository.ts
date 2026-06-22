import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/firebaseApp'
import type { IUserRepository } from '../../domain/repositories/IUserRepository'
import type { User } from '../../domain/entities/User'

const googleProvider = new GoogleAuthProvider()

async function getOrCreateUserDoc(uid: string, fallbackUsername: string, email?: string): Promise<User> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    const data = snap.data()
    return {
      id: uid,
      username: data.username as string,
      email: data.email as string | undefined,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    }
  }

  const username = fallbackUsername.trim() || 'Anonymous'
  await setDoc(ref, {
    username,
    email: email ?? null,
    createdAt: serverTimestamp(),
  })

  return { id: uid, username, email, createdAt: new Date() }
}

export class FirebaseUserRepository implements IUserRepository {
  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsub = firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
        unsub()
        if (!firebaseUser) { resolve(null); return }
        const user = await getOrCreateUserDoc(
          firebaseUser.uid,
          firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Anonymous',
          firebaseUser.email ?? undefined
        )
        resolve(user)
      })
    })
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { callback(null); return }
      const user = await getOrCreateUserDoc(
        firebaseUser.uid,
        firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Anonymous',
        firebaseUser.email ?? undefined
      )
      callback(user)
    })
  }

  async signInWithGoogle(): Promise<User> {
    const { user: firebaseUser } = await signInWithPopup(auth, googleProvider)
    return getOrCreateUserDoc(
      firebaseUser.uid,
      firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Anonymous',
      firebaseUser.email ?? undefined
    )
  }

  async signInWithEmailPassword(email: string, password: string): Promise<User> {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
    return getOrCreateUserDoc(
      firebaseUser.uid,
      firebaseUser.email?.split('@')[0] ?? 'Anonymous',
      firebaseUser.email ?? undefined
    )
  }

  async registerWithEmailPassword(email: string, password: string, username: string): Promise<User> {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
    return getOrCreateUserDoc(firebaseUser.uid, username, email)
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  }
}
