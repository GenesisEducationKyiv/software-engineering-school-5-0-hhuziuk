import { WEATHER_API_CLIENT } from "@/weather/infrastructure/clients/weather-api-client.interface";
import { HttpService } from "@nestjs/axios";
import { WeatherApiClient } from "@/weather/infrastructure/clients/weather-api-client";
import { OpenWeatherMapApiClient } from "@/weather/infrastructure/clients/openweather-api-client";
import { WeatherLoggingProxy } from "@/weather/infrastructure/clients/weather-logging-proxy";

export const WeatherApiClientProvider = {
  provide: WEATHER_API_CLIENT,
  useFactory: (http: HttpService) => {
    const primary = new OpenWeatherMapApiClient(http);
    const fallback = new WeatherApiClient(http);
    primary.setNext(fallback);

    return new WeatherLoggingProxy(primary);
  },
  inject: [HttpService],
};
