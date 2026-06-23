import { SendHug } from '../../domain/usecases/SendHug'
import { ListenToHugs } from '../../domain/usecases/ListenToHugs'
import type { IHugRepository } from '../../domain/repositories/IHugRepository'
import type { Hug } from '../../domain/entities/Hug'

export class HugService {
  private readonly sendHug: SendHug
  private readonly listenToHugs: ListenToHugs

  constructor(hugRepo: IHugRepository) {
    this.sendHug = new SendHug(hugRepo)
    this.listenToHugs = new ListenToHugs(hugRepo)
  }

  async send(fromUserId: string, toUserId: string, fromCountry: string, fromUsername = ''): Promise<void> {
    await this.sendHug.execute({
      fromUserId,
      toUserId,
      fromUsername,
      fromCountry,
      sentAt: new Date(),
    })
  }

  listen(userId: string, callback: (hugs: Hug[]) => void): () => void {
    return this.listenToHugs.execute(userId, callback)
  }
}
