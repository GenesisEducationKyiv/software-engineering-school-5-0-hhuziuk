import { Inject, Injectable } from "@nestjs/common";
import {
  IWeatherRepository,
  WEATHER_REPOSITORY,
} from "@/weather/infrastructure/repositories/weather.repository.interface";
import { RedisService } from "@/shared/redis/redis.service";
import { MetricsService } from "@/shared/metrics/metrics.service";
import { Weather } from "@/weather/domain/entities/weather.entity";

const TTL_SECONDS = 3600;

@Injectable()
export class WeatherCacheService {
  constructor(
    @Inject(WEATHER_REPOSITORY)
    private readonly repo: IWeatherRepository,
    private readonly redis: RedisService,
    private readonly metrics: MetricsService,
  ) {}

  async getCached(city: string): Promise<Weather | null> {
    const key = `weather:${city.toLowerCase()}`;
    const endTimer = this.metrics.cacheLatency.startTimer();

    try {
      const cached = await this.redis.get<Weather>(key);
      if (cached) {
        this.metrics.cacheHits.inc({ key });
        return cached;
      }

      const dbData = await this.repo.findByCity(city);
      this.metrics.cacheMisses.inc({ key });

      if (!dbData) {
        return null;
      }

      const ageMs = Date.now() - dbData.fetchedAt.getTime();
      if (ageMs <= TTL_SECONDS * 1000) {
        await this.redis.set<Weather>(key, dbData, TTL_SECONDS);
        return dbData;
      }

      return null;
    } finally {
      endTimer();
    }
  }

  async updateCache(weather: Weather): Promise<void> {
    const key = `weather:${weather.city.toLowerCase()}`;
    await this.redis.set<Weather>(key, weather, TTL_SECONDS);
    await this.repo.save(weather);
  }
}
