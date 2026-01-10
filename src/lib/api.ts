import axios from 'axios'

// Fallback URLs to try (in order)
const POSSIBLE_API_URLS = [
  'https://planner-api.onrender.com/api',
  'https://planner-backend.onrender.com/api',
  'https://seu-planner-api.onrender.com/api',
  'https://backend-seu-planner.onrender.com/api',
  'https://seu-planner-backend.onrender.com/api',
  'https://api-seu-planner.onrender.com/api',
  'http://localhost:5000/api'
]

let API_BASE_URL = import.meta.env.VITE_API_URL || POSSIBLE_API_URLS[0]

// Test if API is reachable
async function testAPIUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.get(`${url}/health`, { timeout: 5000 })
    return response.status === 200
  } catch {
    return false
  }
}

// Auto-detect working API URL
async function detectAPIUrl(): Promise<string> {
  console.log('🔍 Auto-detecting API URL...')

  // Try environment variable first
  if (import.meta.env.VITE_API_URL) {
    console.log(`   Testing VITE_API_URL: ${import.meta.env.VITE_API_URL}`)
    if (await testAPIUrl(import.meta.env.VITE_API_URL)) {
      console.log(`   ✅ Using: ${import.meta.env.VITE_API_URL}`)
      return import.meta.env.VITE_API_URL
    }
  }

  // Try all possible URLs
  for (const url of POSSIBLE_API_URLS) {
    console.log(`   Testing: ${url}`)
    if (await testAPIUrl(url)) {
      console.log(`   ✅ Found working API: ${url}`)
      return url
    }
  }

  console.log(`   ❌ No working API found, using default: ${POSSIBLE_API_URLS[0]}`)
  return POSSIBLE_API_URLS[0]
}

// Detect API URL on module load
detectAPIUrl().then(url => {
  API_BASE_URL = url
  console.log('🔧 Final API URL:', API_BASE_URL)
})

// Create axios instance with current API URL
function createAPI(baseURL: string) {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Handle 401 errors
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/auth'
      }
      return Promise.reject(error)
    }
  )

  return api
}

// Export a proxy that updates when API_BASE_URL changes
const apiHandler = {
  get(obj: any, prop: string) {
    if (prop === 'baseURL') return API_BASE_URL
    const apiInstance = createAPI(API_BASE_URL)
    return apiInstance[prop]
  }
}

export default new Proxy(createAPI(API_BASE_URL), apiHandler)
export { API_BASE_URL, POSSIBLE_API_URLS }
