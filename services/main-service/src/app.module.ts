import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeatherModule } from "./modules/weather/weather.module";
import { SubscriptionModule } from "./modules/subscription/subscription.module";
import { WeatherOrmEntity } from "./modules/weather/infrastructure/database/weather.orm-entity";
import { SubscriptionOrmEntity } from "./modules/subscription/infrastructure/database/subscription.orm-entity";
import { config } from "./shared/configs/config";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule.register({}),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: config.db.host,
      port: config.db.port,
      username: config.db.user,
      password: config.db.password,
      database: config.db.database,
      entities: [WeatherOrmEntity, SubscriptionOrmEntity],
      synchronize: config.db.synchronize,
    }),
    WeatherModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
