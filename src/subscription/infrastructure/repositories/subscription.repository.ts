import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ISubscriptionRepository } from "src/subscription/infrastructure/repositories/subscription.repository.interface";
import { SubscriptionOrmEntity } from "src/subscription/infrastructure/database/subscription.orm-entity";
import { Subscription } from "src/subscription/domain/entities/subscription.entity";
import { UpdateFrequency } from "src/shared/enums/frequency.enum";

@Injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
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

  async create(subscription: Subscription): Promise<void> {
    const exists = await this.ormRepo.findOne({
      where: { email: subscription.email, city: subscription.city },
    });
    if (exists) {
      throw new ConflictException("Email already subscribed for this city");
    }

    const entity = this.ormRepo.create({
      id: subscription.id,
      email: subscription.email,
      city: subscription.city,
      frequency: subscription.frequency,
      confirmed: subscription.confirmed,
      token: subscription.token,
      createdAt: subscription.createdAt,
    });
    await this.ormRepo.save(entity);
  }

  async findByEmail(email: string): Promise<Subscription | null> {
    const entity = await this.ormRepo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByToken(token: string): Promise<Subscription | null> {
    const entity = await this.ormRepo.findOne({ where: { token } });
    return entity ? this.toDomain(entity) : null;
  }

  async confirmSubscription(token: string): Promise<void> {
    const entity = await this.ormRepo.findOne({ where: { token } });

    if (!entity) throw new NotFoundException("Token not found");
    if (entity.confirmed) throw new BadRequestException("Subscription already confirmed");

    entity.confirmed = true;
    await this.ormRepo.save(entity);
  }

  async unsubscribe(token: string): Promise<void> {
    const entity = await this.ormRepo.findOne({ where: { token } });
    if (!entity) throw new NotFoundException("Token not found");
    await this.ormRepo.remove(entity);
  }

  async isEmailSubscribed(email: string, city: string): Promise<boolean> {
    const count = await this.ormRepo.count({ where: { email, city } });
    return count > 0;
  }

  async findConfirmedByFrequency(frequency: UpdateFrequency): Promise<Subscription[]> {
    const entities = await this.ormRepo.find({
      where: { frequency, confirmed: true },
    });
    return entities.map((e) => this.toDomain(e));
  }
}
