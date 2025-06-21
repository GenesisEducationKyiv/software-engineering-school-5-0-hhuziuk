import { NamedWeatherClient } from "./weather-api-client.interface";
import { Weather } from "@/weather/domain/entities/weather.entity";

export abstract class WeatherHandler implements NamedWeatherClient {
  protected nextHandler?: NamedWeatherClient;

  setNext(handler: NamedWeatherClient): NamedWeatherClient {
    this.nextHandler = handler;
    return handler;
  }

  async fetchCurrent(city: string): Promise<Weather> {
    try {
      const result = await this.handle(city);
      if (result) return result;
      if (this.nextHandler) return this.nextHandler.fetchCurrent(city);
      throw new Error("No data");
    } catch (err) {
      if (this.nextHandler) {
        return this.nextHandler.fetchCurrent(city);
      }
      throw err;
    }
  }

  public abstract providerName(): string;
  protected abstract handle(city: string): Promise<Weather | null>;
}
