import { makeCheckInUseCase } from '@/use-cases/factories/make-checkin-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckInBodySchema = z.object({
    latitude: z.number().refine((value) => {
      return Math.abs(value) <= 90
    }),
    longitude: z.number().refine((value) => {
      return Math.abs(value) <= 180
    }),
  })

  const createCheckInParamsSchema = z.object({
    gymId: z.string().uuid(),
  })

  const { gymId } = createCheckInParamsSchema.parse(request.params)

  const { latitude, longitude } = createCheckInBodySchema.parse(request.body)

  const createGymUseCase = makeCheckInUseCase()

  await createGymUseCase.execute({
    userId: request.user.sub,
    gymId,
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(201).send()
}
