export const REDIS_CLIENT = Symbol("RedisClient");
export const REDIS_SERVICE_INTERFACE = Symbol("IRedisService");

export interface IRedisService {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
