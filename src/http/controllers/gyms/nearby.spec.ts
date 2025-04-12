import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import createAndAuthenticateUser from '@/utils/test/create-and-authenticate-user'

describe('Nearby Gyms (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list nearby gyms', async () => {
    const { token } = await createAndAuthenticateUser(app, 'ADMIN')

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

    const response1 = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(gymCreateInput)

    expect(response1.statusCode).toEqual(201)

    const responseDistanceGym = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(distanceGymInput)

    expect(responseDistanceGym.statusCode).toEqual(201)

    const responseSearch = await request(app.server)
      .get('/gyms/nearby')
      .set('Authorization', `Bearer ${token}`)
      .query({
        latitude: -22.0981407,
        longitude: -51.4623337,
      })
      .send()

    expect(responseSearch.statusCode).toEqual(200)
    expect(responseSearch.body.gyms).toHaveLength(1)
    expect(responseSearch.body.gyms).toEqual([
      expect.objectContaining({
        title: 'Nearby Gym Title',
        description: 'Test Gym Description',
      }),
    ])
  })
})
