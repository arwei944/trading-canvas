import { describe, it, expect, beforeAll } from 'vitest';

// 测试后端工具函数
describe('Crypto Utils', () => {
  // 导入加密模块
  let encrypt: (text: string) => string;
  let decrypt: (encrypted: string) => string;

  beforeAll(async () => {
    // 设置测试环境变量
    process.env.ENCRYPTION_KEY = 'test-encryption-key-32bytes-long!!';
    const mod = await import('../utils/crypto.js');
    encrypt = mod.encrypt;
    decrypt = mod.decrypt;
  });

  it('should encrypt and decrypt text correctly', () => {
    const original = 'my-api-key-123';
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should produce different ciphertexts for same input', () => {
    const text = 'same-input';
    const encrypted1 = encrypt(text);
    const encrypted2 = encrypt(text);
    expect(encrypted1).not.toBe(encrypted2); // AES-GCM uses random IV
  });

  it('should handle empty string', () => {
    const encrypted = encrypt('');
    expect(decrypt(encrypted)).toBe('');
  });
});

describe('Response Helpers', () => {
  it('success should return correct format', async () => {
    const { success } = await import('../utils/response.js');
    const result = success({ id: 1, name: 'test' });
    expect(result).toEqual({ code: '0', msg: 'success', data: { id: 1, name: 'test' }, success: true });
  });

  it('fail should return correct format', async () => {
    const { fail } = await import('../utils/response.js');
    const result = fail('error message');
    expect(result).toEqual({ code: '-1', msg: 'error message', data: null, success: false });
  });
});
