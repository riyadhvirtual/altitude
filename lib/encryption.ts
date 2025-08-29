import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

export function encrypt(text: string): string {
  try {
    const salt = generateSalt();
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = deriveKey(ENCRYPTION_KEY, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    if (tag.length !== TAG_LENGTH) {
      throw new Error('Invalid authentication tag length');
    }

    return [
      salt.toString('hex'),
      iv.toString('hex'),
      tag.toString('hex'),
      encrypted,
    ].join(':');
  } catch {
    throw new Error('Encryption failed');
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':');

    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    const [saltHex, ivHex, tagHex, encrypted] = parts;

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    if (
      salt.length !== SALT_LENGTH ||
      iv.length !== IV_LENGTH ||
      tag.length !== TAG_LENGTH
    ) {
      throw new Error('Invalid component lengths');
    }

    const key = deriveKey(ENCRYPTION_KEY, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    throw new Error('Decryption failed');
  }
}

export function compareEncrypted(
  encrypted1: string,
  encrypted2: string
): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(encrypted1, 'utf8'),
    Buffer.from(encrypted2, 'utf8')
  );
}

export function validateEncryptionKey(key: string): boolean {
  return key.length >= 32;
}

export function generateEncryptionKey(): string {
  const length = 64;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  if (!validateEncryptionKey(result)) {
    return generateEncryptionKey();
  }

  return result;
}
