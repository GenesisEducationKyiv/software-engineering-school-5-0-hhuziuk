import { Test, TestingModule } from "@nestjs/testing";
import { WeatherService } from "src/weather/application/services/weather.service";
import { HttpService } from "@nestjs/axios";
import { of } from "rxjs";
import { WeatherRepository } from "src/weather/infrastructure/repositories/weather.repository";
import { BadRequestException } from "@nestjs/common";
import { Weather } from "src/weather/domain/entities/weather.entity";
import { GetWeatherDto } from "src/subscription/application/dto/get-weather.dto";

describe("WeatherService", () => {
  let service: WeatherService;
  let httpService: HttpService;
  let repo: WeatherRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: HttpService, useValue: { get: jest.fn() } },
        { provide: WeatherRepository, useValue: { findByCity: jest.fn(), save: jest.fn() } },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    repo = module.get<WeatherRepository>(WeatherRepository);
  });

  describe("getCurrent", () => {
    it("should throw BadRequestException if city is empty", async () => {
      const dto: GetWeatherDto = { city: "" };
      await expect(service.getCurrent(dto)).rejects.toBeInstanceOf(BadRequestException);
    });

    it("should return cached weather if fresh", async () => {
      const now = new Date();
      const cached = new Weather("City", 20, 60, "Sunny", now);
      (repo.findByCity as jest.Mock).mockResolvedValue(cached);

      const dto: GetWeatherDto = { city: "City" };
      const result = await service.getCurrent(dto);

      expect(result).toBe(cached);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it("should fetch from API and save when no cache", async () => {
      (repo.findByCity as jest.Mock).mockResolvedValue(null);
      const apiResponse = {
        data: { current: { temp_c: 15, humidity: 70, condition: { text: "Cloudy" } } },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(apiResponse));

      const dto: GetWeatherDto = { city: "City" };
      const result = await service.getCurrent(dto);

      expect(httpService.get).toHaveBeenCalledWith(expect.stringContaining("City"));
      expect(repo.save).toHaveBeenCalledWith(expect.any(Weather));
      expect(result).toBeInstanceOf(Weather);
      expect(result.temperature).toBe(15);
      expect(result.humidity).toBe(70);
      expect(result.description).toBe("Cloudy");
    });

    it("should fetch from API and save when cache stale", async () => {
      const stale = new Weather("City", 10, 50, "Rainy", new Date(Date.now() - 3600_000 - 1000));
      (repo.findByCity as jest.Mock).mockResolvedValue(stale);
      const apiResponse = {
        data: { current: { temp_c: 18, humidity: 55, condition: { text: "Windy" } } },
      };
      (httpService.get as jest.Mock).mockReturnValue(of(apiResponse));

      const dto: GetWeatherDto = { city: "City" };
      const result = await service.getCurrent(dto);

      expect(httpService.get).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.temperature).toBe(18);
      expect(result.description).toBe("Windy");
    });
  });
});
