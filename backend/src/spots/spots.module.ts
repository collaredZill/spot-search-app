import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spot } from './spot.entity';
import { SpotsService } from './spots.service';
import { SpotsController } from './spots.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Spot])],
  providers: [SpotsService],
  controllers: [SpotsController],
  exports: [SpotsService],
})
export class SpotsModule {}