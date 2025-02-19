import { beforeEach, describe, expect, it } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

describe('Register Use Case', () => {
  let usersRepository: InMemoryUsersRepository
  let registerUseCase: RegisterUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    registerUseCase = new RegisterUseCase(usersRepository)
  })

  it('should be able to register', async () => {
    const { user } = await registerUseCase.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    })

    expect(user).toMatchObject({
      id: expect.any(String),
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: expect.any(String),
      created_at: expect.any(Date),
    })
  })

  it('should hash user password upon registration', async () => {
    const password = 'password123'

    const { user } = await registerUseCase.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password,
    })

    const isPasswordCorrectlyHashed = await compare(
      password,
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to register with same email twice', async () => {
    const email = 'john.doe@example.com'

    const { user } = await registerUseCase.execute({
      name: 'John Doe',
      email,
      password: 'password123',
    })

    expect(user.email).toEqual(email)

    await expect(() =>
      registerUseCase.execute({
        name: 'John Doe',
        email,
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
