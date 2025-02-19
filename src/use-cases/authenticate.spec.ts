import { beforeEach, describe, expect, it } from 'vitest'
import { AuthenticateUseCase } from './authenticate'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials-error'
import { Prisma, User } from '@prisma/client'
import { hash } from 'bcryptjs'

describe('Authenticate Use Case', () => {
  let usersRepository: InMemoryUsersRepository
  let authenticateUseCase: AuthenticateUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    authenticateUseCase = new AuthenticateUseCase(usersRepository)
  })

  it('should be able to authenticate', async () => {
    const userRequest: Prisma.UserCreateInput = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: await hash('123456', 6),
    }

    await usersRepository.create(userRequest)

    const { user } = await authenticateUseCase.execute({
      email: 'john.doe@example.com',
      password: '123456',
    })

    expect(user).toMatchObject({
      id: expect.any(String),
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: expect.any(String),
      created_at: expect.any(Date),
    })
  }),
    it('should not be able to authenticate password not matches', async () => {
      const userRequest: Prisma.UserCreateInput = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password_hash: await hash('123456', 6),
      }

      await usersRepository.create(userRequest)

      await expect(() =>
        authenticateUseCase.execute({
          email: 'john.doe@example.com',
          password: '1234567',
        }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError)
    })

  it('should not be able to authenticate without user register', async () => {
    await expect(() =>
      authenticateUseCase.execute({
        email: 'john.doe@example.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
