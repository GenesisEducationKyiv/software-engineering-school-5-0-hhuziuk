import { Module } from "@nestjs/common";
import { WeatherRepository } from "src/weather/infrastructure/repositories/weather.repository";
import { WEATHER_REPOSITORY } from "src/weather/infrastructure/repositories/weather.repository.interface";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeatherOrmEntity } from "src/weather/infrastructure/database/weather.orm-entity";
import { WeatherService } from "src/weather/application/services/weather.service";
import { WeatherController } from "src/weather/presentation/controllers/weather.controller";
import { WeatherCacheService } from "@/weather/application/services/weather-cache.service";
import { WEATHER_API_CLIENT } from "@/weather/infrastructure/clients/weather-api-client.interface";
import { WeatherApiClientProvider } from "@/weather/infrastructure/clients";
import { CustomRedisModule } from "@/shared/redis/redis.module";
import { MetricsModule } from "@/shared/metrics/metrics.module";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([WeatherOrmEntity]),
    CustomRedisModule,
    MetricsModule,
  ],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    WeatherCacheService,
    {
      provide: WEATHER_REPOSITORY,
      useClass: WeatherRepository,
    },
    WeatherApiClientProvider,
  ],
  exports: [WeatherService, WeatherCacheService, WEATHER_REPOSITORY, "WEATHER_API_CLIENT"],
})
export class WeatherModule {}
