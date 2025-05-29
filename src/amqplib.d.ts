declare module 'amqplib' {
    import { EventEmitter } from 'events';
    export interface Connection extends EventEmitter {
        createChannel(): Promise<Channel>;
        close(): Promise<void>;
    }
    export interface Channel extends EventEmitter {
        assertQueue(queue: string, options?: any): Promise<any>;
        sendToQueue(queue: string, content: Buffer, options?: any): boolean;
        consume(
            queue: string,
            onMessage: (msg: ConsumeMessage | null) => any,
            options?: any,
        ): Promise<any>;
        ack(message: ConsumeMessage): void;
        nack(message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean): void;
        close(): Promise<void>;
    }
    export interface ConsumeMessage {
        content: Buffer;
        fields: any;
        properties: any;
    }
    export function connect(url: string): Promise<Connection>;
}
