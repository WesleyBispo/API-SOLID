import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import createAndAuthenticateUser from '@/utils/test/create-and-authenticate-user'

describe('Search Gyms (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get a gym for by search', async () => {
    const gymCreatePayload1 = {
      title: 'JavaScript Gym',
      description: 'A gym for JavaScript enthusiasts',
      phone: '123456789',
      latitude: -23.5505,
      longitude: -46.6333,
    }
    const { token } = await createAndAuthenticateUser(app, 'ADMIN')

    const response1 = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(gymCreatePayload1)

    expect(response1.statusCode).toEqual(201)

    const gymCreatePayload2 = {
      title: 'TypeScript Gym',
      description: 'A gym for TypeScript enthusiasts',
      phone: '123456789',
      latitude: -23.5505,
      longitude: -46.6333,
    }

    const response2 = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(gymCreatePayload2)

    expect(response2.statusCode).toEqual(201)

    const responseSearch = await request(app.server)
      .get('/gyms/search')
      .set('Authorization', `Bearer ${token}`)
      .query({
        q: 'JavaScript',
      })
      .send()

    expect(responseSearch.statusCode).toEqual(200)
    expect(responseSearch.body.gyms).toHaveLength(1)
    expect(responseSearch.body.gyms).toEqual([
      expect.objectContaining({
        title: 'JavaScript Gym',
        description: 'A gym for JavaScript enthusiasts',
      }),
    ])
  })
})
