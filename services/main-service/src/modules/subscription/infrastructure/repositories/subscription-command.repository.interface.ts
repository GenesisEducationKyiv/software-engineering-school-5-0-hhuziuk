import { Subscription } from "../../domain/entities/subscription.entity";

export const SUBSCRIPTION_COMMAND_REPOSITORY = "SUBSCRIPTION_COMMAND_REPOSITORY";

export interface ISubscriptionCommandRepository {
  create(subscription: Subscription): Promise<void>;
  confirmSubscription(token: string): Promise<void>;
  unsubscribe(token: string): Promise<void>;
}
