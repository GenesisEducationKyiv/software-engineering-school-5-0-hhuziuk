import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import {
  IWeatherRepository,
  WEATHER_REPOSITORY,
} from "src/weather/infrastructure/repositories/weather.repository.interface";
import {
  IWeatherApiClient,
  WEATHER_API_CLIENT,
} from "src/weather/application/clients/weather-api-client.interface";
import { Weather } from "src/weather/domain/entities/weather.entity";
import { WeatherCacheService } from "./weather-cache.service";

@Injectable()
export class WeatherService {
  constructor(
    @Inject(WEATHER_REPOSITORY)
    private readonly repo: IWeatherRepository,
    @Inject(WEATHER_API_CLIENT)
    private readonly apiClient: IWeatherApiClient,
    private readonly cacheService: WeatherCacheService,
  ) {}

  async getCurrent(city: string): Promise<Weather> {
    if (!city || city.trim() === "") {
      throw new BadRequestException("City cannot be empty");
    }
    const cached = await this.cacheService.getCached(city);
    if (cached) {
      return cached;
    }
    const fresh = await this.apiClient.fetchCurrent(city);
    await this.cacheService.updateCache(fresh);
    return fresh;
  }
}
