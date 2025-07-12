import { Subscription } from "../../domain/entities/subscription.entity";
import { CreateSubscriptionDto } from "../../../weather/application/dto/create-subscription.dto";
import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "../../infrastructure/repositories/subscription-query.repository.interface";
import { SUBSCRIPTION_COMMAND_REPOSITORY } from "../../infrastructure/repositories/subscription-command.repository.interface";
import { SubscriptionQueryRepository } from "../../infrastructure/repositories/subscription-query.repository";
import { SubscriptionCommandRepository } from "../../infrastructure/repositories/subscription-command.repository";

export class SubscriptionFactory {
  create(dto: CreateSubscriptionDto, token: string): Subscription {
    return new Subscription(uuidv4(), dto.email, dto.city, dto.frequency, false, token, new Date());
  }
}

@Injectable()
export class SubscriptionManager {
  constructor(
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly queryRepo: SubscriptionQueryRepository,
    @Inject(SUBSCRIPTION_COMMAND_REPOSITORY)
    private readonly commandRepo: SubscriptionCommandRepository,
    private readonly factory: SubscriptionFactory,
  ) {}

  async subscribe(dto: CreateSubscriptionDto, token: string): Promise<Subscription> {
    const isSubbed = await this.queryRepo.isEmailSubscribed(dto.email, dto.city);
    if (isSubbed) {
      throw new ConflictException("Email already subscribed");
    }

    const subscription = this.factory.create(dto, token);
    await this.commandRepo.create(subscription);
    return subscription;
  }

  async confirm(token: string): Promise<void> {
    await this.commandRepo.confirmSubscription(token);
  }

  async unsubscribe(token: string): Promise<void> {
    await this.commandRepo.unsubscribe(token);
  }
}
