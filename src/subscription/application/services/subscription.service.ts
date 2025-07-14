import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { CreateSubscriptionDto } from "src/weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "src/weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "src/weather/application/dto/unsubscribe.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { Cron } from "@nestjs/schedule";
import { UpdateFrequency } from "src/shared/enums/frequency.enum";
import { TokenService } from "@/subscription/application/services/token.service";
import { SubscriptionManager } from "@/subscription/application/services/subscription-manager.service";
import { NotificationService } from "@/subscription/application/services/notification.service";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "@/subscription/infrastructure/repositories/subscription-query.repository";
import { ConfirmEmailService } from "@/subscription/application/services/confirm-email.service";

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly queryRepo: SubscriptionQueryRepository,
    private readonly mailer: MailerService,
    private readonly tokenService: TokenService,
    private readonly subscriptionManager: SubscriptionManager,
    private readonly notification: NotificationService,
    private readonly confirmEmail: ConfirmEmailService,
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
    await this.confirmEmail.sendConfirmationEmail(subscription, token);
  }

  async confirm(dto: ConfirmSubscriptionDto): Promise<void> {
    const sub = await this.queryRepo.findByToken(dto.token);
    if (!sub) throw new NotFoundException("Token not found");
    if (sub.confirmed) return;

    await this.subscriptionManager.confirm(dto.token);
  }

  async unsubscribe(dto: UnsubscribeDto): Promise<void> {
    const sub = await this.queryRepo.findByToken(dto.token);
    if (!sub) throw new NotFoundException("Token not found");

    await this.subscriptionManager.unsubscribe(dto.token);
  }
}
