import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SqsService } from '../sqs/sqs.service';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheCleanerService {
  private readonly logger = new Logger(CacheCleanerService.name);

  constructor(
    private readonly sqsService: SqsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Раз в 1 минуты отправляем сообщение
  @Cron('*/1 * * * *')
  async sendClearCacheMessage() {
    this.logger.log('Сообщение отправлено !');
    await this.sqsService.sendMessage('clear_cache');
  }

  // Каждую 2 минуты проверяем очередь
  @Cron('*/2 * * * *')
  async handleQueue() {
    this.logger.log('Пошел проверять очередь =>');
    const messages = await this.sqsService.receiveMessages();

    for (const msg of messages) {
      if (msg.Body === 'clear_cache') {
        this.logger.warn('Clearing Redis cache');

        const keys: string[] = await this.cacheManager.store.keys('*');
        await Promise.all(keys.map((key) => this.cacheManager.del(key)));

        this.logger.warn(`Кеш удален, keys removed: ${keys.length}`);
      }

      if (msg.ReceiptHandle) {
        await this.sqsService.deleteMessage(msg.ReceiptHandle);
      }
    }
  }
}
