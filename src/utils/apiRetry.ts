/**
 * Utility for retrying API calls with exponential backoff
 * Useful for handling cold starts and temporary network issues
 */

interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
}

export async function withRetry<T>(
  apiCall: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on certain errors
      if (
        error && 
        typeof error === 'object' && 
        'response' in error &&
        (error as any).response?.status < 500
      ) {
        throw error
      }

      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      )

      console.log(`API call failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Specialized retry for cold start scenarios
 * Uses longer delays and more attempts for the first load
 */
export async function withColdStartRetry<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  return withRetry(apiCall, {
    maxAttempts: 4,
    baseDelay: 2000,
    maxDelay: 20000,
    backoffFactor: 1.5
  })
}