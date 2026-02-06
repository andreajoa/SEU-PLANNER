/**
 * API Status Component
 * Shows API URL connection status
 */

import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/lib/api'
import axios from 'axios'

interface APIStatus {
  url: string
  status: 'testing' | 'working' | 'failed'
  responseTime?: number
}

export function APIStatus() {
  const [status, setStatus] = useState<APIStatus>({
    url: API_BASE_URL,
    status: 'testing'
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    async function testAPI() {
      const start = Date.now()
      try {
        await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 })
        setStatus({
          url: API_BASE_URL,
          status: 'working',
          responseTime: Date.now() - start
        })
      } catch {
        setStatus({
          url: API_BASE_URL,
          status: 'failed'
        })
      }
    }

    testAPI()
  }, [])

  if (!showDetails) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors text-sm z-50"
      >
        🔧 API Status
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 max-w-md z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">🔧 API Connection Status</h3>
        <button
          onClick={() => setShowDetails(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {status.status === 'testing' ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-3">
          <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
            ⏳ Testing API...
          </p>
        </div>
      ) : status.status === 'working' ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 mb-3">
          <p className="text-green-800 dark:text-green-200 font-semibold">
            ✅ API Connected!
          </p>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1 break-all">
            {status.url}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Response time: {status.responseTime}ms
          </p>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-3">
          <p className="text-red-800 dark:text-red-200 font-semibold">
            ❌ API Connection Failed!
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1 break-all">
            {status.url}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Check if backend is running
          </p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 Set VITE_API_URL environment variable if needed
        </p>
      </div>
    </div>
  )
}
