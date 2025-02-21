import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'

describe('Fetch Nearby Gyms Use case', () => {
  let gymsRepository: InMemoryGymsRepository
  let fetchNearbyGymsUseCase: FetchNearbyGymsUseCase

  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    fetchNearbyGymsUseCase = new FetchNearbyGymsUseCase(gymsRepository)

    const gymCreateInput = {
      title: 'Nearby Gym Title',
      description: 'Test Gym Description',
      phone: '18996609239',
      latitude: -22.0981407,
      longitude: -51.4623337,
    }

    const distanceGymInput = {
      title: 'Distance Gym Title',
      description: 'Near Gym Description',
      phone: '18996609239',
      latitude: -22.0981407 + 10,
      longitude: -51.4623337 + 10,
    }

    gymsRepository.create(gymCreateInput)

    gymsRepository.create(distanceGymInput)
  })

  it('should able to retrieve gyms nearby user', async () => {
    const response = await fetchNearbyGymsUseCase.execute({
      userLatitude: -22.0981407,
      userLongitude: -51.4623337,
      page: 1,
    })

    expect(response.gyms).toHaveLength(1)
    expect(response.gyms[0].title).toBe('Nearby Gym Title')
  })

  it('should return an empty array when no gyms nearby user', async () => {
    const response = await fetchNearbyGymsUseCase.execute({
      userLatitude: -23.0981407,
      userLongitude: -52.4623337,
      page: 1,
    })

    expect(response.gyms).toHaveLength(0)
  })

  it('should be able to paginate the nearby results', async () => {
    const response1 = await fetchNearbyGymsUseCase.execute({
      userLatitude: -22.0981407,
      userLongitude: -51.4623337,
      page: 1,
    })

    expect(response1.gyms).toHaveLength(1)
    expect(response1.gyms[0].title).toBe('Nearby Gym Title')

    const response2 = await fetchNearbyGymsUseCase.execute({
      userLatitude: -22.0981407,
      userLongitude: -51.4623337,
      page: 2,
    })

    expect(response2.gyms).toHaveLength(0)
  })

  it('should be able to retrieve distance gym, if user is near', async () => {
    const response = await fetchNearbyGymsUseCase.execute({
      userLatitude: -22.0981407 + 10,
      userLongitude: -51.4623337 + 10,
      page: 1,
    })

    expect(response.gyms).toHaveLength(1)
    expect(response.gyms[0].title).toBe('Distance Gym Title')
  })
})
