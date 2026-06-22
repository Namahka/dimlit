import type { User } from '../entities/User'

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>
  onAuthStateChanged(callback: (user: User | null) => void): () => void
  signInWithGoogle(): Promise<User>
  signInWithEmailPassword(email: string, password: string): Promise<User>
  registerWithEmailPassword(email: string, password: string, username: string): Promise<User>
  signOut(): Promise<void>
  updateUsername(userId: string, username: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>
  deleteAccount(userId: string): Promise<void>
  sendVerificationEmail(): Promise<void>
  reloadUser(): Promise<boolean>
}
