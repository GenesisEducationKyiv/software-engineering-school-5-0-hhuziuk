import { Module } from "@nestjs/common";
import { WeatherRepository } from "src/weather/infrastructure/repositories/weather.repository";
import { WEATHER_REPOSITORY } from "src/weather/infrastructure/repositories/weather.repository.interface";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeatherOrmEntity } from "src/weather/infrastructure/database/weather.orm-entity";
import { WeatherService } from "src/weather/application/services/weather.service";
import { WeatherController } from "src/weather/presentation/controllers/weather.controller";
import { WeatherCacheService } from "@/weather/application/services/weather-cache.service";
import { WeatherApiClientProvider } from "@/weather/infrastructure/clients";
import { RedisService } from "@/weather/infrastructure/redis/redis.service";
import Redis from "ioredis";
import { config } from "@/shared/configs/config";
import { MetricsService } from "@/weather/infrastructure/metrics/metrics.service";
import {
  REDIS_CLIENT,
  REDIS_SERVICE_INTERFACE,
} from "@/weather/infrastructure/redis/redis-service.interface";
import { METRICS_SERVICE_INTERFACE } from "@/weather/infrastructure/metrics/metrics-service.interface";

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([WeatherOrmEntity])],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    WeatherCacheService,
    {
      provide: WEATHER_REPOSITORY,
      useClass: WeatherRepository,
    },
    WeatherApiClientProvider,
    RedisService,
    {
      provide: REDIS_CLIENT,
      useFactory: () =>
        new Redis({
          path: config.redis.socketPath,
          username: config.redis.username,
          password: config.redis.password,
          lazyConnect: true,
          maxRetriesPerRequest: null,
        }),
    },
    {
      provide: REDIS_SERVICE_INTERFACE,
      useExisting: RedisService,
    },

    MetricsService,
    {
      provide: METRICS_SERVICE_INTERFACE,
      useExisting: MetricsService,
    },
  ],
  exports: [WeatherService, WeatherCacheService, WEATHER_REPOSITORY],
})
export class WeatherModule {}
