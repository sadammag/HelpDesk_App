import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private readonly client: SQSClient;
  private readonly queueUrl =
    'http://localhost:4566/000000000000/clear-cache-queue';

  constructor() {
    console.log('Инициализация конструктора ');
    this.client = new SQSClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566', //  LocalStack
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });
  }

  async sendMessage(body: string) {
    this.logger.log(`Sending message to SQS: ${body}`);

    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: body,
      }),
    );
  }

  async receiveMessages() {
    const response = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 5,
      }),
    );

    return response.Messages ?? [];
  }

  async deleteMessage(receiptHandle: string) {
    await this.client.send(
      new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      }),
    );
  }
}
