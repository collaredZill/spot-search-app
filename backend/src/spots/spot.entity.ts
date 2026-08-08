import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('spots')
export class Spot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  // 緯度 (Latitude) - CSVからの入力用およびAPIレスポンス用
  @Column({ type: 'double precision' })
  latitude: number;

  // 経度 (Longitude) - CSVからの入力用およびAPIレスポンス用
  @Column({ type: 'double precision' })
  longitude: number;

  /**
   * PostGIS 空間データ列
   * Point(経度, 緯度) の順番でデータを保持します。
   * SRID: 4326 (WGS 84 地理座標系)
   */
  @Index({ spatial: true }) // 空間検索（ST_DWithin等）を高速化するGiSTインデックス
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: {
    type: 'Point';
    coordinates: [number, number]; // [経度, 緯度] の順番
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}