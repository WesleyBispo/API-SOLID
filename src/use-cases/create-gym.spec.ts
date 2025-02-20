import { beforeEach, describe, expect, it } from 'vitest'
import { CreateGymUseCase } from './create-gym'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Prisma } from '@prisma/client'

describe('Create Gym Use Case', () => {
  let gymRepository: InMemoryGymsRepository
  let createGymUseCase: CreateGymUseCase

  beforeEach(() => {
    gymRepository = new InMemoryGymsRepository()
    createGymUseCase = new CreateGymUseCase(gymRepository)
  })

  it('should be able to create a gym', async () => {
    const gymCreateInput = {
      title: 'Test Gym Title',
      description: 'Test Gym Description',
      phone: '18996609239',
      latitude: -22.0981407,
      longitude: -51.4623337,
    }

    const { gym } = await createGymUseCase.execute(gymCreateInput)

    expect(gym).toMatchObject({
      id: expect.any(String),
      title: 'Test Gym Title',
      description: 'Test Gym Description',
      phone: '18996609239',
      latitude: new Prisma.Decimal(-22.0981407),
      longitude: new Prisma.Decimal(-51.4623337),
    })
  })
})
