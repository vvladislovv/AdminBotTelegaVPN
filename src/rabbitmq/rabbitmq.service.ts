import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, connect, Connection, ConsumeMessage } from 'amqplib';

interface RabbitMQMessage {
    type: string;
    [key: string]: any;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private isEnabled = false;

    constructor(private configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        try {
            const url = this.configService.get<string>('RABBITMQ_URL');
            if (!url) {
                console.warn('RABBITMQ_URL is not defined, RabbitMQ will be disabled');
                this.isEnabled = false;
                return;
            }

            await this.connectWithRetry(url, 3, 2000);
            this.isEnabled = true;
        } catch (error: any) {
            console.warn(
                'RabbitMQ initialization failed, continuing without RabbitMQ:',
                error?.message || 'Unknown error',
            );
            this.isEnabled = false;
            // Don't throw error, just continue without RabbitMQ
        }
    }

    private async connectWithRetry(url: string, maxRetries: number, delay: number): Promise<void> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(
                    `Attempting to connect to RabbitMQ (attempt ${attempt}/${maxRetries})...`,
                );
                this.connection = await connect(url);

                if (!this.connection) {
                    throw new Error('Failed to connect to RabbitMQ');
                }

                this.channel = await this.connection.createChannel();
                if (!this.channel) {
                    throw new Error('Failed to create channel');
                }

                await this.channel.assertQueue('bot_commands', { durable: true });
                console.log('Successfully connected to RabbitMQ');
                return;
            } catch (error: any) {
                console.error(
                    `Failed to initialize RabbitMQ (attempt ${attempt}/${maxRetries}):`,
                    error?.message || 'Unknown error',
                );

                if (attempt === maxRetries) {
                    console.warn('Max retries reached. RabbitMQ will be disabled.');
                    return;
                }

                console.log(`Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    async onModuleDestroy(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
        } catch (error: any) {
            console.error(
                'Failed to close RabbitMQ connection:',
                error?.message || 'Unknown error',
            );
        }
    }

    isRabbitMQEnabled(): boolean {
        return this.isEnabled;
    }

    publishMessage(queue: string, message: RabbitMQMessage): void {
        if (!this.isEnabled || !this.channel) {
            console.debug('RabbitMQ is disabled or channel not available, message ignored:', {
                type: message.type,
            });
            return;
        }

        try {
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
            console.debug('Message published to RabbitMQ:', { type: message.type, queue });
        } catch (error: any) {
            console.error('Failed to publish message:', error?.message || 'Unknown error');
            // Don't throw error to prevent application crash
        }
    }

    async consumeMessages(
        queue: string,
        callback: (message: RabbitMQMessage) => Promise<void>,
    ): Promise<void> {
        if (!this.isEnabled || !this.channel) {
            console.warn('RabbitMQ is disabled or channel not available, cannot consume messages');
            return;
        }

        try {
            await this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString()) as RabbitMQMessage;
                        await callback(content);
                        this.channel?.ack(msg);
                    } catch (error: any) {
                        console.error(
                            'Error processing message:',
                            error?.message || 'Unknown error',
                        );
                        this.channel?.nack(msg, false, false);
                    }
                }
            });
        } catch (error: any) {
            console.error('Failed to consume messages:', error?.message || 'Unknown error');
            // Don't throw error to prevent application crash
        }
    }
}
