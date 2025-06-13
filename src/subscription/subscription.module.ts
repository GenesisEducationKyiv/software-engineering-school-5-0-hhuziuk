import { Module } from "@nestjs/common";
import { SubscriptionRepository } from "src/subscription/infrastructure/repositories/subscription.repository";
import {
  ISubscriptionRepository,
  SUBSCRIPTION_REPOSITORY
} from "src/subscription/infrastructure/repositories/subscription.repository.interface";
import { SubscriptionController } from "src/subscription/presentation/controllers/subscription.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubscriptionService } from "src/subscription/application/services/subscription.service";
import { SubscriptionOrmEntity } from "src/subscription/infrastructure/database/subscription.orm-entity";
import { WeatherModule } from "src/weather/weather.module";
import { TokenService } from "@/subscription/application/services/token.service";
import {MailerModule, MailerService} from "@nestjs-modules/mailer";
import { DailyNotificationStrategy } from "@/subscription/application/services/strategies/daily-notification.strategy";
import { HourlyNotificationStrategy } from "@/subscription/application/services/strategies/hourly-notification.strategy";
import { NotificationService } from "@/subscription/application/services/notification.service";
import {
  SubscriptionFactory,
  SubscriptionManager
} from "@/subscription/application/services/subscription-manager.service";
import {WeatherService} from "@/weather/application/services/weather.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionOrmEntity]),
    MailerModule,
    WeatherModule,
  ],
  controllers: [SubscriptionController], // Added controller
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionRepository,
    },
    TokenService,
    DailyNotificationStrategy,
    HourlyNotificationStrategy,
    {
      provide: NotificationService,
      useFactory: (
          weatherService: WeatherService,
          repo: ISubscriptionRepository,
          mailer: MailerService,
          dailyStrategy: DailyNotificationStrategy,
          hourlyStrategy: HourlyNotificationStrategy,
      ) => {
        return new NotificationService(
            weatherService,
            repo,
            mailer,
            [dailyStrategy, hourlyStrategy],
        );
      },
      inject: [
        WeatherService,
        SUBSCRIPTION_REPOSITORY,
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
