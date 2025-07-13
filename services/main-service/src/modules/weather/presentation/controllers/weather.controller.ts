import { Controller, Get, Query } from "@nestjs/common";
import { WeatherService } from "../../application/services/weather.service";
import { GetWeatherDto } from "../../../subscription/application/dto/get-weather.dto";

@Controller()
export class WeatherController {
  constructor(private readonly service: WeatherService) {}

  @Get("weather")
  async getWeather(@Query() dto: GetWeatherDto) {
    const weather = await this.service.getCurrentWeather(dto.city);
    return {
      temperature: weather.temperature,
      humidity: weather.humidity,
      description: weather.description,
    };
  }
}
