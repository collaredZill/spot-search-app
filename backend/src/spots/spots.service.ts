import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot } from './spot.entity';

@Injectable()
export class SpotsService {
  constructor(
    @InjectRepository(Spot)
    private readonly spotRepository: Repository<Spot>,
  ) {}

  async findNearby(lat: number, lng: number, radiusKm: number): Promise<Spot[]> {
    const radiusMeters = radiusKm * 1000;

    return this.spotRepository
      .createQueryBuilder('spot')
      .where(
        `ST_DWithin(
          spot.location::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radiusMeters
        )`,
        { lng, lat, radiusMeters },
      )
      .getMany();
  }
}