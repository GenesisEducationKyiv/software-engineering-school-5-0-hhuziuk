import { Inject, Injectable } from "@nestjs/common";
import {
  IWeatherRepository,
  WEATHER_REPOSITORY,
} from "../../infrastructure/repositories/weather.repository.interface";
import { Weather } from "../../domain/entities/weather.entity";
import {
  IMetricsService,
  METRICS_SERVICE_INTERFACE,
} from "../../infrastructure/metrics/metrics-service.interface";
import {
  IRedisService,
  REDIS_SERVICE_INTERFACE,
} from "../../infrastructure/redis/redis-service.interface";

const TTL_SECONDS = 3600;

@Injectable()
export class WeatherCacheService {
  constructor(
    @Inject(WEATHER_REPOSITORY)
    private readonly repo: IWeatherRepository,

    @Inject(REDIS_SERVICE_INTERFACE)
    private readonly redis: IRedisService,

    @Inject(METRICS_SERVICE_INTERFACE)
    private readonly metrics: IMetricsService,
  ) {}

  async getCached(city: string): Promise<Weather | null> {
    const key = `weather:${city.toLowerCase()}`;
    const endTimer = this.metrics.cacheLatency.startTimer();

    try {
      const cached = await this.redis.get<Weather>(key);
      if (cached) {
        this.metrics.cacheRequests.inc({ status: "hit", city: city.toLowerCase() });
        return cached;
      }

      const dbData = await this.repo.findByCity(city);
      this.metrics.cacheRequests.inc({ status: "miss", city: city.toLowerCase() });

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
  }
}
