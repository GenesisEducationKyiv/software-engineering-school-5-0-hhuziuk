import { UpdateFrequency } from "@/shared/enums/frequency.enum";
import { Subscription } from "@/subscription/domain/entities/subscription.entity";
import {
  EmailContext,
  WeatherInfo,
} from "@/subscription/application/services/interfaces/types.interface";

export interface NotificationStrategy {
  readonly frequency: UpdateFrequency;

  getSubject(): string;
  getTemplate(): string;
  buildContext(sub: Subscription, weather: WeatherInfo): EmailContext;
}
