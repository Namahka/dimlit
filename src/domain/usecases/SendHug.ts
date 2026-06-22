import type { IHugRepository } from '../repositories/IHugRepository'
import type { Hug } from '../entities/Hug'

export class SendHug {
  constructor(private readonly hugRepo: IHugRepository) {}

  async execute(hug: Omit<Hug, 'id'>): Promise<void> {
    await this.hugRepo.sendHug(hug)
  }
}
