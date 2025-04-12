import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import request from 'supertest'
import { expect } from 'vitest'

export default async function createAndAuthenticateUser(
  app: FastifyInstance,
  role: Role = 'MEMBER',
) {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('12345678', 6),
      role,
    },
  })
  const authResponse = await request(app.server).post('/sessions').send({
    email: user.email,
    password: '12345678',
  })

  expect(authResponse.statusCode).toEqual(200)
  expect(authResponse.body).toEqual({
    token: expect.any(String),
  })

  const { token } = authResponse.body

  return {
    token,
    user,
  }
}
