import bcrypt from "bcryptjs";

const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return "Password must be at least 8 characters long.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }

  return null;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
