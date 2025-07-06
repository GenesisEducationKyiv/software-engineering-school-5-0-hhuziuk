import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ISubscriptionCommandRepository } from "./subscription-command.repository.interface";
import { SubscriptionOrmEntity } from "../database/subscription.orm-entity";
import { Subscription } from "../../domain/entities/subscription.entity";

@Injectable()
export class SubscriptionCommandRepository implements ISubscriptionCommandRepository {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly ormRepo: Repository<SubscriptionOrmEntity>,
  ) {}

  async create(subscription: Subscription): Promise<void> {
    const exists = await this.ormRepo.exists({
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
}
