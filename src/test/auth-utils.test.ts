import { describe, expect, it } from 'vitest';
import { isStrongPassword, isValidEmail, isValidPhone } from '@/lib/auth-utils';

describe('Auth validation utils', () => {
  it('validates email and phone formats', () => {
    expect(isValidEmail('reader@example.com')).toBe(true);
    expect(isValidEmail('reader-example.com')).toBe(false);
    expect(isValidPhone('+380501234567')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });

  it('checks strong passwords', () => {
    expect(isStrongPassword('abc12345')).toBe(true);
    expect(isStrongPassword('abcdefgh')).toBe(false);
    expect(isStrongPassword('12345678')).toBe(false);
  });
});
