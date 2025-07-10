import { IWeatherRepository } from "@/weather/infrastructure/repositories/weather.repository.interface";
import { Weather } from "@/weather/domain/entities/weather.entity";
import { WeatherCacheService } from "@/weather/application/services/weather-cache.service";
import { RedisService } from "@/shared/redis/redis.service";
import { MetricsService } from "@/shared/metrics/metrics.service";

describe("WeatherCacheService", () => {
  let service: WeatherCacheService;
  let repo: jest.Mocked<IWeatherRepository>;
  let redis: jest.Mocked<RedisService>;
  let metrics: jest.Mocked<MetricsService>;
  const TTL = 3600;

  beforeEach(() => {
    repo = {
      findByCity: jest.fn(),
      save: jest.fn(),
    } as any;

    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
    } as any;

    metrics = {
      cacheRequests: {
        inc: jest.fn(),
      },
      cacheLatency: {
        startTimer: jest.fn().mockReturnValue(jest.fn()),
      },
    } as any;

    service = new WeatherCacheService(repo, redis, metrics);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe("getCached", () => {
    it("returns weather from cache and increases hit metric", async () => {
      const weather: Weather = {
        id: "1",
        city: "Kyiv",
        temperature: 20,
        humidity: 50,
        description: "Clear",
        fetchedAt: new Date(),
        createdAt: new Date(),
      } as any;

      redis.get.mockResolvedValue(weather);

      const result = await service.getCached("Kyiv");

      expect(redis.get).toHaveBeenCalledWith("weather:kyiv");
      expect(metrics.cacheRequests.inc).toHaveBeenCalledWith({ status: "hit", city: "kyiv" });

      expect(result).toBe(weather);
    });

    it("returns weather from DB if fresh and not cached", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      redis.get.mockResolvedValue(null);

      const dbWeather: Weather = {
        id: "2",
        city: "Kyiv",
        temperature: 15,
        humidity: 60,
        description: "Cloudy",
        fetchedAt: new Date(now - 1000),
        createdAt: new Date(),
      } as any;

      repo.findByCity.mockResolvedValue(dbWeather);

      const result = await service.getCached("Kyiv");

      expect(redis.get).toHaveBeenCalled();
      expect(repo.findByCity).toHaveBeenCalledWith("Kyiv");
      expect(redis.set).toHaveBeenCalledWith("weather:kyiv", dbWeather, TTL);
      expect(metrics.cacheRequests.inc).toHaveBeenCalledWith({ status: "miss", city: "kyiv" });
      expect(result).toBe(dbWeather);
    });

    it("returns null if data is missing or expired", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      redis.get.mockResolvedValue(null);

      const dbWeather: Weather = {
        id: "3",
        city: "Kyiv",
        temperature: 10,
        humidity: 70,
        description: "Snow",
        fetchedAt: new Date(now - TTL * 1000 - 1000), // expired
        createdAt: new Date(),
      } as any;

      repo.findByCity.mockResolvedValue(dbWeather);

      const result = await service.getCached("Kyiv");

      expect(result).toBeNull();
      expect(redis.get).toHaveBeenCalled();
      expect(repo.findByCity).toHaveBeenCalledWith("Kyiv");
      expect(metrics.cacheRequests.inc).toHaveBeenCalled();
    });
  });

  describe("updateCache", () => {
    it("saves weather only to cache, без запису в БД", async () => {
      const weather: Weather = {
        id: "4",
        city: "Lviv",
        temperature: 12,
        humidity: 45,
        description: "Windy",
        fetchedAt: new Date(),
        createdAt: new Date(),
      } as any;

      await service.updateCache(weather);

      expect(redis.set).toHaveBeenCalledWith("weather:lviv", weather, TTL);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
