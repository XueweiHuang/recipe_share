/**
 * AUTH VALIDATION SCHEMA TESTS
 * 
 * Tests for authentication form validation schemas
 * Covers: email, password, username validation rules
 * 
 * Related Testing TODO:
 * - Phase 1 > Unit Tests > Auth Form Validation
 */

import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
  loginSchema,
  signupSchema,
} from '../auth-schema'

describe('Email Validation', () => {
  it('should accept valid email addresses', () => {
    const validEmails = [
      'user@example.com',
      'test.user@example.co.uk',
      'user+tag@example.com',
    ]

    validEmails.forEach((email) => {
      expect(() => emailSchema.parse(email)).not.toThrow()
    })
  })

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
    ]

    invalidEmails.forEach((email) => {
      expect(() => emailSchema.parse(email)).toThrow('Invalid email format')
    })
  })
})

describe('Password Validation', () => {
  it('should accept passwords with 6+ characters', () => {
    const validPasswords = ['123456', 'password123', 'securePass!@#']

    validPasswords.forEach((password) => {
      expect(() => passwordSchema.parse(password)).not.toThrow()
    })
  })

  it('should reject passwords shorter than 6 characters', () => {
    const shortPasswords = ['12345', 'pass', 'ab']

    shortPasswords.forEach((password) => {
      expect(() => passwordSchema.parse(password)).toThrow(
        'Password must be at least 6 characters'
      )
    })
  })

  it('should reject empty password', () => {
    expect(() => passwordSchema.parse('')).toThrow()
  })
})

describe('Username Validation', () => {
  it('should accept valid usernames', () => {
    const validUsernames = ['john_doe', 'user123', 'test_user_123']

    validUsernames.forEach((username) => {
      expect(() => usernameSchema.parse(username)).not.toThrow()
    })
  })

  it('should reject usernames shorter than 3 characters', () => {
    expect(() => usernameSchema.parse('ab')).toThrow(
      'Username must be at least 3 characters'
    )
  })

  it('should reject usernames longer than 20 characters', () => {
    const longUsername = 'a'.repeat(21)
    expect(() => usernameSchema.parse(longUsername)).toThrow(
      'Username must be at most 20 characters'
    )
  })

  it('should reject usernames with invalid characters', () => {
    const invalidUsernames = ['user-name', 'user name', 'user@name', 'user.name']

    invalidUsernames.forEach((username) => {
      expect(() => usernameSchema.parse(username)).toThrow(
        'Username can only contain letters, numbers, and underscores'
      )
    })
  })
})

describe('Login Form Schema', () => {
  it('should validate complete login form with valid data', () => {
    const validLogin = {
      email: 'user@example.com',
      password: 'password123',
    }

    expect(() => loginSchema.parse(validLogin)).not.toThrow()
  })

  it('should reject login form with missing email', () => {
    const incomplete = {
      password: 'password123',
    }

    expect(() => loginSchema.parse(incomplete)).toThrow()
  })

  it('should reject login form with missing password', () => {
    const incomplete = {
      email: 'user@example.com',
    }

    expect(() => loginSchema.parse(incomplete)).toThrow()
  })

  it('should reject login form with invalid email', () => {
    const invalidData = {
      email: 'notanemail',
      password: 'password123',
    }

    expect(() => loginSchema.parse(invalidData)).toThrow()
  })

  it('should reject login form with short password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '12345',
    }

    expect(() => loginSchema.parse(invalidData)).toThrow()
  })
})

describe('Signup Form Schema', () => {
  it('should validate complete signup form with valid data', () => {
    const validSignup = {
      email: 'user@example.com',
      password: 'password123',
      username: 'john_doe',
      fullName: 'John Doe',
    }

    expect(() => signupSchema.parse(validSignup)).not.toThrow()
  })

  it('should allow signup without fullName (optional field)', () => {
    const validSignup = {
      email: 'user@example.com',
      password: 'password123',
      username: 'john_doe',
    }

    expect(() => signupSchema.parse(validSignup)).not.toThrow()
  })

  it('should reject signup with invalid username', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'password123',
      username: 'ab',
    }

    expect(() => signupSchema.parse(invalidData)).toThrow()
  })

  it('should reject signup with all invalid fields', () => {
    const invalidData = {
      email: 'notanemail',
      password: '123',
      username: 'x',
    }

    expect(() => signupSchema.parse(invalidData)).toThrow()
  })
})
