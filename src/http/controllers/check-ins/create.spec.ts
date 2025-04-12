import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import createAndAuthenticateUser from '@/utils/test/create-and-authenticate-user'

describe('Create Check-Ins (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able create a check-in', async () => {
    const gymCreatePayload = {
      title: 'JavaScript Gym',
      description: 'A gym for JavaScript enthusiasts',
      phone: '123456789',
      latitude: -23.5505,
      longitude: -46.6333,
    }
    const { token } = await createAndAuthenticateUser(app, 'ADMIN')

    const response = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(gymCreatePayload)

    expect(response.statusCode).toEqual(201)

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

    const gymId = responseSearch.body.gyms[0].id

    const checkInResponse = await request(app.server)
      .post(`/gyms/${gymId}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: -23.5505,
        longitude: -46.6333,
      })

    expect(checkInResponse.statusCode).toEqual(201)
  })
})
