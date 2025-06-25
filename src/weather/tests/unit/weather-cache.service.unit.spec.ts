import { IWeatherRepository } from "@/weather/infrastructure/repositories/weather.repository.interface";
import { Weather } from "@/weather/domain/entities/weather.entity";
import { WeatherCacheService } from "@/weather/application/services/weather-cache.service";

describe("WeatherCacheService", () => {
  let service: WeatherCacheService;
  let repo: jest.Mocked<IWeatherRepository>;
  const TTL = 3600_000;

  beforeEach(() => {
    repo = {
      findByCity: jest.fn(),
      save: jest.fn(),
    } as any;
    service = new WeatherCacheService(repo);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  describe("getCached", () => {
    it("returns null if no cached entry", async () => {
      repo.findByCity.mockResolvedValue(null);
      const result = await service.getCached("Kyiv");
      expect(repo.findByCity).toHaveBeenCalledWith("Kyiv");
      expect(result).toBeNull();
    });

    it("returns weather if cached and fresh", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      const weather: Weather = {
        id: "1",
        city: "Kyiv",
        temperature: 20,
        humidity: 50,
        description: "Clear",
        fetchedAt: new Date(now - TTL / 2),
        createdAt: new Date(),
      } as any;

      repo.findByCity.mockResolvedValue(weather);
      const result = await service.getCached("Kyiv");

      expect(repo.findByCity).toHaveBeenCalledWith("Kyiv");
      expect(result).toBe(weather);
    });

    it("returns null if cached but expired", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      const weather: Weather = {
        id: "2",
        city: "Kyiv",
        temperature: 15,
        humidity: 60,
        description: "Cloudy",
        fetchedAt: new Date(now - TTL - 1000),
        createdAt: new Date(),
      } as any;

      repo.findByCity.mockResolvedValue(weather);
      const result = await service.getCached("Kyiv");

      expect(repo.findByCity).toHaveBeenCalledWith("Kyiv");
      expect(result).toBeNull();
    });
  });

  describe("updateCache", () => {
    it("saves weather to repository", async () => {
      const weather: Weather = {
        id: "3",
        city: "Lviv",
        temperature: 10,
        humidity: 40,
        description: "Rainy",
        fetchedAt: new Date(),
        createdAt: new Date(),
      } as any;

      await service.updateCache(weather);
      expect(repo.save).toHaveBeenCalledWith(weather);
    });
  });
});
