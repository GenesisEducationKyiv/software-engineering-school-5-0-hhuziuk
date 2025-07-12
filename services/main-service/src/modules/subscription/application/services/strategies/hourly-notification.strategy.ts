import { Injectable } from "@nestjs/common";
import { UpdateFrequency } from "../../../../../shared/enums/frequency.enum";
import { TokenService } from "../token.service";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { NotificationStrategy } from "../interfaces/notification-strategy.interface";
import { EmailContext, WeatherInfo } from "../interfaces/types.interface";

@Injectable()
export class HourlyNotificationStrategy implements NotificationStrategy {
  readonly frequency = UpdateFrequency.HOURLY;

  constructor(private readonly tokenService: TokenService) {}

  getSubject(): string {
    return "Your hourly weather update";
  }

  getTemplate(): string {
    return "hourly-subscription";
  }

  buildContext(sub: Subscription, weather: WeatherInfo): EmailContext {
    return {
      greeting: "Hour",
      city: sub.city,
      unsubscribeUrl: this.tokenService.getUnsubscribeUrl(sub.token),
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        description: weather.description,
      },
    };
  }
}
