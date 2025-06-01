import { Injectable, BadRequestException, forwardRef, Inject } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Weather } from "src/weather/domain/entities/weather.entity";
import { GetWeatherDto } from "src/subscription/application/dto/get-weather.dto";
import { config } from "src/shared/configs/config";
import { WeatherRepository } from "src/weather/infrastructure/repositories/weather.repository";

@Injectable()
export class WeatherService {
  constructor(
    private readonly http: HttpService,
    private readonly repo: WeatherRepository,
  ) {}

  async getCurrent(dto: GetWeatherDto): Promise<Weather> {
    if (!dto.city) throw new BadRequestException("City required");
    const cached = await this.repo.findByCity(dto.city);
    if (cached && Date.now() - cached.fetchedAt.getTime() < 3600_000) {
      return cached;
    }
    const url = `https://api.weatherapi.com/v1/current.json?key=${config.apiKey}&q=${dto.city}`;
    const response = await firstValueFrom(this.http.get(url));
    const data = response.data.current;
    const weather = new Weather(
      dto.city,
      data.temp_c,
      data.humidity,
      data.condition.text,
      new Date(),
    );
    await this.repo.save(weather);
    return weather;
  }
}
