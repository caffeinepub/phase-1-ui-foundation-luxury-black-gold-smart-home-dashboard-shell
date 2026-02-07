/**
 * Utility to sanitize backend errors into user-friendly English messages
 * and detect canister-stopped/unavailable patterns without exposing raw request/CBOR dumps.
 */

interface SanitizedError {
  message: string;
  isCanisterUnavailable: boolean;
  canRetry: boolean;
}

/**
 * Sanitizes backend errors into user-friendly messages
 * Detects canister-stopped/unavailable scenarios (IC0508, reject code 5)
 */
export function sanitizeBackendError(error: unknown): SanitizedError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // Check for canister stopped/unavailable patterns
  const isCanisterStopped = 
    errorString.includes('ic0508') ||
    errorString.includes('canister is stopped') ||
    errorString.includes('reject code: 5') ||
    errorString.includes('does not have a callcontextmanager');

  const isNetworkError = 
    errorString.includes('network') ||
    errorString.includes('fetch') ||
    errorString.includes('connection') ||
    errorString.includes('timeout');

  if (isCanisterStopped) {
    return {
      message: 'The backend service is currently unavailable. This may be temporary. Please try again in a moment or reload the page.',
      isCanisterUnavailable: true,
      canRetry: true,
    };
  }

  if (isNetworkError) {
    return {
      message: 'Unable to connect to the backend. Please check your internet connection and try again.',
      isCanisterUnavailable: false,
      canRetry: true,
    };
  }

  // Generic error - don't expose raw technical details
  return {
    message: 'An unexpected error occurred while loading data. Please try again.',
    isCanisterUnavailable: false,
    canRetry: true,
  };
}
