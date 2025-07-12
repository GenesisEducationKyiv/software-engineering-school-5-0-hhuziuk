import { Injectable } from "@nestjs/common";
import { NotificationStrategy } from "../interfaces/notification-strategy.interface";
import { UpdateFrequency } from "../../../../../shared/enums/frequency.enum";
import { TokenService } from "../token.service";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { WeatherInfo } from "../interfaces/types.interface";

@Injectable()
export class DailyNotificationStrategy implements NotificationStrategy {
  readonly frequency = UpdateFrequency.DAILY;
  constructor(private readonly tokenService: TokenService) {}

  getSubject(): string {
    return "Your daily weather update";
  }

  getTemplate(): string {
    return "daily-subscription";
  }

  buildContext(sub: Subscription, weather: WeatherInfo) {
    return {
      greeting: "Morning",
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
