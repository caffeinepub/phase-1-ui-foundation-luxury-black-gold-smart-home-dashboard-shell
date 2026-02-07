/**
 * Wraps a promise with a timeout that rejects if the promise doesn't resolve within the specified time.
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds (default: 10000ms = 10s)
 * @param errorMessage Custom error message for timeout
 * @returns Promise that rejects with timeout error if not resolved in time
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Request timed out. Please try again.'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
