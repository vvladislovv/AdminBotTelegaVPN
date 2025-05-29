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

    constructor(private configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        try {
            const url = this.configService.get<string>('RABBITMQ_URL');
            if (!url) {
                throw new Error('RABBITMQ_URL is not defined');
            }
            this.connection = await connect(url);
            if (!this.connection) {
                throw new Error('Failed to connect to RabbitMQ');
            }
            this.channel = await this.connection.createChannel();
            if (!this.channel) {
                throw new Error('Failed to create channel');
            }
            await this.channel.assertQueue('bot_commands', { durable: true });
        } catch (error) {
            console.error('Failed to initialize RabbitMQ:', error);
            throw error;
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
        } catch (error) {
            console.error('Failed to close RabbitMQ connection:', error);
        }
    }

    publishMessage(queue: string, message: RabbitMQMessage): void {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not initialized');
        }

        try {
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
        } catch (error) {
            console.error('Failed to publish message:', error);
            throw error;
        }
    }

    async consumeMessages(
        queue: string,
        callback: (message: RabbitMQMessage) => Promise<void>,
    ): Promise<void> {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not initialized');
        }

        try {
            await this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString()) as RabbitMQMessage;
                        await callback(content);
                        this.channel?.ack(msg);
                    } catch (error) {
                        console.error('Error processing message:', error);
                        this.channel?.nack(msg, false, false);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to consume messages:', error);
            throw error;
        }
    }
}
