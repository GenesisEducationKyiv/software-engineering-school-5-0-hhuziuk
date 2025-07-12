import { NamedWeatherClient } from "./weather-api-client.interface";
import { Weather } from "../../domain/entities/weather.entity";
import logger from "../../../../shared/logger/logger";

export class WeatherLoggingProxy implements NamedWeatherClient {
  constructor(private readonly target: NamedWeatherClient) {}

  providerName(): string {
    return this.target.providerName();
  }

  async fetchCurrent(city: string): Promise<Weather> {
    logger.debug(`[WeatherLoggingProxy] Request: city=${city} via=${this.providerName()}`);

    try {
      const result = await this.target.fetchCurrent(city);
      logger.info(`${this.providerName()} - Response: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.stack || err.message : String(err);
      logger.error(
        `[WeatherLoggingProxy] Error: city=${city} via=${this.providerName()}\n${errorMsg}`,
      );
      throw err;
    }
  }
}
