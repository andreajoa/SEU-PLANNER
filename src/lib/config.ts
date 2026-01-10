/**
 * API Configuration
 * Automatically detects backend URL based on environment
 */

// Production URL from environment variable
const API_URL_FROM_ENV = import.meta.env.VITE_API_URL

// Fallback URLs to try (in order)
const FALLBACK_URLS = [
  'https://planner-api.onrender.com/api',
  'https://planner-backend.onrender.com/api',
  'https://seu-planner-api.onrender.com/api',
  'https://backend-seu-planner.onrender.com/api',
  'http://localhost:5000/api'
]

// Detect backend URL automatically
export const API_BASE_URL = API_URL_FROM_ENV || FALLBACK_URLS[0]

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:')
  console.log('   Environment URL:', API_URL_FROM_ENV || 'Not set')
  console.log('   Using URL:', API_BASE_URL)
  console.log('   Frontend URL:', window.location.origin)
}

// Export for use in api.ts
export default API_BASE_URL
