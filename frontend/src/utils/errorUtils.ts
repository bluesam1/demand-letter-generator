/**
 * Utility functions for error handling
 */

interface ApiError {
  response?: {
    data?: {
      error?: string | { code?: string; message?: string; stack?: string };
      message?: string;
    };
  };
  message?: string;
}

/**
 * Extracts a user-friendly error message from various error formats
 * Handles both string errors and object errors from the API
 */
export function extractErrorMessage(err: unknown, defaultMessage: string): string {
  const error = err as ApiError;

  if (error.response?.data?.error) {
    const errorData = error.response.data.error;
    if (typeof errorData === 'string') {
      return errorData;
    }
    // Handle object error format: { code, message, stack }
    if (typeof errorData === 'object' && errorData.message) {
      return errorData.message;
    }
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return defaultMessage;
}
