import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('Refresh Token (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to refresh token', async () => {
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

    const cookies = authResponse.get('Set-Cookie')!

    expect(cookies).toBeDefined()

    const responseRefresh = await request(app.server)
      .patch('/token/refresh')
      .set('Cookie', cookies)

    expect(responseRefresh.statusCode).toEqual(200)

    expect(responseRefresh.statusCode).toEqual(200)
    expect(responseRefresh.body).toEqual({
      token: expect.any(String),
    })

    expect(responseRefresh.get('Set-Cookie')).toEqual([
      expect.stringContaining('refreshToken='),
    ])
  })
})
