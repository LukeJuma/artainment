/**
 * Type-safe environment variable utilities
 * Provides runtime validation and better error messages for missing environment variables
 */

export const env = {
  /**
   * Get the API base URL for the backend
   */
  get apiUrl(): string {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
      console.warn('VITE_API_URL not set, using development fallback');
      return 'http://localhost:8000/api';
    }
    return url;
  },

  /**
   * Get the app URL for the frontend
   */
  get appUrl(): string {
    const url = import.meta.env.VITE_APP_URL;
    if (!url) {
      console.warn('VITE_APP_URL not set, using development fallback');
      return 'http://localhost:3000';
    }
    return url;
  },

  /**
   * Get the Supabase URL (optional)
   */
  get supabaseUrl(): string | undefined {
    return import.meta.env.VITE_SUPABASE_URL;
  },

  /**
   * Check if we're in development mode
   */
  get isDevelopment(): boolean {
    return import.meta.env.DEV;
  },

  /**
   * Check if we're in production mode
   */
  get isProduction(): boolean {
    return import.meta.env.PROD;
  },

  /**
   * Validate that required environment variables are present
   * Call this during app initialization to catch missing variables early
   */
  validateRequired(): void {
    const required = ['VITE_API_URL'] as const;
    const missing = required.filter(key => !import.meta.env[key]);
    
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
      console.warn('Using development fallbacks. Set these in production.');
    }
  }
};

// Validate environment on module load in development
if (import.meta.env.DEV) {
  env.validateRequired();
}