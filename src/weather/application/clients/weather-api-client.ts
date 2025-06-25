import { Injectable, BadRequestException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { config } from "src/shared/configs/config";
import { IWeatherApiClient } from "src/weather/application/clients/weather-api-client.interface";
import { Weather } from "src/weather/domain/entities/weather.entity";

@Injectable()
export class WeatherApiClient implements IWeatherApiClient {
  constructor(private readonly http: HttpService) {}

  async fetchCurrent(city: string): Promise<Weather> {
    if (!city) throw new BadRequestException("City required");
    const url = `https://api.weatherapi.com/v1/current.json?key=${config.apiKey}&q=${city}`;
    const response = await firstValueFrom(this.http.get(url));
    const data = response.data.current;
    return new Weather(city, data.temp_c, data.humidity, data.condition.text, new Date());
  }
}
