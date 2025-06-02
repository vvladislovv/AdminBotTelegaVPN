import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private algorithm = 'aes-256-cbc';
    private key: Buffer;
    private ivLength = 16; // For aes-256-cbc

    constructor(private configService: ConfigService) {
        const encryptionKey = this.configService.get<string>('BOT_TOKEN_ENCRYPTION_KEY');
        if (!encryptionKey) {
            throw new Error('BOT_TOKEN_ENCRYPTION_KEY is not defined');
        }
        // Key must be 256 bits (32 bytes) for aes-256-cbc
        this.key = Buffer.from(encryptionKey, 'hex');
        if (this.key.length !== 32) {
            throw new Error('BOT_TOKEN_ENCRYPTION_KEY must be a 32-byte hex string');
        }
    }

    encrypt(text: string): string {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            let encrypted = cipher.update(text);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return iv.toString('hex') + ':' + encrypted.toString('hex');
        } catch (error) {
            throw new InternalServerErrorException('Failed to encrypt data');
        }
    }

    decrypt(text: string): string {
        try {
            const textParts = text.split(':');
            if (textParts.length !== 2) {
                throw new Error('Invalid encrypted text format');
            }
            const iv = Buffer.from(textParts[0], 'hex');
            const encryptedText = Buffer.from(textParts[1], 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (error) {
            throw new InternalServerErrorException('Failed to decrypt data');
        }
    }
}
