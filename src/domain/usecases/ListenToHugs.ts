import type { IHugRepository } from '../repositories/IHugRepository'
import type { Hug } from '../entities/Hug'

export class ListenToHugs {
  constructor(private readonly hugRepo: IHugRepository) {}

  execute(userId: string, callback: (hugs: Hug[]) => void): () => void {
    return this.hugRepo.listenToHugsReceived(userId, callback)
  }
}
