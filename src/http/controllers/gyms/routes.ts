import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { create } from './create'
import { search } from './search'
import { nearby } from './nearby'
import { verifyUserRole } from '@/http/middlewares/verify-user-role'
import { Role } from '@prisma/client'

export async function gymsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post(
    '/gyms',
    {
      onRequest: [verifyUserRole(Role.ADMIN)],
    },
    create,
  )

  app.get('/gyms/search', search)
  app.get('/gyms/nearby', nearby)
}
