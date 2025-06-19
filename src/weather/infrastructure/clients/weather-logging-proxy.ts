import { IWeatherApiClient } from "@/weather/infrastructure/clients/weather-api-client.interface";
import { Weather } from "@/weather/domain/entities/weather.entity";
import logger from "@/shared/logger/logger";

export class WeatherLoggingProxy implements IWeatherApiClient {
  constructor(private readonly target: IWeatherApiClient) {}

  async fetchCurrent(city: string): Promise<Weather> {
    logger.debug(`[WeatherLoggingProxy] Request for city: ${city}`);
    try {
      const result = await this.target.fetchCurrent(city);
      logger.debug(`[WeatherLoggingProxy] Success response for ${city}: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.stack || err.message : String(err);
      logger.error(`[WeatherLoggingProxy] Error fetching weather for ${city}:\n${errorMsg}`);
      throw err;
    }
  }
}
