import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";

@Entity("subscription")
@Index(["email", "city"], { unique: true })
export class SubscriptionOrmEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({
    type: "enum",
    enum: UpdateFrequency,
  })
  frequency!: UpdateFrequency;

  @Column({ type: "boolean", default: false })
  confirmed!: boolean;

  @Column({ type: "varchar", length: 255, unique: true })
  token!: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;
}
