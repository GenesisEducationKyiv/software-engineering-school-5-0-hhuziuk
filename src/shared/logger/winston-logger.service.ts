/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService } from "@nestjs/common";
import { Logger as Winston } from "winston";

export class WinstonLogger implements LoggerService {
  constructor(private readonly logger: Winston) {}

  private format(message: any, optionalParams: any[]): string {
    const normalize = (val: any): string => {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      if (typeof val === "object") {
        try {
          return JSON.stringify(val);
        } catch {
          return "[Unserializable Object]";
        }
      }
      return String(val);
    };

    return [normalize(message), ...optionalParams.map(normalize)].join(" ");
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(this.format(message, optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(this.format(message, optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(this.format(message, optionalParams));
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug(this.format(message, optionalParams));
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.verbose(this.format(message, optionalParams));
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
