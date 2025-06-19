import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailerModule } from "@nestjs-modules/mailer";
import { WeatherModule } from "@/weather/weather.module";
import { SubscriptionOrmEntity } from "@/subscription/infrastructure/database/subscription.orm-entity";
import { SubscriptionController } from "src/subscription/presentation/controllers/subscription.controller";
import { SubscriptionService } from "src/subscription/application/services/subscription.service";
import {
  SubscriptionFactory,
  SubscriptionManager,
} from "@/subscription/application/services/subscription-manager.service";
import { TokenService } from "@/subscription/application/services/token.service";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "@/subscription/infrastructure/repositories/subscription-query.repository";
import { SUBSCRIPTION_COMMAND_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-command.repository.interface";
import { SubscriptionCommandRepository } from "@/subscription/infrastructure/repositories/subscription-command.repository";
import { ConfirmEmailService } from "@/subscription/application/services/confirm-email.service";
import { NotificationService } from "@/subscription/application/services/notification.service";
import { NotificationStrategyResolver } from "@/subscription/application/services/notification-strategy-resolver";
import { NotificationBatchSender } from "@/subscription/application/services/notification-batch-sender";
import { DailyNotificationStrategy } from "@/subscription/application/services/strategies/daily-notification.strategy";
import { HourlyNotificationStrategy } from "@/subscription/application/services/strategies/hourly-notification.strategy";

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionOrmEntity]), MailerModule, WeatherModule],
  controllers: [SubscriptionController],
  providers: [
    {
      provide: SUBSCRIPTION_QUERY_REPOSITORY,
      useClass: SubscriptionQueryRepository,
    },
    {
      provide: SUBSCRIPTION_COMMAND_REPOSITORY,
      useClass: SubscriptionCommandRepository,
    },

    TokenService,
    SubscriptionFactory,
    SubscriptionManager,
    SubscriptionService,

    ConfirmEmailService,

    DailyNotificationStrategy,
    HourlyNotificationStrategy,

    {
      provide: NotificationStrategyResolver,
      useFactory: (
        dailyStrategy: DailyNotificationStrategy,
        hourlyStrategy: HourlyNotificationStrategy,
      ) => {
        return new NotificationStrategyResolver([dailyStrategy, hourlyStrategy]);
      },
      inject: [DailyNotificationStrategy, HourlyNotificationStrategy],
    },

    NotificationBatchSender,
    NotificationService,
  ],
  exports: [NotificationService, SubscriptionService],
})
export class SubscriptionModule {}
