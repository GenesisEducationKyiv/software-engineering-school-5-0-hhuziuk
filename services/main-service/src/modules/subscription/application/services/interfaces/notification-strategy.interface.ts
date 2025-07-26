import { UpdateFrequency } from "../../../../../shared/enums/frequency.enum";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { EmailContext, WeatherInfo } from "./types.interface";

export interface NotificationStrategy {
  readonly frequency: UpdateFrequency;

  getSubject(): string;
  getTemplate(): string;
  buildContext(sub: Subscription, weather: WeatherInfo): EmailContext;
}
