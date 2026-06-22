import type { Hug } from '../entities/Hug'

export interface IHugRepository {
  sendHug(hug: Omit<Hug, 'id'>): Promise<void>
  listenToHugsReceived(userId: string, callback: (hugs: Hug[]) => void): () => void
}
