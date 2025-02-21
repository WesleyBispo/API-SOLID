import { Gym, Prisma } from '@prisma/client'
import { FindManyNearbyParams, GymsRepository } from '../gyms-repository'
import { randomUUID } from 'node:crypto'
import { getDistanceBetweenCoordinates } from '@/utils/get-distance-between-coordinates'

export class InMemoryGymsRepository implements GymsRepository {
  gyms: Gym[] = []

  async create(data: Prisma.GymCreateInput): Promise<Gym> {
    const gym: Gym = {
      id: randomUUID().toString(),
      title: data.title,
      description: data.description || null,
      phone: data.phone || null,
      latitude: new Prisma.Decimal(Number(data?.latitude)),
      longitude: new Prisma.Decimal(Number(data?.longitude)),
    }

    this.gyms.push(gym)

    return gym
  }

  async findById(id: string): Promise<Gym | null> {
    return this.gyms.find((g) => g.id === id) || null
  }

  async findManyNearby(
    params: FindManyNearbyParams,
    page: number,
  ): Promise<Gym[]> {
    const skip = (page - 1) * 20
    const take = skip + 20
    return this.gyms
      .filter((gym) => {
        const distance = getDistanceBetweenCoordinates(
          {
            latitude: params.latitude,
            longitude: params.longitude,
          },
          {
            latitude: gym.latitude.toNumber(),
            longitude: gym.longitude.toNumber(),
          },
        )

        return distance <= 10
      })
      .slice(skip, take)
  }

  async searchMany(query: string, page: number): Promise<Gym[]> {
    const skip = (page - 1) * 20
    const take = skip + 20
    return this.gyms.filter((g) => g.title.includes(query)).slice(skip, take)
  }
}
