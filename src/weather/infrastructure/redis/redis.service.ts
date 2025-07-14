import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { IRedisService, REDIS_CLIENT } from "./redis-service.interface";

@Injectable()
export class RedisService implements IRedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.set(key, stringValue, "EX", ttlSeconds);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
}
