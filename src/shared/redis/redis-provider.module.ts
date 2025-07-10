import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";
import { config } from "@/shared/configs/config";

export const REDIS_CLIENT = "REDIS_CLIENT";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          path: config.redis.socketPath,
          username: config.redis.username,
          password: config.redis.password,
          lazyConnect: true,
          maxRetriesPerRequest: null,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisProviderModule {}
