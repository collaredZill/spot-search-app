import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Spot } from './spots/spot.entity';
import { SeedService } from './seed/seed.service';
import { SpotsModule } from './spots/spots.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'db',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgrespassword',
      database: process.env.DATABASE_NAME || 'landit_db',
      entities: [Spot],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Spot]),
    SpotsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}