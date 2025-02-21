import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { SearchGymsUseCase } from './search-gyms'

describe('Search Gyms Use case', () => {
  let gymsRepository: InMemoryGymsRepository
  let searchGymsUseCase: SearchGymsUseCase

  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    searchGymsUseCase = new SearchGymsUseCase(gymsRepository)

    const gymCreateInput = {
      title: 'Test Gym Title',
      description: 'Test Gym Description',
      phone: '18996609239',
      latitude: -22.0981407,
      longitude: -51.4623337,
    }

    gymsRepository.create(gymCreateInput)
  })

  it('should able to retrieve gyms by search with Test title', async () => {
    const response = await searchGymsUseCase.execute({
      query: 'Test',
      page: 1,
    })

    expect(response.gyms).toHaveLength(1)
    expect(response.gyms[0].title).toBe('Test Gym Title')
  })

  it('should return an empty array when no gyms match the search query', async () => {
    const response = await searchGymsUseCase.execute({
      query: 'Nonexistent',
      page: 1,
    })

    expect(response.gyms).toHaveLength(0)
  })

  it('should be able to paginate the search results', async () => {
    const response1 = await searchGymsUseCase.execute({
      query: 'Test',
      page: 1,
    })

    expect(response1.gyms).toHaveLength(1)
    expect(response1.gyms[0].title).toBe('Test Gym Title')

    const response2 = await searchGymsUseCase.execute({
      query: 'Test',
      page: 2,
    })

    expect(response2.gyms).toHaveLength(0)
  })
})
