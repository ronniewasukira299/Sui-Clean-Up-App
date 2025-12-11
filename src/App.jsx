import { useState } from 'react'
import CheckReputation from './components/CheckReputation'
import SubmitVote from './components/SubmitVote'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('check')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🔐 Sui Security Checker
          </h1>
          <p className="text-xl text-gray-300">
            Community-powered reputation system for Sui packages & NFTs
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('check')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'check'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'glass text-gray-300 hover:text-white'
            }`}
          >
            Check Reputation
          </button>
          <button
            onClick={() => setActiveTab('vote')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'vote'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'glass text-gray-300 hover:text-white'
            }`}
          >
            Submit Vote
          </button>
        </div>

        {/* Content */}
        <div className="glass p-8 shadow-2xl">
          {activeTab === 'check' && <CheckReputation />}
          {activeTab === 'vote' && <SubmitVote />}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>🌐 Powered by Sui Blockchain • Community Reputation Engine</p>
          <p className="mt-2">Backend: localhost:8080 | Frontend: localhost:3000</p>
        </div>
      </div>
    </div>
  )
}

export default App
