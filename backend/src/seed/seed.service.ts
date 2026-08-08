import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot } from '../spots/spot.entity';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Spot)
    private readonly spotRepository: Repository<Spot>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedData();
  }

  async seedData() {
    const count = await this.spotRepository.count();
    if (count > 0) {
      this.logger.log(`Skipping seed. DB already contains ${count} spots.`);
      return;
    }

    const csvPath = path.join(process.cwd(), 'landit_coding_test_seed.csv');
    if (!fs.existsSync(csvPath)) {
      this.logger.warn(`Seed CSV not found at: ${csvPath}`);
      return;
    }

    const spotsToInsert: Partial<Spot>[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (row: any) => {
          const cleanedRow: { [key: string]: string } = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.replace(/^\uFEFF/, '').trim().toLowerCase();
            cleanedRow[cleanKey] = row[key] ? row[key].trim() : '';
          });

          const name = cleanedRow['name'] || '名称不明';
          const address = cleanedRow['address'] || '';
          
          // 緯度 (lat) と 経度 (long) の抽出
          const latVal = cleanedRow['lat'] || cleanedRow['latitude'] || cleanedRow['緯度'];
          const lngVal = cleanedRow['long'] || cleanedRow['lng'] || cleanedRow['longitude'] || cleanedRow['経度'];

          const lat = parseFloat(latVal);
          const lng = parseFloat(lngVal);

          if (!isNaN(lat) && !isNaN(lng)) {
            spotsToInsert.push({
              name,
              address,
              latitude: lat,
              longitude: lng,
              location: {
                type: 'Point',
                coordinates: [lng, lat], // [経度, 緯度]
              },
            });
          }
        })
        .on('end', () => resolve(undefined))
        .on('error', (error) => reject(error));
    });

    if (spotsToInsert.length > 0) {
      await this.spotRepository.save(spotsToInsert);
      this.logger.log(`Successfully seeded ${spotsToInsert.length} spots into Database!`);
    } else {
      this.logger.warn('CSV was read, but 0 valid spots were parsed.');
    }
  }
}