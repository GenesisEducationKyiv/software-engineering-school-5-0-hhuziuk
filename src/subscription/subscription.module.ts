import { Module } from "@nestjs/common";
import { SubscriptionRepository } from "src/subscription/infrastructure/repositories/subscription.repository";
import { SUBSCRIPTION_REPOSITORY } from "src/subscription/infrastructure/repositories/subscription.repository.interface";
import { SubscriptionController } from "src/subscription/presentation/controllers/subscription.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubscriptionService } from "src/subscription/application/services/subscription.service";
import { SubscriptionOrmEntity } from "src/subscription/infrastructure/database/subscription.orm-entity";
import { WeatherModule } from "src/weather/weather.module";

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionOrmEntity]), WeatherModule],
  providers: [
    SubscriptionService,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionRepository,
    },
  ],
  exports: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionRepository,
    },
  ],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
