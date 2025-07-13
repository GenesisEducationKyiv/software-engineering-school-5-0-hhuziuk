import { Injectable, BadRequestException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { config } from "../../../../shared/configs/config";
import { Weather } from "../../domain/entities/weather.entity";
import { WeatherHandler } from "./weather-handler";

@Injectable()
export class WeatherApiClient extends WeatherHandler {
  constructor(private readonly http: HttpService) {
    super();
  }

  public providerName(): string {
    return "weatherapi.com";
  }

  protected async handle(city: string): Promise<Weather | null> {
    if (!city) {
      throw new BadRequestException("City required");
    }

    const url =
      `https://api.weatherapi.com/v1/current.json` +
      `?key=${config.weatherApiKey}&q=${encodeURIComponent(city)}`;

    const response = await firstValueFrom(this.http.get(url));
    const data = response.data.current;

    return new Weather(city, data.temp_c, data.humidity, data.condition.text, new Date());
  }
}
