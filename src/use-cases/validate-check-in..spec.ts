import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { randomUUID } from 'node:crypto'
import { ValidateCheckInUseCase } from './validate-check-in'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { LateCheckInValidationError } from './errors/late-check-in-validation-error'

describe('CheckIn Use Case', () => {
  let checkInsRepository: InMemoryCheckInsRepository
  let validateCheckInUseCase: ValidateCheckInUseCase

  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    validateCheckInUseCase = new ValidateCheckInUseCase(checkInsRepository)

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to validate the check-in', async () => {
    const checkIn = await checkInsRepository.create({
      gym_id: randomUUID().toString(),
      user_id: randomUUID().toString(),
    })

    const { checkIn: checkInValidated } = await validateCheckInUseCase.execute({
      checkInId: checkIn.id,
    })

    const checkInValidatedInRepository = await checkInsRepository.findById(
      checkIn.id,
    )

    expect(checkInValidated?.validated_at).toEqual(expect.any(Date))
    expect(checkInValidatedInRepository?.validated_at).toEqual(expect.any(Date))
  })

  it('should not be able to validate non existent check-in', async () => {
    await expect(
      validateCheckInUseCase.execute({
        checkInId: randomUUID().toString(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to validate the check-in after 20 minutes of its creation', async () => {
    vi.setSystemTime(new Date(2025, 0, 1, 13, 40))

    const checkIn = await checkInsRepository.create({
      gym_id: randomUUID().toString(),
      user_id: randomUUID().toString(),
    })

    const twentyOneMinutesInMs = 1000 * 60 * 21

    vi.advanceTimersByTime(twentyOneMinutesInMs)

    await expect(
      validateCheckInUseCase.execute({
        checkInId: checkIn.id,
      }),
    ).rejects.toBeInstanceOf(LateCheckInValidationError)
  })
})
