import { Injectable, Inject } from "@nestjs/common";
import { WeatherService } from "../../../weather/application/services/weather.service";
import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "../../infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "../../infrastructure/repositories/subscription-query.repository";
import { NotificationStrategyResolver } from "./notification-strategy-resolver";
import { EmailClientService } from "@/shared/clients/email-client.service";

@Injectable()
export class NotificationBatchSender {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly emailClient: EmailClientService,
    private readonly strategyResolver: NotificationStrategyResolver,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly queryRepo: SubscriptionQueryRepository,
  ) {}

  async send(frequency: UpdateFrequency): Promise<void> {
    const strategy = this.strategyResolver.get(frequency);
    const subs = await this.queryRepo.findConfirmedByFrequency(frequency);

    for (const sub of subs) {
      const weather = await this.weatherService.getCurrentWeather(sub.city);
      const context = strategy.buildContext(sub, weather);
      await this.emailClient.sendEmail({
        to: sub.email,
        subject: strategy.getSubject(),
        template: strategy.getTemplate(),
        context,
      });
    }
  }
}
