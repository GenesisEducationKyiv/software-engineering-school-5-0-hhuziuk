import { Injectable, BadRequestException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { config } from "@/shared/configs/config";
import { Weather } from "@/weather/domain/entities/weather.entity";
import { WeatherHandler } from "@/weather/infrastructure/clients/weather-handler";

@Injectable()
export class OpenWeatherMapApiClient extends WeatherHandler {
  constructor(private readonly http: HttpService) {
    super();
  }

  public providerName(): string {
    return "openweathermap.org";
  }

  protected async handle(city: string): Promise<Weather | null> {
    if (!city) {
      throw new BadRequestException("City required");
    }

    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(city)}&appid=${config.openWeatherApiKey}`;

    const response = await firstValueFrom(this.http.get(url));
    const data = response.data;

    const tempC = parseFloat((data.main.temp - 273.15).toFixed(2));
    return new Weather(
      city,
      tempC,
      data.main.humidity,
      data.weather[0]?.description || "N/A",
      new Date(),
    );
  }
}
