import { Inject, Injectable } from "@nestjs/common";
import { Weather } from "src/weather/domain/entities/weather.entity";
import {
  IWeatherRepository,
  WEATHER_REPOSITORY,
} from "src/weather/infrastructure/repositories/weather.repository.interface";

@Injectable()
export class WeatherCacheService {
  private readonly ttl = 3600_000; // 1h

  constructor(
    @Inject(WEATHER_REPOSITORY)
    private readonly repo: IWeatherRepository,
  ) {}

  async getCached(city: string): Promise<Weather | null> {
    const cached = await this.repo.findByCity(city);
    if (cached && Date.now() - cached.fetchedAt.getTime() < this.ttl) {
      return cached;
    }
    return null;
  }

  async updateCache(weather: Weather): Promise<void> {
    await this.repo.save(weather);
  }
}
