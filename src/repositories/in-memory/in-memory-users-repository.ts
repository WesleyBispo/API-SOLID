import { Prisma, User } from '@prisma/client'
import { UsersRepository } from '../users-repository'
import { randomUUID } from 'node:crypto'

export class InMemoryUsersRepository implements UsersRepository {
  private items: User[] = []
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user: User = {
      ...data,
      id: randomUUID(),
      created_at: new Date(),
    }

    this.items.push(user)
    return user
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find((item) => item.id === id) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((item) => item.email === email) || null
  }
}
