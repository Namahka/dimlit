import type { IPresenceRepository } from '../repositories/IPresenceRepository'

export class SetPresenceInactive {
  constructor(private readonly presenceRepo: IPresenceRepository) {}

  async execute(userId: string): Promise<void> {
    await this.presenceRepo.setInactive(userId)
  }
}
