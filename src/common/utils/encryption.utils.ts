import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export class EncryptionUtils {
    private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // 32 bytes (256 bits)
    private static readonly ENCRYPTION_IV = process.env.ENCRYPTION_IV || ''; // 16 bytes (128 bits)

    static encrypt(text: string): string {
        if (!EncryptionUtils.ENCRYPTION_KEY || !EncryptionUtils.ENCRYPTION_IV) {
            throw new Error('Encryption key or IV not set in environment variables.');
        }
        const iv = Buffer.from(EncryptionUtils.ENCRYPTION_IV, 'hex').slice(0, IV_LENGTH);
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            Buffer.from(EncryptionUtils.ENCRYPTION_KEY, 'hex'),
            iv,
        );
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    static decrypt(encryptedText: string): string {
        if (!EncryptionUtils.ENCRYPTION_KEY || !EncryptionUtils.ENCRYPTION_IV) {
            throw new Error('Encryption key or IV not set in environment variables.');
        }
        const iv = Buffer.from(EncryptionUtils.ENCRYPTION_IV, 'hex').slice(0, IV_LENGTH);
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(EncryptionUtils.ENCRYPTION_KEY, 'hex'),
            iv,
        );
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
} 