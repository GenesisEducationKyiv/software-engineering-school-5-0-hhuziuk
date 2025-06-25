import { Injectable, Inject } from "@nestjs/common";
import { WeatherService } from "@/weather/application/services/weather.service";
import { MailerService } from "@nestjs-modules/mailer";
import { UpdateFrequency } from "@/shared/enums/frequency.enum";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "@/subscription/infrastructure/repositories/subscription-query.repository";
import { NotificationStrategyResolver } from "@/subscription/application/services/notification-strategy-resolver";

@Injectable()
export class NotificationBatchSender {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly mailer: MailerService,
    private readonly strategyResolver: NotificationStrategyResolver,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly queryRepo: SubscriptionQueryRepository,
  ) {}

  async send(frequency: UpdateFrequency): Promise<void> {
    const strategy = this.strategyResolver.get(frequency);
    const subs = await this.queryRepo.findConfirmedByFrequency(frequency);

    for (const sub of subs) {
      const weather = await this.weatherService.getCurrent(sub.city);
      const context = strategy.buildContext(sub, weather);
      await this.mailer.sendMail({
        to: sub.email,
        subject: strategy.getSubject(),
        template: strategy.getTemplate(),
        context,
      });
    }
  }
}
