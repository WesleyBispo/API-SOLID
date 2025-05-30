import { makeFetchUserCheckInsHistoryUseCase } from '@/use-cases/factories/make-fetch-user-check-ins-history-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function history(request: FastifyRequest, reply: FastifyReply) {
  const historyGymsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
  })

  const { page } = historyGymsQuerySchema.parse(request.query)

  const fetchNearbyGymsUseCase = makeFetchUserCheckInsHistoryUseCase()

  const { checkIns } = await fetchNearbyGymsUseCase.execute({
    userId: request.user.sub,
    page,
  })

  return reply.status(200).send({
    checkIns,
  })
}
