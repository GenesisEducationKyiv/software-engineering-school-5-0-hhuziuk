import { IWeatherRepository } from "@/weather/infrastructure/repositories/weather.repository.interface";
import { Weather } from "@/weather/domain/entities/weather.entity";
import { IRedisService } from "@/weather/infrastructure/redis/redis-service.interface";
import { IMetricsService } from "@/weather/infrastructure/metrics/metrics-service.interface";
import { WeatherCacheService } from "@/weather/application/services/weather-cache.service";

describe("WeatherCacheService", () => {
  let service: WeatherCacheService;
  let repo: jest.Mocked<IWeatherRepository>;
  let redis: jest.Mocked<IRedisService>;
  let metrics: jest.Mocked<IMetricsService>;
  const TTL = 3600;

  beforeEach(() => {
    repo = {
      findByCity: jest.fn(),
      save: jest.fn(),
    };

    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
    };

    metrics = {
      cacheRequests: {
        inc: jest.fn(),
      } as any,
      cacheLatency: {
        startTimer: jest.fn().mockReturnValue(jest.fn()),
      } as any,
    };

    service = new WeatherCacheService(repo, redis, metrics);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe("getCached", () => {
    it("should return weather from cache and increase hit metric", async () => {
      const weather: Weather = {
        city: "Kyiv",
        temperature: 20,
        humidity: 50,
        description: "Clear",
        fetchedAt: new Date(),
      } as Weather;

      redis.get.mockResolvedValue(weather);

      const result = await service.getCached("Kyiv");

      expect(redis.get).toHaveBeenCalledWith("weather:kyiv");
      expect(metrics.cacheRequests.inc).toHaveBeenCalledWith({ status: "hit", city: "kyiv" });
      expect(repo.findByCity).not.toHaveBeenCalled();
      expect(result).toBe(weather);
    });

    it("should return weather from DB if fresh and not cached", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      redis.get.mockResolvedValue(null);

      const dbWeather: Weather = {
        city: "Kyiv",
        temperature: 15,
        humidity: 60,
        description: "Cloudy",
        fetchedAt: new Date(now - 1000),
      } as Weather;

      repo.findByCity.mockResolvedValue(dbWeather);

      const result = await service.getCached("Kyiv");

      expect(redis.get).toHaveBeenCalledWith("weather:kyiv");
      expect(repo.findByCity).toHaveBeenCalledWith("Kyiv");
      expect(redis.set).toHaveBeenCalledWith("weather:kyiv", dbWeather, TTL);
      expect(metrics.cacheRequests.inc).toHaveBeenCalledWith({ status: "miss", city: "kyiv" });
      expect(result).toBe(dbWeather);
    });

    it("should return null if data from DB is expired", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      redis.get.mockResolvedValue(null);

      const dbWeather: Weather = {
        city: "Kyiv",
        temperature: 10,
        humidity: 70,
        description: "Snow",
        fetchedAt: new Date(now - TTL * 1000 - 1),
      } as Weather;

      repo.findByCity.mockResolvedValue(dbWeather);

      const result = await service.getCached("Kyiv");

      expect(result).toBeNull();
      expect(redis.get).toHaveBeenCalledWith("weather:kyiv");
      expect(repo.findByCity).toHaveBeenCalledWith("Kyiv");
      expect(redis.set).not.toHaveBeenCalled(); // Не кешуємо застарілі дані
      expect(metrics.cacheRequests.inc).toHaveBeenCalledWith({ status: "miss", city: "kyiv" });
    });
  });

  describe("updateCache", () => {
    it("should save weather to cache without writing to DB", async () => {
      const weather: Weather = {
        city: "Lviv",
        temperature: 12,
        humidity: 45,
        description: "Windy",
        fetchedAt: new Date(),
      } as Weather;

      await service.updateCache(weather);

      expect(redis.set).toHaveBeenCalledWith("weather:lviv", weather, TTL);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
