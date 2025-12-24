import { RedisClientType } from 'redis';
export declare const getRedisClient: () => Promise<RedisClientType>;
export declare const cacheGet: <T>(key: string) => Promise<T | null>;
export declare const cacheSet: <T>(key: string, value: T, ttlSeconds?: number) => Promise<void>;
export declare const cacheDelete: (key: string) => Promise<void>;
export declare const cacheInvalidatePattern: (pattern: string) => Promise<void>;
export declare const getPhotosCacheVersion: () => Promise<number>;
export declare const bumpPhotosCacheVersion: () => Promise<void>;
export declare const CACHE_KEYS: {
    photo: (id: string) => string;
    photos: (version: number, page: number, limit: number) => string;
};
//# sourceMappingURL=redis.d.ts.map