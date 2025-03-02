import { createCipheriv, createDecipheriv, randomBytes, scrypt, Cipher, Decipher } from 'crypto';
import { promisify } from 'util';

// 加密级别配置
const ENCRYPTION_CONFIGS = {
  LEVEL1: {
    algorithm: 'aes-128-gcm',
    keyLength: 16,
    saltLength: 16,
    ivLength: 12
  },
  LEVEL2: {
    algorithm: 'aes-192-gcm',
    keyLength: 24,
    saltLength: 24,
    ivLength: 12
  },
  LEVEL3: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    saltLength: 32,
    ivLength: 12
  }
};

// 为GCM模式的Cipher和Decipher添加类型定义
interface CipherGCM extends Cipher {
  setAuthTagLength(length: number): this;
  getAuthTag(): Buffer;
  update(data: ArrayBufferView | string, inputEncoding?: BufferEncoding): Buffer;
  final(): Buffer;
}

interface DecipherGCM extends Decipher {
  setAuthTag(buffer: Buffer): this;
  update(data: ArrayBufferView | string, inputEncoding?: BufferEncoding): Buffer;
  final(): Buffer;
}

export type EncryptionLevel = 'NONE' | 'LEVEL1' | 'LEVEL2' | 'LEVEL3';

export interface EncryptedData {
  encrypted: string;  // Base64编码的加密数据
  iv: string;         // Base64编码的初始化向量
  salt: string;       // Base64编码的盐值
  authTag: string;    // Base64编码的认证标签
  level: EncryptionLevel;
}

export class MisakaEncryption {
  private static instance: MisakaEncryption;
  private networkSecret: string;

  private constructor() {
    // 网络密钥，实际应用中应从安全的配置或环境变量获取
    this.networkSecret = process.env.NETWORK_SECRET || 'misaka-network-secret';
  }

  public static getInstance(): MisakaEncryption {
    if (!MisakaEncryption.instance) {
      MisakaEncryption.instance = new MisakaEncryption();
    }
    return MisakaEncryption.instance;
  }

  /**
   * 加密消息
   * @param data 要加密的数据
   * @param level 加密级别
   * @returns 加密后的数据
   */
  public async encrypt(data: string, level: EncryptionLevel = 'LEVEL1'): Promise<EncryptedData> {
    if (level === 'NONE') {
      return {
        encrypted: Buffer.from(data).toString('base64'),
        iv: '',
        salt: '',
        authTag: '',
        level: 'NONE'
      };
    }

    const config = ENCRYPTION_CONFIGS[level];
    const salt = randomBytes(config.saltLength);
    const iv = randomBytes(config.ivLength);

    // 生成密钥
    const key = await promisify(scrypt)(this.networkSecret, salt, config.keyLength) as Buffer;

    // 创建加密器
    const cipher = createCipheriv(config.algorithm, key, iv) as unknown as CipherGCM;
    // 设置认证标签长度
    cipher.setAuthTagLength(16);

    // 加密数据
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8') as Buffer,
      cipher.final()
    ]);

    // 获取认证标签
    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      salt: salt.toString('base64'),
      authTag: authTag.toString('base64'),
      level
    };
  }

  /**
   * 解密消息
   * @param encryptedData 加密的数据
   * @returns 解密后的数据
   */
  public async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (encryptedData.level === 'NONE') {
      return Buffer.from(encryptedData.encrypted, 'base64').toString('utf8');
    }

    const config = ENCRYPTION_CONFIGS[encryptedData.level];

    // 解码加密数据组件
    const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const salt = Buffer.from(encryptedData.salt, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');

    // 重新生成密钥
    const key = await promisify(scrypt)(this.networkSecret, salt, config.keyLength) as Buffer;

    // 创建解密器
    const decipher = createDecipheriv(config.algorithm, key, iv) as unknown as DecipherGCM;
    // 设置认证标签
    decipher.setAuthTag(authTag);

    // 解密数据
    const decrypted = Buffer.concat([
      decipher.update(encrypted) as Buffer,
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * 生成安全的随机密钥
   * @param length 密钥长度
   * @returns Base64编码的随机密钥
   */
  public generateSecureKey(length: number = 32): string {
    return randomBytes(length).toString('base64');
  }
}