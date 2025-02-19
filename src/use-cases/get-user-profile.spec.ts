import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { beforeEach, describe, expect, it } from 'vitest'
import { GetUserProfileUseCase } from './get-user-profile'
import { Prisma } from '@prisma/client'
import { hash } from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

describe('Get User Profile Use Case', () => {
  let usersRepository: InMemoryUsersRepository
  let getUserProfileUseCase: GetUserProfileUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    getUserProfileUseCase = new GetUserProfileUseCase(usersRepository)
  })

  it('should be able to get user profile', async () => {
    const userRequest: Prisma.UserCreateInput = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: await hash('123456', 6),
    }

    const user = await usersRepository.create(userRequest)
    const { user: retrievedUser } = await getUserProfileUseCase.execute({
      userId: user.id,
    })

    expect(retrievedUser.id).toBe(user.id)
    expect(retrievedUser.name).toBe(user.name)
    expect(retrievedUser.email).toBe(user.email)
  })

  it('should not be able to get user profile', async () => {
    await expect(
      getUserProfileUseCase.execute({
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
