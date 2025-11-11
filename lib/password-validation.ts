export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export function validatePassword(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
}

export function isPasswordValid(requirements: PasswordRequirements): boolean {
  return Object.values(requirements).every(Boolean)
}
