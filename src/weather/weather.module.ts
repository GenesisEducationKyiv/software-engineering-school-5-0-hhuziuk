import { Module } from "@nestjs/common";
import { WeatherRepository } from "src/weather/infrastructure/repositories/weather.repository";
import { WEATHER_REPOSITORY } from "src/weather/infrastructure/repositories/weather.repository.interface";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeatherOrmEntity } from "src/weather/infrastructure/database/weather.orm-entity";
import { WeatherService } from "src/weather/application/services/weather.service";
import { WeatherController } from "src/weather/presentation/controllers/weather.controller";
import {WeatherCacheService} from "@/weather/application/services/weather-cache.service";
import {WEATHER_API_CLIENT} from "@/weather/application/clients/weather-api-client.interface";
import {WeatherApiClient} from "@/weather/application/clients/weather-api-client";

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
    {
      provide: WEATHER_API_CLIENT,
      useClass: WeatherApiClient,
    }
  ],
  exports: [
    WeatherService,
    WeatherCacheService,
    WEATHER_REPOSITORY,
    WEATHER_API_CLIENT,
  ],
})
export class WeatherModule {}