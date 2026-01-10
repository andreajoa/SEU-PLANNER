/**
 * API Status Component
 * Shows which API URL is working and connection status
 */

import { useEffect, useState } from 'react'
import { POSSIBLE_API_URLS } from '@/lib/api'
import axios from 'axios'

interface APIStatus {
  url: string
  status: 'testing' | 'working' | 'failed'
  responseTime?: number
}

export function APIStatus() {
  const [statuses, setStatuses] = useState<APIStatus[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    async function testAllAPIs() {
      const results: APIStatus[] = []

      for (const url of POSSIBLE_API_URLS) {
        const start = Date.now()
        try {
          await axios.get(`${url}/health`, { timeout: 3000 })
          results.push({
            url,
            status: 'working',
            responseTime: Date.now() - start
          })
        } catch {
          results.push({
            url,
            status: 'failed'
          })
        }
      }

      setStatuses(results)
    }

    testAllAPIs()
  }, [])

  const workingAPI = statuses.find(s => s.status === 'working')

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

      {workingAPI ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 mb-3">
          <p className="text-green-800 dark:text-green-200 font-semibold">
            ✅ API Found!
          </p>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1 break-all">
            {workingAPI.url}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Response time: {workingAPI.responseTime}ms
          </p>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-3">
          <p className="text-red-800 dark:text-red-200 font-semibold">
            ❌ No working API found!
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Check Render dashboard for your backend URL
          </p>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tested URLs:</p>
        {statuses.map((s, i) => (
          <div
            key={i}
            className={`text-xs p-2 rounded border ${
              s.status === 'working'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="break-all flex-1">{s.url}</span>
              <span className="ml-2 font-semibold">
                {s.status === 'working' ? '✅' : '❌'}
              </span>
            </div>
            {s.responseTime && (
              <p className="text-xs mt-1 opacity-75">{s.responseTime}ms</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 Open browser console (F12) to see detailed logs
        </p>
      </div>
    </div>
  )
}
