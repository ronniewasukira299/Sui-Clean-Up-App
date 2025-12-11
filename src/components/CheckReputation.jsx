import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function CheckReputation() {
  const [packageId, setPackageId] = useState('')
  const [reputation, setReputation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheck = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setReputation(null)

    try {
      const response = await axios.post(`${API_URL}/check-reputation`, {
        packageId
      })

      setReputation(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check reputation. Is the backend running on port 8080?')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LEGIT_VERIFIED':
      case 'LEGIT_OFFICIAL':
        return <span className="badge-legit">✓ LEGITIMATE</span>
      case 'LEGIT':
        return <span className="badge-legit">✓ LIKELY LEGIT</span>
      case 'SCAM_VERIFIED':
        return <span className="badge-scam">⚠ SCAM DETECTED</span>
      case 'DUBIOUS':
        return <span className="badge-scam">⚠ SUSPICIOUS</span>
      case 'UNKNOWN':
      default:
        return <span className="badge-unknown">❓ UNKNOWN</span>
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'LEGIT_VERIFIED':
      case 'LEGIT_OFFICIAL':
      case 'LEGIT':
        return 'text-green-400'
      case 'SCAM_VERIFIED':
      case 'DUBIOUS':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Package ID or NFT Collection Address
          </label>
          <input
            type="text"
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            placeholder="0x1a2b3c4d5e6f7g8h9i0j..."
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Check Reputation'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {reputation && (
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4 fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Results</h2>
            {getStatusBadge(reputation.status)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className={`text-lg font-semibold ${getStatusColor(reputation.status)}`}>
                {reputation.status.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Confidence</p>
              <p className="text-lg font-semibold text-blue-400">{reputation.confidence}%</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400">Package ID</p>
            <p className="text-sm font-mono text-gray-300 break-all">{reputation.packageId}</p>
          </div>

          <div>
            <p className="text-sm text-gray-400">Package Name</p>
            <p className="text-lg text-white font-semibold">{reputation.name}</p>
          </div>

          {reputation.scam_score !== undefined && (
            <div>
              <p className="text-sm text-gray-400">Community Score</p>
              <p className="text-lg text-purple-400 font-semibold">{reputation.scam_score}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CheckReputation
