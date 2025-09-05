import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import StateSelection from './components/StateSelection'
import RightsCard from './components/RightsCard'
import ScriptGenerator from './components/ScriptGenerator'
import EnhancedRecordButton from './components/EnhancedRecordButton'
import ContactList from './components/ContactList'
import EnhancedSubscriptionModal from './components/EnhancedSubscriptionModal'
import { Shield, FileText, Mic, Users, Settings } from 'lucide-react'

function App() {
  const [currentTab, setCurrentTab] = useState('rights')
  const [selectedState, setSelectedState] = useState(null)
  const [user, setUser] = useState({
    subscriptionStatus: 'free', // 'free' or 'premium'
    preferredLanguage: 'en',
    savedContacts: []
  })
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pocketLawyerUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    const savedState = localStorage.getItem('pocketLawyerState')
    if (savedState) {
      setSelectedState(savedState)
    }
  }, [])

  // Save user data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pocketLawyerUser', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    if (selectedState) {
      localStorage.setItem('pocketLawyerState', selectedState)
    }
  }, [selectedState])

  const handleStateSelect = (state) => {
    setSelectedState(state)
    setCurrentTab('rights')
  }

  const handleSubscriptionUpgrade = () => {
    setUser(prev => ({ ...prev, subscriptionStatus: 'premium' }))
    setShowSubscriptionModal(false)
  }

  const requiresPremium = (feature) => {
    if (user.subscriptionStatus === 'premium') return false
    
    const premiumFeatures = ['unlimited-scripts', 'multi-language', 'advanced-recording']
    return premiumFeatures.includes(feature)
  }

  const showPremiumPrompt = (feature) => {
    setShowSubscriptionModal(true)
  }

  const renderTabContent = () => {
    if (!selectedState && currentTab !== 'contacts') {
      return <StateSelection onStateSelect={handleStateSelect} />
    }

    switch (currentTab) {
      case 'rights':
        return <RightsCard state={selectedState} />
      case 'scripts':
        return (
          <ScriptGenerator 
            state={selectedState}
            language={user.preferredLanguage}
            isPremium={user.subscriptionStatus === 'premium'}
            onPremiumRequired={showPremiumPrompt}
          />
        )
      case 'record':
        return (
          <EnhancedRecordButton 
            state={selectedState}
            isPremium={user.subscriptionStatus === 'premium'}
            onPremiumRequired={showPremiumPrompt}
            user={user}
          />
        )
      case 'contacts':
        return (
          <ContactList 
            contacts={user.savedContacts}
            onContactsUpdate={(contacts) => setUser(prev => ({ ...prev, savedContacts: contacts }))}
          />
        )
      default:
        return <RightsCard state={selectedState} />
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header 
        user={user}
        selectedState={selectedState}
        onStateChange={setSelectedState}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 sm:hidden">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentTab('rights')}
            className={`flex flex-col items-center p-2 ${currentTab === 'rights' ? 'text-accent' : 'text-gray-500'}`}
          >
            <Shield size={20} />
            <span className="text-xs mt-1">Rights</span>
          </button>
          <button
            onClick={() => setCurrentTab('scripts')}
            className={`flex flex-col items-center p-2 ${currentTab === 'scripts' ? 'text-accent' : 'text-gray-500'}`}
          >
            <FileText size={20} />
            <span className="text-xs mt-1">Scripts</span>
          </button>
          <button
            onClick={() => setCurrentTab('record')}
            className={`flex flex-col items-center p-2 ${currentTab === 'record' ? 'text-accent' : 'text-gray-500'}`}
          >
            <Mic size={20} />
            <span className="text-xs mt-1">Record</span>
          </button>
          <button
            onClick={() => setCurrentTab('contacts')}
            className={`flex flex-col items-center p-2 ${currentTab === 'contacts' ? 'text-accent' : 'text-gray-500'}`}
          >
            <Users size={20} />
            <span className="text-xs mt-1">Contacts</span>
          </button>
        </div>
      </nav>

      {/* Desktop Tab Navigation */}
      <div className="hidden sm:block fixed top-20 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentTab('rights')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentTab === 'rights' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Your Rights
            </button>
            <button
              onClick={() => setCurrentTab('scripts')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentTab === 'scripts' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Defense Scripts
            </button>
            <button
              onClick={() => setCurrentTab('record')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentTab === 'record' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Record & Document
            </button>
            <button
              onClick={() => setCurrentTab('contacts')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentTab === 'contacts' 
                  ? 'border-accent text-accent' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Emergency Contacts
            </button>
          </div>
        </div>
      </div>

      {/* Add padding for desktop navigation */}
      <div className="hidden sm:block h-16"></div>

      {showSubscriptionModal && (
        <EnhancedSubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onUpgrade={handleSubscriptionUpgrade}
        />
      )}
    </div>
  )
}

export default App
