import { CheckIn, Prisma } from '@prisma/client'
import { CheckInsRepository } from '../check-ins-repository'
import { randomUUID } from 'node:crypto'
import dayjs from 'dayjs'

export class InMemoryCheckInsRepository implements CheckInsRepository {
  private checkIns: CheckIn[] = []

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn: CheckIn = {
      id: randomUUID().toString(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      validated_at: data?.validated_at ? new Date(data?.validated_at) : null,
      created_at: new Date(),
    }

    this.checkIns.push(checkIn)

    return checkIn
  }

  async save(checkIn: CheckIn): Promise<CheckIn> {
    const checkInIndex = this.checkIns.findIndex(
      (item) => item.id === checkIn.id,
    )

    if (checkInIndex !== -1) {
      this.checkIns[checkInIndex] = checkIn
    }

    return checkIn
  }

  async countByUserId(userId: string): Promise<number> {
    return this.checkIns.filter((checkIn) => checkIn.user_id === userId).length
  }

  async findById(id: string): Promise<CheckIn | null> {
    return this.checkIns.find((item) => item.id === id) || null
  }

  async findManyByUserId(userId: string, page: number): Promise<CheckIn[]> {
    const skip = (page - 1) * 20
    const take = skip + 20
    return this.checkIns
      .filter((checkIn) => checkIn.user_id === userId)
      .slice(skip, take)
  }

  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const startOfTheDay = dayjs(date).startOf('date')
    const endOfTheDay = dayjs(date).endOf('date')

    return (
      this.checkIns.find((checkIn) => {
        const checkInDate = dayjs(checkIn.created_at)
        const isOnSameDate =
          checkInDate.isAfter(startOfTheDay) &&
          checkInDate.isBefore(endOfTheDay)

        return checkIn.user_id === userId && isOnSameDate
      }) || null
    )
  }
}
