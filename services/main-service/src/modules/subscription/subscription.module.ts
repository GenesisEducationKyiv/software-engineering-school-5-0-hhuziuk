import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeatherModule } from "../weather/weather.module";
import { SubscriptionOrmEntity } from "./infrastructure/database/subscription.orm-entity";
import { SubscriptionController } from "./presentation/controllers/subscription.controller";
import { SubscriptionService } from "./application/services/subscription.service";
import {
  SubscriptionFactory,
  SubscriptionManager,
} from "./application/services/subscription-manager.service";
import { TokenService } from "./application/services/token.service";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "./infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "./infrastructure/repositories/subscription-query.repository";
import { SUBSCRIPTION_COMMAND_REPOSITORY } from "./infrastructure/repositories/subscription-command.repository.interface";
import { SubscriptionCommandRepository } from "./infrastructure/repositories/subscription-command.repository";
import { ConfirmEmailService } from "./application/services/confirm-email.service";
import { NotificationService } from "./application/services/notification.service";
import { NotificationStrategyResolver } from "./application/services/notification-strategy-resolver";
import { NotificationBatchSender } from "./application/services/notification-batch-sender";
import { DailyNotificationStrategy } from "./application/services/strategies/daily-notification.strategy";
import { HourlyNotificationStrategy } from "./application/services/strategies/hourly-notification.strategy";
import { HttpModule } from "@nestjs/axios";
import { EmailModule } from "@/shared/clients/email.module";
import { GrpcEmailModule } from "@/modules/subscription/infrastructure/grpc/grpc-email.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionOrmEntity]),
    WeatherModule,
    HttpModule,
    EmailModule,
    GrpcEmailModule,
  ],
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
  exports: [NotificationService, SubscriptionService, NotificationBatchSender],
})
export class SubscriptionModule {}
