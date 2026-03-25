export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(phone.replace(/\s+/g, ''));
}

export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[A-Za-zА-Яа-яІіЇїЄє]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasLetter && hasDigit;
}
