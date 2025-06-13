import { Subscription } from "@/subscription/domain/entities/subscription.entity";
import { UpdateFrequency } from "@/shared/enums/frequency.enum";

export const SUBSCRIPTION_REPOSITORY = "SUBSCRIPTION_REPOSITORY";

export interface ISubscriptionRepository {
  create(subscription: Subscription): Promise<void>;
  findByEmail(email: string): Promise<Subscription | null>;
  findByToken(token: string): Promise<Subscription | null>;
  findConfirmedByFrequency(frequency: UpdateFrequency): Promise<Subscription[]>;

  confirmSubscription(token: string): Promise<void>;
  unsubscribe(token: string): Promise<void>;
  isEmailSubscribed(email: string, city: string): Promise<boolean>;
}
