import { Weather } from "@/weather/domain/entities/weather.entity";

export const WEATHER_API_CLIENT = "WEATHER_API_CLIENT";

export interface IWeatherApiClient {
  fetchCurrent(city: string): Promise<Weather>;
}

export interface NamedWeatherClient extends IWeatherApiClient {
  providerName(): string;
}
