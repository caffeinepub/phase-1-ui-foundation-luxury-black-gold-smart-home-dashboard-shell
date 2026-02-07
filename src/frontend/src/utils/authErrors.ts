/**
 * Utility to classify backend authorization/provisioning errors
 * and return user-friendly English messages with recovery actions.
 */

export interface AuthErrorInfo {
  isAuthError: boolean;
  message: string;
  suggestRetryProvisioning: boolean;
}

/**
 * Analyzes an error and determines if it's authorization-related,
 * returning a user-friendly message and recommended action.
 */
export function classifyAuthError(error: unknown): AuthErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Check for various authorization error patterns
  const isUnauthorized = lowerMessage.includes('unauthorized');
  const isAdminRequired = lowerMessage.includes('must have admin role');
  const isUserRequired = lowerMessage.includes('must have user role');
  const isGuestError = lowerMessage.includes('guest');

  // If it's an authorization error, provide clear guidance
  if (isUnauthorized || isAdminRequired || isUserRequired || isGuestError) {
    let message = 'Your account setup is not complete yet.';
    
    if (isAdminRequired) {
      message = 'This action requires administrator privileges. Please contact your system administrator.';
    } else if (isUserRequired) {
      message = 'Your account setup is not complete. Please retry the setup process.';
    }

    return {
      isAuthError: true,
      message,
      suggestRetryProvisioning: !isAdminRequired, // Don't suggest retry for admin-only actions
    };
  }

  // Not an auth error
  return {
    isAuthError: false,
    message: errorMessage,
    suggestRetryProvisioning: false,
  };
}
