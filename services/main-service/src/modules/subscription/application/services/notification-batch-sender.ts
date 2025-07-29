import { Injectable, Inject } from "@nestjs/common";
import { WeatherService } from "../../../weather/application/services/weather.service";
import { EmailClientService } from "@/shared/clients/email-client.service";
import { NotificationStrategyResolver } from "./notification-strategy-resolver";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "../../infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "../../infrastructure/repositories/subscription-query.repository";
import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";
import { WinstonLogger } from "@/shared/logger/winston-logger.service";

@Injectable()
export class NotificationBatchSender {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly emailClient: EmailClientService,
    private readonly strategyResolver: NotificationStrategyResolver,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly queryRepo: SubscriptionQueryRepository,
    private readonly logger: WinstonLogger,
  ) {}

  async send(frequency: UpdateFrequency): Promise<void> {
    this.logger.log(`[NotificationBatchSender] Start batch send for frequency=${frequency}`);

    const strategy = this.strategyResolver.get(frequency);
    const subs = await this.queryRepo.findConfirmedByFrequency(frequency);
    this.logger.log(
      `[NotificationBatchSender] Found ${subs.length} subscriptions for ${frequency}`,
    );

    for (const sub of subs) {
      try {
        const weather = await this.weatherService.getCurrentWeather(sub.city);
        const context = strategy.buildContext(sub, weather);
        await this.emailClient.sendEmail({
          to: sub.email,
          subject: strategy.getSubject(),
          template: strategy.getTemplate(),
          context,
        });
        this.logger.debug(`[NotificationBatchSender] Email sent → to=${sub.email}`);
      } catch (err) {
        this.logger.error(`[NotificationBatchSender] Failed email → to=${sub.email}`, err);
      }
    }

    this.logger.log(`[NotificationBatchSender] Completed batch for frequency=${frequency}`);
  }
}
