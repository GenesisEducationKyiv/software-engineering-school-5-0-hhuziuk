import { IWeatherApiClient } from "@/weather/infrastructure/clients/weather-api-client.interface";
import { Weather } from "@/weather/domain/entities/weather.entity";

export abstract class WeatherHandler implements IWeatherApiClient {
  protected nextHandler?: IWeatherApiClient;

  setNext(handler: IWeatherApiClient): IWeatherApiClient {
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

  protected logResponse(data: unknown): void {
    const payload = typeof data === "object" ? JSON.stringify(data) : String(data);
    console.info(`${this.providerName()} - Response: ${payload}`);
  }

  protected abstract providerName(): string;

  protected abstract handle(city: string): Promise<Weather | null>;
}
