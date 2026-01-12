import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const RedisConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async () => {
    const store = await redisStore({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
      ttl: Number(500000) || 1000000, //  (5000 = 5 сек)
    });

    // --- Тестовое сохранение в Redis ---
    await store.client.set('test-2', 'hello my friend', { PX: 3000000 }); // TTL = 30 сек
    const val = await store.client.get('test-2');
    console.log('Direct Redis get:', val); // должно вывести "hello"
    // --------------------

    return {
      store: store as any,
    };
  },
};
