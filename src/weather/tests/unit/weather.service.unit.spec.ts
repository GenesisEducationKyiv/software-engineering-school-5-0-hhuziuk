import { Test, TestingModule } from "@nestjs/testing";
import { WeatherService } from "@/weather/application/services/weather.service";
import { BadRequestException } from "@nestjs/common";
import { Weather } from "@/weather/domain/entities/weather.entity";
import { WeatherCacheService } from "@/weather/application/services/weather-cache.service";
import {
  IWeatherApiClient,
  WEATHER_API_CLIENT,
} from "@/weather/application/clients/weather-api-client.interface";
import {
  IWeatherRepository,
  WEATHER_REPOSITORY,
} from "@/weather/infrastructure/repositories/weather.repository.interface";

describe("WeatherService", () => {
  let service: WeatherService;
  let apiClientMock: IWeatherApiClient;
  let cacheServiceMock: WeatherCacheService;
  let repoMock: IWeatherRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: WEATHER_REPOSITORY,
          useValue: {
            findByCity: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: WEATHER_API_CLIENT,
          useValue: {
            fetchCurrent: jest.fn(),
          },
        },
        {
          provide: WeatherCacheService,
          useValue: {
            getCached: jest.fn(),
            updateCache: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    repoMock = module.get<IWeatherRepository>(WEATHER_REPOSITORY);
    apiClientMock = module.get<IWeatherApiClient>(WEATHER_API_CLIENT);
    cacheServiceMock = module.get<WeatherCacheService>(WeatherCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCurrent", () => {
    const city = "TestCity";

    it("should throw BadRequestException if city string is empty or whitespace", async () => {
      await expect(service.getCurrent("")).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.getCurrent("   ")).rejects.toBeInstanceOf(BadRequestException);
    });

    it("should return cached weather if WeatherCacheService.getCached provides it", async () => {
      const cachedWeather = new Weather(city, 20, 60, "Sunny", new Date());
      (cacheServiceMock.getCached as jest.Mock).mockResolvedValue(cachedWeather);

      const result = await service.getCurrent(city);

      expect(result).toBe(cachedWeather);
      expect(cacheServiceMock.getCached).toHaveBeenCalledWith(city);
      expect(apiClientMock.fetchCurrent).not.toHaveBeenCalled();
      expect(cacheServiceMock.updateCache).not.toHaveBeenCalled();
    });

    it("should fetch from API, update cache, and return weather if cacheService.getCached returns null", async () => {
      (cacheServiceMock.getCached as jest.Mock).mockResolvedValue(null);
      const freshWeatherFromApi = new Weather(city, 15, 70, "Cloudy", new Date());
      (apiClientMock.fetchCurrent as jest.Mock).mockResolvedValue(freshWeatherFromApi);

      const result = await service.getCurrent(city);

      expect(cacheServiceMock.getCached).toHaveBeenCalledWith(city);
      expect(apiClientMock.fetchCurrent).toHaveBeenCalledWith(city);
      expect(cacheServiceMock.updateCache).toHaveBeenCalledWith(freshWeatherFromApi);
      expect(result).toBe(freshWeatherFromApi);
      expect(result.temperature).toBe(15);
    });
  });
});
