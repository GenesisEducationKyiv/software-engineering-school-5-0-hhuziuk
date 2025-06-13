import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY,
} from "src/subscription/infrastructure/repositories/subscription.repository.interface";
import { CreateSubscriptionDto } from "src/weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "src/weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "src/weather/application/dto/unsubscribe.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { Cron } from "@nestjs/schedule";
import { UpdateFrequency } from "src/shared/enums/frequency.enum";
import { TokenService } from "@/subscription/application/services/token.service";
import { SubscriptionManager } from "@/subscription/application/services/subscription-manager.service";
import { NotificationService } from "@/subscription/application/services/notification.service";

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repo: ISubscriptionRepository,
    private readonly mailer: MailerService,
    private readonly tokenService: TokenService,
    private readonly subscriptionManager: SubscriptionManager,
    private readonly notification: NotificationService,
  ) {}

  @Cron("0 8 * * *", { timeZone: "Europe/Warsaw" })
  async handleDailyNotifications() {
    await this.notification.sendBatch(UpdateFrequency.DAILY);
  }

  @Cron("0 * * * *", { timeZone: "Europe/Warsaw" })
  async handleHourlyNotifications() {
    await this.notification.sendBatch(UpdateFrequency.HOURLY);
  }

  async subscribe(dto: CreateSubscriptionDto): Promise<void> {
    const token = this.tokenService.generate();
    const subscription = await this.subscriptionManager.subscribe(dto, token);

    await this.mailer.sendMail({
      to: subscription.email,
      subject: "Welcome! Confirm your weather subscription",
      template: "confirm-subscription",
      context: {
        city: subscription.city,
        confirmUrl: this.tokenService.getConfirmUrl(token),
        unsubscribeUrl: this.tokenService.getUnsubscribeUrl(token),
      },
    });
  }

  async confirm(dto: ConfirmSubscriptionDto): Promise<void> {
    const sub = await this.repo.findByToken(dto.token);
    if (!sub) throw new NotFoundException("Token not found");
    if (sub.confirmed) return;
    await this.repo.confirmSubscription(dto.token);
  }

  async unsubscribe(dto: UnsubscribeDto): Promise<void> {
    const sub = await this.repo.findByToken(dto.token);
    if (!sub) throw new NotFoundException("Token not found");
    await this.repo.unsubscribe(dto.token);
  }
}
