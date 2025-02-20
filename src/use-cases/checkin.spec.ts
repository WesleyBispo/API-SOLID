import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CheckInUseCase } from './checkin'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { randomUUID } from 'node:crypto'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'
import { Gym } from '@prisma/client'
import { MaxDistanceError } from './errors/max-distance-error'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'

describe('CheckIn Use Case', () => {
  let checkInsRepository: InMemoryCheckInsRepository
  let gymsRepository: InMemoryGymsRepository
  let checkInUseCase: CheckInUseCase

  let gym: Gym

  const userLatitude: number = -22.1364448
  const userLongitude: number = -51.4532734

  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    checkInUseCase = new CheckInUseCase(checkInsRepository, gymsRepository)

    vi.useFakeTimers()

    gym = await gymsRepository.create({
      title: 'Gym Test',
      description: 'Gym para testes',
      phone: '18996609239',
      latitude: userLatitude,
      longitude: userLongitude,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    vi.setSystemTime(new Date(2005, 2, 17, 8, 0, 0))
    expect(gym.id).toEqual(expect.any(String))

    const { checkIn } = await checkInUseCase.execute({
      userId: randomUUID(),
      gymId: gym.id,
      userLatitude,
      userLongitude,
    })

    expect(checkIn.id).toBeTruthy()
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2005, 2, 17, 8, 0, 0))
    expect(gym.id).toEqual(expect.any(String))

    const userId = randomUUID()
    const gymId = gym.id

    await checkInUseCase.execute({ userId, gymId, userLatitude, userLongitude })
    await expect(
      checkInUseCase.execute({ userId, gymId, userLatitude, userLongitude }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should be able to check in twice but in different days', async () => {
    vi.setSystemTime(new Date(2005, 2, 17, 8, 0, 0))
    expect(gym.id).toEqual(expect.any(String))

    const userId = randomUUID()
    const gymId = gym.id

    await checkInUseCase.execute({ userId, gymId, userLatitude, userLongitude })

    vi.setSystemTime(new Date(2005, 2, 18, 8, 0, 0))

    const { checkIn } = await checkInUseCase.execute({
      userId,
      gymId,
      userLatitude,
      userLongitude,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in on distant gym', async () => {
    vi.setSystemTime(new Date(2005, 2, 17, 8, 0, 0))

    const gymDistant = await gymsRepository.create({
      title: 'Gym Test',
      description: 'Gym para testes',
      phone: '18996609239',
      latitude: -22.0981407,
      longitude: -51.4623337,
    })

    expect(gymDistant.id).toEqual(expect.any(String))

    await expect(() =>
      checkInUseCase.execute({
        userId: randomUUID(),
        gymId: gymDistant.id,
        userLatitude,
        userLongitude,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
