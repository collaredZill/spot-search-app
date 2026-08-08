import { Controller, Get, Query, ParseFloatPipe } from '@nestjs/common';
import { SpotsService } from './spots.service';
import { Spot } from './spot.entity';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get('search')
  async search(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius', ParseFloatPipe) radius: number,
  ): Promise<Spot[]> {
    return this.spotsService.findNearby(lat, lng, radius);
  }
}