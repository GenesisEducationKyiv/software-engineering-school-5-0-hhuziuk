import { Weather } from "../../domain/entities/weather.entity";

export const WEATHER_REPOSITORY = "WEATHER_REPOSITORY";

export interface IWeatherRepository {
  findByCity(city: string): Promise<Weather | null>;
  save(weather: Weather): Promise<void>;
}
