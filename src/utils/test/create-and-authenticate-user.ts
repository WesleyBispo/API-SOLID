import { FastifyInstance } from 'fastify'
import request from 'supertest'
import { expect } from 'vitest'

export default async function createAndAuthenticateUser(app: FastifyInstance) {
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

  return {
    token,
    user: {
      ...createUserPaylod,
    },
  }
}
