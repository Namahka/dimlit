import type { Presence } from '../entities/Presence'

export interface IPresenceRepository {
  setActive(presence: Presence): Promise<void>
  setInactive(userId: string): Promise<void>
  getActivePresences(): Promise<Presence[]>
  listenToActivePresences(callback: (presences: Presence[]) => void): () => void
}
