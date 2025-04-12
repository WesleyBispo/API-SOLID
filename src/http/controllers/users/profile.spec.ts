import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import createAndAuthenticateUser from '@/utils/test/create-and-authenticate-user'

describe('Profile (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get user profile', async () => {
    const { token, user } = await createAndAuthenticateUser(app)

    const profileResponse = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(profileResponse.statusCode).toEqual(200)

    expect(profileResponse.body).toMatchObject({
      user: {
        id: expect.any(String),
        name: user.name,
        email: user.email,
        created_at: expect.any(String),
      },
    })
  })
})
