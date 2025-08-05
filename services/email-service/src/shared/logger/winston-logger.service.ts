/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerService } from "@nestjs/common";
import { Logger as Winston } from "winston";

export interface SamplingConfig {
  log: number;
  error: number;
  warn: number;
  debug: number;
  verbose: number;
}

export class WinstonLogger implements LoggerService {
  private readonly sampling: SamplingConfig;

  constructor(
    private readonly logger: Winston,
    samplingConfig?: Partial<SamplingConfig>,
  ) {
    this.sampling = {
      log: 0.2,
      error: 1.0,
      warn: 1.0,
      debug: 0.1,
      verbose: 0.05,
      ...samplingConfig,
    };
  }

  private shouldLog(level: keyof SamplingConfig): boolean {
    const rate = this.sampling[level] ?? 1.0;
    return Math.random() < rate;
  }

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
    if (this.shouldLog("log")) {
      this.logger.info(this.format(message, optionalParams));
    }
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(this.format(message, optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    if (this.shouldLog("warn")) {
      this.logger.warn(this.format(message, optionalParams));
    }
  }

  debug(message: any, ...optionalParams: any[]) {
    if (this.shouldLog("debug")) {
      this.logger.debug(this.format(message, optionalParams));
    }
  }

  verbose?(message: any, ...optionalParams: any[]) {
    if (this.shouldLog("verbose")) {
      this.logger.verbose(this.format(message, optionalParams));
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
