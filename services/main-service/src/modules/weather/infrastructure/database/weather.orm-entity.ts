import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";

@Entity("weather")
@Index(["city"], { unique: true })
export class WeatherOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({ type: "numeric" })
  temperature!: number;

  @Column({ type: "numeric" })
  humidity!: number;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "timestamptz" })
  fetchedAt!: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
