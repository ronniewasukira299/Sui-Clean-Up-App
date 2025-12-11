import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function SubmitVote() {
  const [formData, setFormData] = useState({
    packageId: '',
    userAddress: '',
    voteType: 'legit'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setSuccess(false)

    try {
      const response = await axios.post(`${API_URL}/votes`, formData)
      setSuccess(true)
      setMessage(response.data.message || 'Vote submitted successfully!')
      setFormData({
        packageId: '',
        userAddress: '',
        voteType: 'legit'
      })

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
        setMessage('')
      }, 5000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to submit vote. Is the backend running?'
      setError(errorMsg)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Package ID
          </label>
          <input
            type="text"
            name="packageId"
            value={formData.packageId}
            onChange={handleChange}
            placeholder="0x1a2b3c4d5e6f7g8h9i0j..."
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">The NFT collection or smart contract address</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Wallet Address
          </label>
          <input
            type="text"
            name="userAddress"
            value={formData.userAddress}
            onChange={handleChange}
            placeholder="0x9j8i7h6g5f4e3d2c1b0a..."
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Your Sui wallet address</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Vote
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center p-3 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <input
                type="radio"
                name="voteType"
                value="legit"
                checked={formData.voteType === 'legit'}
                onChange={handleChange}
                className="mr-3 w-4 h-4 accent-green-500"
              />
              <span className="text-white font-medium">✓ Legitimate</span>
            </label>
            <label className="flex items-center p-3 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
              <input
                type="radio"
                name="voteType"
                value="scam"
                checked={formData.voteType === 'scam'}
                onChange={handleChange}
                className="mr-3 w-4 h-4 accent-red-500"
              />
              <span className="text-white font-medium">⚠ Scam</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Vote'}
        </button>
      </form>

      {success && message && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 fade-in">
          <p className="font-semibold">✓ Success</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 fade-in">
          <p className="font-semibold">✗ Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
        <p className="font-semibold mb-2">ℹ️ How it works:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Each user can vote once per package</li>
          <li>Community votes are aggregated into a reputation score</li>
          <li>Scores update in real-time as votes come in</li>
          <li>Your vote helps protect the community!</li>
        </ul>
      </div>
    </div>
  )
}

export default SubmitVote
