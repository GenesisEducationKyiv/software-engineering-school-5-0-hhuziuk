import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ISubscriptionQueryRepository } from "./subscription-query.repository.interface";
import { SubscriptionOrmEntity } from "../database/subscription.orm-entity";
import { Subscription } from "../../domain/entities/subscription.entity";
import { UpdateFrequency } from "src/shared/enums/frequency.enum";

@Injectable()
export class SubscriptionQueryRepository implements ISubscriptionQueryRepository {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly ormRepo: Repository<SubscriptionOrmEntity>,
  ) {}

  private toDomain(entity: SubscriptionOrmEntity): Subscription {
    return new Subscription(
      entity.id,
      entity.email,
      entity.city,
      entity.frequency,
      entity.confirmed,
      entity.token,
      entity.createdAt,
    );
  }

  async findByEmail(email: string): Promise<Subscription | null> {
    const entity = await this.ormRepo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByToken(token: string): Promise<Subscription | null> {
    const entity = await this.ormRepo.findOne({ where: { token } });
    return entity ? this.toDomain(entity) : null;
  }

  async findConfirmedByFrequency(frequency: UpdateFrequency): Promise<Subscription[]> {
    const entities = await this.ormRepo.find({ where: { frequency, confirmed: true } });
    return entities.map(this.toDomain);
  }

  async isEmailSubscribed(email: string, city: string): Promise<boolean> {
    const count = await this.ormRepo.count({ where: { email, city } });
    return count > 0;
  }
}
