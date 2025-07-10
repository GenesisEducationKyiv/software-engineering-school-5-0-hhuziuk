import { Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisProviderModule } from "./redis-provider.module";

@Module({
  imports: [RedisProviderModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class CustomRedisModule {}
