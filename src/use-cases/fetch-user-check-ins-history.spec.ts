import { beforeEach, describe, expect, it } from 'vitest'
import { FetchUserCheckInsHistoryUseCase } from './fetch-user-check-ins-history'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { randomUUID } from 'node:crypto'

describe('Fetch User Check-Ins Use Case', () => {
  let checkInsRepository: InMemoryCheckInsRepository
  let fetchUserCheckInsHistory: FetchUserCheckInsHistoryUseCase

  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    fetchUserCheckInsHistory = new FetchUserCheckInsHistoryUseCase(
      checkInsRepository,
    )
  })

  it('should fetch user check-ins', async () => {
    const userId = randomUUID().toString()

    await checkInsRepository.create({
      user_id: userId,
      gym_id: `gym-1`,
    })

    await checkInsRepository.create({
      user_id: userId,
      gym_id: `gym-2`,
    })

    const { checkIns } = await fetchUserCheckInsHistory.execute({
      userId,
      page: 1,
    })

    expect(checkIns).toHaveLength(2)
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: 'gym-1' }),
      expect.objectContaining({ gym_id: 'gym-2' }),
    ])
  })

  it('should be able to fetch paginated user check-ins history', async () => {
    const userId = randomUUID().toString()

    for (let i = 1; i <= 22; i++) {
      await checkInsRepository.create({
        user_id: userId,
        gym_id: `gym-${i}`,
      })
    }

    const { checkIns } = await fetchUserCheckInsHistory.execute({
      userId,
      page: 2,
    })

    expect(checkIns).toHaveLength(2)
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: 'gym-21' }),
      expect.objectContaining({ gym_id: 'gym-22' }),
    ])
  })
})
