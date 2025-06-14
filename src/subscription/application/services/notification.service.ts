import { UpdateFrequency } from "@/shared/enums/frequency.enum";
import { WeatherService } from "@/weather/application/services/weather.service";
import { MailerService } from "@nestjs-modules/mailer";
import { NotificationStrategy } from "@/subscription/application/services/interfaces/notification-strategy.interface";
import { Inject } from "@nestjs/common";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "@/subscription/infrastructure/repositories/subscription-query.repository";

export class NotificationService {
  private strategies: Map<UpdateFrequency, NotificationStrategy>;

  constructor(
    private readonly weatherService: WeatherService,
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly queryRepo: SubscriptionQueryRepository,
    private readonly mailer: MailerService,
    strategies: NotificationStrategy[],
  ) {
    this.strategies = new Map(strategies.map((s) => [s.frequency, s]));
  }

  async sendBatch(frequency: UpdateFrequency) {
    const strategy = this.strategies.get(frequency);
    if (!strategy) {
      throw new Error(`No notification strategy for frequency ${frequency}`);
    }

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
