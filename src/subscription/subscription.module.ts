import { Module } from "@nestjs/common";
import { SubscriptionController } from "src/subscription/presentation/controllers/subscription.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubscriptionService } from "src/subscription/application/services/subscription.service";
import { SubscriptionOrmEntity } from "src/subscription/infrastructure/database/subscription.orm-entity";
import { WeatherModule } from "src/weather/weather.module";
import { TokenService } from "@/subscription/application/services/token.service";
import { MailerModule, MailerService } from "@nestjs-modules/mailer";
import { DailyNotificationStrategy } from "@/subscription/application/services/strategies/daily-notification.strategy";
import { HourlyNotificationStrategy } from "@/subscription/application/services/strategies/hourly-notification.strategy";
import { NotificationService } from "@/subscription/application/services/notification.service";
import {
  SubscriptionFactory,
  SubscriptionManager,
} from "@/subscription/application/services/subscription-manager.service";
import { WeatherService } from "@/weather/application/services/weather.service";
import { SUBSCRIPTION_QUERY_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-query.repository.interface";
import { SubscriptionQueryRepository } from "@/subscription/infrastructure/repositories/subscription-query.repository";
import { SUBSCRIPTION_COMMAND_REPOSITORY } from "@/subscription/infrastructure/repositories/subscription-command.repository.interface";
import { SubscriptionCommandRepository } from "@/subscription/infrastructure/repositories/subscription-command.repository";

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
    DailyNotificationStrategy,
    HourlyNotificationStrategy,
    {
      provide: NotificationService,
      useFactory: (
        weatherService: WeatherService,
        queryRepo: SubscriptionQueryRepository,
        mailer: MailerService,
        dailyStrategy: DailyNotificationStrategy,
        hourlyStrategy: HourlyNotificationStrategy,
      ) => {
        return new NotificationService(weatherService, queryRepo, mailer, [
          dailyStrategy,
          hourlyStrategy,
        ]);
      },
      inject: [
        WeatherService,
        SUBSCRIPTION_QUERY_REPOSITORY,
        MailerService,
        DailyNotificationStrategy,
        HourlyNotificationStrategy,
      ],
    },
    SubscriptionFactory,
    SubscriptionManager,
    SubscriptionService,
  ],
  exports: [NotificationService, SubscriptionService],
})
export class SubscriptionModule {}
