import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { CreateSubscriptionDto } from "../../../weather/application/dto/create-subscription.dto";
import { ConfirmSubscriptionDto } from "../../../weather/application/dto/confirm-subscription.dto";
import { UnsubscribeDto } from "../../../weather/application/dto/unsubscribe.dto";
import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";
import { TokenService } from "./token.service";
import { SubscriptionManager } from "./subscription-manager.service";
import { NotificationService } from "./notification.service";
import { ConfirmEmailService } from "./confirm-email.service";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "../../infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "../../infrastructure/repositories/subscription-query.repository";
import { WinstonLogger } from "@/shared/logger/winston-logger.service";

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_QUERY_REPOSITORY)
    private readonly queryRepo: SubscriptionQueryRepository,
    private readonly tokenService: TokenService,
    private readonly subscriptionManager: SubscriptionManager,
    private readonly notification: NotificationService,
    private readonly confirmEmail: ConfirmEmailService,

    private readonly logger: WinstonLogger,
  ) {}

  @Cron("0 8 * * *", { timeZone: "Europe/Warsaw" })
  async handleDailyNotifications() {
    this.logger.log("[SubscriptionService] Daily cron triggered");
    try {
      await this.notification.sendBatch(UpdateFrequency.DAILY);
      this.logger.log("[SubscriptionService] Daily notifications sent");
    } catch (err) {
      this.logger.error("[SubscriptionService] Error in daily notifications", err);
    }
  }

  @Cron("0 * * * *", { timeZone: "Europe/Warsaw" })
  async handleHourlyNotifications() {
    this.logger.log("[SubscriptionService] Hourly cron triggered");
    try {
      await this.notification.sendBatch(UpdateFrequency.HOURLY);
      this.logger.log("[SubscriptionService] Hourly notifications sent");
    } catch (err) {
      this.logger.error("[SubscriptionService] Error in hourly notifications", err);
    }
  }

  async subscribe(dto: CreateSubscriptionDto): Promise<void> {
    this.logger.log(
      `[SubscriptionService] subscribe() called → email=${dto.email}, city=${dto.city}`,
    );

    const token = this.tokenService.generate();
    this.logger.debug(`[SubscriptionService] Generated token=${token}`);

    let subscription;
    try {
      subscription = await this.subscriptionManager.subscribe(dto, token);
      this.logger.log(`[SubscriptionService] Subscription created → id=${subscription.id}`);
    } catch (err) {
      this.logger.error(
        `[SubscriptionService] Error creating subscription for email=${dto.email}`,
        err,
      );
      throw err;
    }

    try {
      await this.confirmEmail.sendConfirmationEmail(subscription, token);
      this.logger.log(`[SubscriptionService] Confirmation email sent → to=${subscription.email}`);
    } catch (err) {
      this.logger.error(
        `[SubscriptionService] Error sending confirmation email → to=${subscription.email}`,
        err,
      );
      throw err;
    }
  }

  async confirm(dto: ConfirmSubscriptionDto): Promise<void> {
    this.logger.log(`[SubscriptionService] confirm() called → token=${dto.token}`);

    const sub = await this.queryRepo.findByToken(dto.token);
    if (!sub) {
      this.logger.warn(`[SubscriptionService] confirm(): token not found`);
      throw new NotFoundException("Token not found");
    }
    if (sub.confirmed) {
      this.logger.log(`[SubscriptionService] confirm(): already confirmed`);
      return;
    }

    try {
      await this.subscriptionManager.confirm(dto.token);
      this.logger.log(`[SubscriptionService] Subscription confirmed → id=${sub.id}`);
    } catch (err) {
      this.logger.error(
        `[SubscriptionService] Error confirming subscription → token=${dto.token}`,
        err,
      );
      throw err;
    }
  }

  async unsubscribe(dto: UnsubscribeDto): Promise<void> {
    this.logger.log(`[SubscriptionService] unsubscribe() called → token=${dto.token}`);

    const sub = await this.queryRepo.findByToken(dto.token);
    if (!sub) {
      this.logger.warn(`[SubscriptionService] unsubscribe(): token not found`);
      throw new NotFoundException("Token not found");
    }

    try {
      await this.subscriptionManager.unsubscribe(dto.token);
      this.logger.log(`[SubscriptionService] Subscription unsubscribed → id=${sub.id}`);
    } catch (err) {
      this.logger.error(
        `[SubscriptionService] Error unsubscribing subscription → token=${dto.token}`,
        err,
      );
      throw err;
    }
  }
}
