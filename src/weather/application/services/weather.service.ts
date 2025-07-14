import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  IWeatherApiClient,
  WEATHER_API_CLIENT,
} from "../../infrastructure/clients/weather-api-client.interface";
import { Weather } from "src/weather/domain/entities/weather.entity";
import { WeatherCacheService } from "@/weather/application/services/weather-cache.service";

@Injectable()
export class WeatherService {
  constructor(
    @Inject(WEATHER_API_CLIENT)
    private readonly weatherApiClient: IWeatherApiClient,
    private readonly cacheService: WeatherCacheService,
  ) {}

  async getCurrentWeather(city: string): Promise<Weather> {
    if (!city || city.trim() === "") {
      throw new BadRequestException("City cannot be empty");
    }
    const cached = await this.cacheService.getCached(city);
    if (cached) {
      return cached;
    }
    const fresh = await this.weatherApiClient.fetchCurrent(city);
    await this.cacheService.updateCache(fresh);
    return fresh;
  }
}
