import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Profile (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get user profile', async () => {
    const createUserPaylod = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    }
    const response = await request(app.server)
      .post('/users')
      .send(createUserPaylod)

    expect(response.statusCode).toEqual(201)

    const authResponse = await request(app.server).post('/sessions').send({
      email: createUserPaylod.email,
      password: createUserPaylod.password,
    })

    expect(authResponse.statusCode).toEqual(200)
    expect(authResponse.body).toEqual({
      token: expect.any(String),
    })

    const { token } = authResponse.body

    const profileResponse = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(profileResponse.statusCode).toEqual(200)

    expect(profileResponse.body).toMatchObject({
      user: {
        id: expect.any(String),
        name: createUserPaylod.name,
        email: createUserPaylod.email,
        created_at: expect.any(String),
      },
    })
  })
})
