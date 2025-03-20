import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

import {
  CACHE_DEFAULT_TTL,
  CACHE_PREFIX,
  REDIS_CLIENT,
} from '../cache.constants';

/** Service for Redis cache */
@Injectable()
export class CacheService implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
  ) {}

  private readonly logger = new Logger(CacheService.name);

  /** Clean up Redis connection when module is destroyed */
  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  /** Generate key with cache prefix */
  getKey(key: string) {
    return `${CACHE_PREFIX}:${key}`;
  }

  /**
   * Get value from cache by key
   * @returns Parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.getKey(key);

    try {
      const data = await this.redisClient.get(cacheKey);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Error getting data from cache: ${error}`);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   * @param ttl Time to live in seconds
   */
  async set<T>(key: string, value: T, ttl = CACHE_DEFAULT_TTL): Promise<void> {
    const cacheKey = this.getKey(key);

    const serialized = JSON.stringify(value);

    try {
      await this.redisClient.set(cacheKey, serialized, 'EX', ttl);
    } catch (error) {
      this.logger.error(`Error setting data in cache: ${error}`);
    }
  }

  /** Delete key from cache */
  async del(key: string): Promise<void> {
    const cacheKey = this.getKey(key);

    try {
      await this.redisClient.del(cacheKey);
    } catch (error) {
      this.logger.error(`Error deleting data from cache: ${error}`);
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern Pattern to match (e.g. "prefix:*")
   * @returns Number of deleted keys
   */
  async delByPattern(pattern: string): Promise<number> {
    const cachePattern = this.getKey(pattern);

    try {
      const keys = await this.redisClient.keys(cachePattern);

      if (keys.length > 0) {
        return await this.redisClient.unlink(...keys);
      }

      return 0;
    } catch (error) {
      this.logger.error(`Error deleting data from cache: ${error}`);
      return 0;
    }
  }

  /** Clear entire Redis cache */
  async reset(): Promise<void> {
    await this.delByPattern('');
  }
}
