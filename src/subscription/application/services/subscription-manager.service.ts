import { Subscription } from "src/subscription/domain/entities/subscription.entity";
import { CreateSubscriptionDto } from "src/weather/application/dto/create-subscription.dto";
import { ConflictException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { ISubscriptionRepository } from "@/subscription/infrastructure/repositories/subscription.repository.interface";

export class SubscriptionFactory {
  create(dto: CreateSubscriptionDto, token: string): Subscription {
    return new Subscription(uuidv4(), dto.email, dto.city, dto.frequency, false, token, new Date());
  }
}

export class SubscriptionManager {
  constructor(
    private readonly repo: ISubscriptionRepository,
    private readonly factory: SubscriptionFactory,
  ) {}

  async subscribe(dto: CreateSubscriptionDto, token: string): Promise<Subscription> {
    const isSubbed = await this.repo.isEmailSubscribed(dto.email, dto.city);
    if (isSubbed) {
      throw new ConflictException("Email already subscribed");
    }

    const subscription = this.factory.create(dto, token);
    await this.repo.create(subscription);

    return subscription;
  }

  async confirm(token: string): Promise<void> {
    await this.repo.confirmSubscription(token);
  }

  async unsubscribe(token: string): Promise<void> {
    await this.repo.unsubscribe(token);
  }
}
