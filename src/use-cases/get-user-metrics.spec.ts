import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { GetUserMetricsUseCase } from './get-user-metrics'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { randomUUID } from 'node:crypto'

describe('Get User Metrics Use Case', () => {
  let checkInsRepository: CheckInsRepository
  let getUserMetricsUseCase: GetUserMetricsUseCase

  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository()
    getUserMetricsUseCase = new GetUserMetricsUseCase(checkInsRepository)
  })

  it('should be able to get user metrics check-ins count', async () => {
    const userId = randomUUID().toString()

    await checkInsRepository.create({
      user_id: userId,
      gym_id: 'gym-1',
    })

    const { checkInsCount } = await getUserMetricsUseCase.execute({
      userId,
    })

    expect(checkInsCount).toBe(1)
  })
})
