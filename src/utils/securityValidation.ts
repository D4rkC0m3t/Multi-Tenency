// Security validation utilities
import DOMPurify from 'dompurify';

/**
 * Input validation utilities to prevent XSS and injection attacks
 */
export const validateInput = {
  /**
   * Validate transaction ID format
   */
  transactionId: (id: string): boolean => {
    if (!id || typeof id !== 'string') return false;
    return /^[a-zA-Z0-9-_]{1,50}$/.test(id);
  },

  /**
   * Validate amount
   */
  amount: (amount: number): boolean => {
    return typeof amount === 'number' && amount > 0 && amount < 10000000;
  },

  /**
   * Validate email format
   */
  email: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate phone number (Indian format)
   */
  phone: (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') return false;
    return /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''));
  },

  /**
   * Validate GST number
   */
  gst: (gst: string): boolean => {
    if (!gst || typeof gst !== 'string') return false;
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
  },

  /**
   * Validate file upload
   */
  file: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const allowedExtensions = ['jpg', 'jpeg', 'png'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG and PNG images are allowed' };
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: 'Invalid file extension' };
    }

    // Check if extension matches MIME type
    const mimeExtension = file.type.split('/')[1];
    if (extension !== mimeExtension && !(extension === 'jpg' && mimeExtension === 'jpeg')) {
      return { valid: false, error: 'File type mismatch detected' };
    }

    return { valid: true };
  },

  /**
   * Sanitize text input to prevent XSS
   */
  sanitizeText: (text: string): string => {
    if (!text || typeof text !== 'string') return '';
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  },

  /**
   * Sanitize HTML (for rich text if needed)
   */
  sanitizeHTML: (html: string): string => {
    if (!html || typeof html !== 'string') return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  },

  /**
   * Validate password strength
   */
  password: (password: string): { valid: boolean; error?: string } => {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }

    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { valid: false, error: 'Password must be at least 12 characters long' };
    }

    if (!hasUpperCase || !hasLowerCase) {
      return { valid: false, error: 'Password must contain both uppercase and lowercase letters' };
    }

    if (!hasNumbers) {
      return { valid: false, error: 'Password must contain at least one number' };
    }

    if (!hasSpecialChar) {
      return { valid: false, error: 'Password must contain at least one special character' };
    }

    // Check for common weak passwords
    const weakPasswords = ['password123!', 'Password123!', 'Admin123!@#'];
    if (weakPasswords.some(weak => password.toLowerCase().includes(weak.toLowerCase()))) {
      return { valid: false, error: 'Password is too common. Please choose a stronger password' };
    }

    return { valid: true };
  }
};

/**
 * Rate limiting utility (client-side)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if action is rate limited
   * @param key Unique identifier for the action
   * @param maxAttempts Maximum attempts allowed
   * @param windowMs Time window in milliseconds
   */
  isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Filter out old attempts outside the window
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      return true;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return false;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Session timeout manager
 */
export class SessionManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Start session timeout
   */
  start(onTimeout: () => void): void {
    this.reset(onTimeout);

    // Reset timer on user activity
    const resetTimer = () => this.reset(onTimeout);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
  }

  /**
   * Reset session timeout
   */
  private reset(onTimeout: () => void): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      onTimeout();
    }, this.TIMEOUT_DURATION);
  }

  /**
   * Stop session timeout
   */
  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

/**
 * CSRF token manager
 */
export class CSRFManager {
  private static TOKEN_KEY = 'csrf_token';

  /**
   * Generate new CSRF token
   */
  static generateToken(): string {
    const token = crypto.randomUUID();
    sessionStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }

  /**
   * Get current CSRF token
   */
  static getToken(): string | null {
    let token = sessionStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      token = this.generateToken();
    }
    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateToken(token: string): boolean {
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
    return storedToken === token;
  }

  /**
   * Clear CSRF token
   */
  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}

/**
 * Secure storage wrapper
 */
export const secureStorage = {
  /**
   * Set item with encryption (basic obfuscation)
   */
  setItem(key: string, value: string): void {
    const encoded = btoa(value);
    localStorage.setItem(key, encoded);
  },

  /**
   * Get item with decryption
   */
  getItem(key: string): string | null {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;
    try {
      return atob(encoded);
    } catch {
      return null;
    }
  },

  /**
   * Remove item
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
};
