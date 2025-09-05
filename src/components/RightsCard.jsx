import React, { useState } from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react'

// Mock state-specific rights data
const stateRightsData = {
  'California': {
    rightsSummary: [
      'You have the right to remain silent',
      'You have the right to refuse searches without a warrant',
      'You have the right to ask if you are free to leave',
      'You have the right to record police interactions in public',
      'You have the right to an attorney'
    ],
    doSay: [
      'I am exercising my right to remain silent',
      'Am I free to leave?',
      'I do not consent to any searches',
      'I would like to speak to an attorney'
    ],
    dontSay: [
      'Don\'t argue or resist, even if you believe the stop is unfair',
      'Don\'t provide false information',
      'Don\'t reach for anything without announcing it first',
      'Don\'t consent to searches just to seem cooperative'
    ],
    specificNotes: 'California law specifically protects your right to record police in public spaces.'
  },
  'Texas': {
    rightsSummary: [
      'You have the right to remain silent',
      'You have the right to refuse searches without a warrant',
      'You have the right to ask if you are free to leave',
      'You may be required to provide ID during certain stops',
      'You have the right to an attorney'
    ],
    doSay: [
      'I am exercising my right to remain silent',
      'Am I free to leave?',
      'I do not consent to any searches',
      'I would like to speak to an attorney'
    ],
    dontSay: [
      'Don\'t argue or become confrontational',
      'Don\'t provide false information',
      'Don\'t refuse to provide ID if legally required',
      'Don\'t make sudden movements'
    ],
    specificNotes: 'Texas has "Stop and Identify" laws that may require you to provide identification in certain circumstances.'
  },
  'New York': {
    rightsSummary: [
      'You have the right to remain silent',
      'You have the right to refuse searches without a warrant',
      'You have the right to ask if you are free to leave',
      'You have the right to record police interactions',
      'You have the right to an attorney'
    ],
    doSay: [
      'I am exercising my right to remain silent',
      'Am I free to leave?',
      'I do not consent to any searches',
      'I would like to speak to an attorney'
    ],
    dontSay: [
      'Don\'t become hostile or argumentative',
      'Don\'t provide false information',
      'Don\'t resist physical detention',
      'Don\'t consent to vehicle searches'
    ],
    specificNotes: 'New York has strong protections for recording police, but be aware of your surroundings.'
  }
}

const RightsCard = ({ state }) => {
  const [activeTab, setActiveTab] = useState('rights')
  
  const rights = stateRightsData[state] || stateRightsData['California'] // Fallback

  const tabs = [
    { id: 'rights', label: 'Your Rights', icon: Shield },
    { id: 'do', label: 'What to Say', icon: CheckCircle },
    { id: 'dont', label: 'What NOT to Say', icon: XCircle }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Your Rights in {state}
        </h2>
        <p className="text-gray-600">
          Know your protections during police encounters
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'rights' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
                <Shield size={20} className="text-accent" />
                <span>Your Constitutional Rights</span>
              </h3>
              <ul className="space-y-3">
                {rights.rightsSummary.map((right, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle size={16} className="text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{right}</span>
                  </li>
                ))}
              </ul>
              {rights.specificNotes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{rights.specificNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'do' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
                <CheckCircle size={20} className="text-green-500" />
                <span>Recommended Phrases</span>
              </h3>
              <p className="text-gray-600 text-sm">
                Use these calm, clear statements to assert your rights:
              </p>
              <ul className="space-y-3">
                {rights.doSay.map((phrase, index) => (
                  <li key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <span className="text-green-800 font-medium">"{phrase}"</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'dont' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary flex items-center space-x-2">
                <XCircle size={20} className="text-red-500" />
                <span>Important Don'ts</span>
              </h3>
              <p className="text-gray-600 text-sm">
                Avoid these actions and statements to protect yourself:
              </p>
              <ul className="space-y-3">
                {rights.dontSay.map((dont, index) => (
                  <li key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-red-800">{dont}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="btn-primary w-full flex items-center justify-center space-x-2">
          <FileText size={20} />
          <span>Generate Script</span>
        </button>
        <button className="btn-secondary w-full flex items-center justify-center space-x-2">
          <Shield size={20} />
          <span>Emergency Contacts</span>
        </button>
      </div>
    </div>
  )
}

export default RightsCard