import { Global, Module, DynamicModule } from "@nestjs/common";
import { WinstonLogger, SamplingConfig } from "./winston-logger.service";
import logger from "./logger";

@Global()
@Module({})
export class LoggerModule {
  static forRoot(samplingConfig?: Partial<SamplingConfig>): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: WinstonLogger,
          useValue: new WinstonLogger(logger, samplingConfig),
        },
      ],
      exports: [WinstonLogger],
    };
  }
}
