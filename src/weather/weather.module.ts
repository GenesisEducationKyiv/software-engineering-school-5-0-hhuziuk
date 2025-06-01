import { Module } from "@nestjs/common";
import { WeatherRepository } from "src/weather/infrastructure/repositories/weather.repository";
import { WEATHER_REPOSITORY } from "src/weather/infrastructure/repositories/weather.repository.interface";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WeatherOrmEntity } from "src/weather/infrastructure/database/weather.orm-entity";
import { WeatherService } from "src/weather/application/services/weather.service";
import { WeatherController } from "src/weather/presentation/controllers/weather.controller";

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([WeatherOrmEntity])],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherRepository],
  exports: [WeatherRepository, WeatherService],
})
export class WeatherModule {}
