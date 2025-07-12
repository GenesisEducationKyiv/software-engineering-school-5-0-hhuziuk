import { Subscription } from "../../domain/entities/subscription.entity";
import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";

export const SUBSCRIPTION_QUERY_REPOSITORY = "SUBSCRIPTION_QUERY_REPOSITORY";

export interface ISubscriptionQueryRepository {
  findByEmail(email: string): Promise<Subscription | null>;
  findByToken(token: string): Promise<Subscription | null>;
  findConfirmedByFrequency(frequency: UpdateFrequency): Promise<Subscription[]>;
  isEmailSubscribed(email: string, city: string): Promise<boolean>;
}
