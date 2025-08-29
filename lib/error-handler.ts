/**
 * Represents the error structure returned by next-safe-action
 */
export interface SafeActionError {
  serverError?: string;
  validationErrors?: Record<string, string[]>;
  bindArgsValidationErrors?: unknown[];
  fetchError?: string;
  [key: string]: unknown;
}

/**
 * Represents the complete error response from useAction hook
 */
export interface ActionErrorResponse {
  error: SafeActionError;
  result?: unknown;
  data?: unknown;
}

/**
 * Extracts a user-friendly error message from a next-safe-action error response
 *
 * This function attempts to extract the most specific error message available,
 * falling back to more generic messages if specific ones aren't found
 */
export function extractActionErrorMessage(
  errorResponse: ActionErrorResponse,
  fallbackMessage: string = 'An error occurred'
): string {
  const { error } = errorResponse;

  if (!error) {
    return fallbackMessage;
  }

  // First, try to get the serverError (most common case)
  if (error.serverError && typeof error.serverError === 'string') {
    return error.serverError;
  }

  // Check if there's a validation error for the first field
  if (error.validationErrors && typeof error.validationErrors === 'object') {
    const validation = error.validationErrors as Record<string, unknown>;
    const keys = Object.keys(validation);

    const extractFromUnknown = (value: unknown): string | undefined => {
      if (!value) {
        return undefined;
      }
      if (typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value)) {
        for (const v of value) {
          const msg = extractFromUnknown(v);
          if (msg) {
            return msg;
          }
        }
        return undefined;
      }
      if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (Array.isArray(obj._errors) && obj._errors.length > 0) {
          const candidate = obj._errors.find((v) => typeof v === 'string');
          if (typeof candidate === 'string') {
            return candidate;
          }
        }
        for (const v of Object.values(obj)) {
          const msg = extractFromUnknown(v);
          if (msg) {
            return msg;
          }
        }
      }
      return undefined;
    };

    for (const key of keys) {
      const message = extractFromUnknown(validation[key]);
      if (message) {
        return message;
      }
    }
  }

  // Check for fetch errors
  if (error.fetchError && typeof error.fetchError === 'string') {
    return error.fetchError;
  }

  // If error itself is a string (legacy or custom error structure)
  if (typeof error === 'string') {
    return error;
  }

  // Check if there's a message property directly on the error
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  // Check other common error properties
  if (error.msg && typeof error.msg === 'string') {
    return error.msg;
  }

  // Last resort - try a generic message property if present when stringified
  try {
    const errorString = JSON.stringify(error);
    if (errorString && errorString !== '{}' && errorString !== 'null') {
      const messageMatch = errorString.match(/"message"\s*:\s*"([^"]+)"/i);
      if (messageMatch && messageMatch[1]) {
        return messageMatch[1];
      }
    }
  } catch {
    // Ignore JSON parsing errors
  }

  return fallbackMessage;
}

export function extractErrorMessage(
  error: SafeActionError | string | Error | unknown,
  fallbackMessage: string = 'An error occurred'
): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    // Try the ActionErrorResponse format first
    if ('error' in error) {
      return extractActionErrorMessage(
        error as ActionErrorResponse,
        fallbackMessage
      );
    }

    // Try SafeActionError format
    return extractActionErrorMessage(
      { error: error as SafeActionError },
      fallbackMessage
    );
  }

  return fallbackMessage;
}

/**
 * Hook helper for useAction onError callback
 *
 */
export function createErrorHandler(
  fallbackMessage: string = 'An error occurred'
) {
  return (errorResponse: ActionErrorResponse) => {
    return extractActionErrorMessage(errorResponse, fallbackMessage);
  };
}

/**
 * Type guard to check if an object is a SafeActionError
 */
export function isSafeActionError(error: unknown): error is SafeActionError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('serverError' in error ||
      'validationErrors' in error ||
      'bindArgsValidationErrors' in error ||
      'fetchError' in error)
  );
}
