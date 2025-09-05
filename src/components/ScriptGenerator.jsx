import React, { useState } from 'react'
import { FileText, Copy, Download, Wand2, Lock, Globe } from 'lucide-react'
import { generateScript } from '../services/openai'

const scenarios = [
  { id: 'traffic-stop', label: 'Traffic Stop' },
  { id: 'street-encounter', label: 'Street Encounter' },
  { id: 'home-visit', label: 'Police at Home' },
  { id: 'search-request', label: 'Search Request' },
  { id: 'arrest-situation', label: 'During Arrest' }
]

const ScriptGenerator = ({ state, language, isPremium, onPremiumRequired }) => {
  const [selectedScenario, setSelectedScenario] = useState('')
  const [generatedScript, setGeneratedScript] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [scriptCount, setScriptCount] = useState(
    parseInt(localStorage.getItem('scriptCount') || '0')
  )

  const maxFreeScripts = 3

  const handleGenerateScript = async () => {
    // Check premium limits
    if (!isPremium && scriptCount >= maxFreeScripts) {
      onPremiumRequired('unlimited-scripts')
      return
    }

    if (!selectedScenario) {
      alert('Please select a scenario first')
      return
    }

    setIsGenerating(true)
    try {
      const script = await generateScript(selectedScenario, state, selectedLanguage)
      setGeneratedScript(script)
      
      // Increment script count for free users
      if (!isPremium) {
        const newCount = scriptCount + 1
        setScriptCount(newCount)
        localStorage.setItem('scriptCount', newCount.toString())
      }
    } catch (error) {
      console.error('Script generation failed:', error)
      setGeneratedScript('Sorry, we couldn\'t generate a script right now. Please try again later.')
    }
    setIsGenerating(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript)
    alert('Script copied to clipboard!')
  }

  const downloadScript = () => {
    const blob = new Blob([generatedScript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedScenario}-script.txt`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Defense Scripts
        </h2>
        <p className="text-gray-600">
          AI-generated scripts for common police encounter scenarios
        </p>
      </div>

      {/* Script Counter for Free Users */}
      {!isPremium && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Free Account:</strong> {scriptCount}/{maxFreeScripts} scripts used
              </p>
            </div>
            <button 
              onClick={() => onPremiumRequired('unlimited-scripts')}
              className="text-sm text-yellow-700 underline hover:text-yellow-900"
            >
              Upgrade for unlimited
            </button>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-primary mb-4">Configure Your Script</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Scenario Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scenario Type
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="input-field"
            >
              <option value="">Select a scenario...</option>
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
              {!isPremium && selectedLanguage !== 'en' && (
                <span className="ml-1 text-xs text-yellow-600">(Premium)</span>
              )}
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                if (!isPremium && e.target.value !== 'en') {
                  onPremiumRequired('multi-language')
                  return
                }
                setSelectedLanguage(e.target.value)
              }}
              className="input-field"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateScript}
          disabled={isGenerating || !selectedScenario || (!isPremium && scriptCount >= maxFreeScripts)}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Generate Script</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Script */}
      {generatedScript && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Your Script</h3>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center space-x-1 text-sm px-3 py-2"
              >
                <Copy size={16} />
                <span>Copy</span>
              </button>
              <button
                onClick={downloadScript}
                className="btn-secondary flex items-center space-x-1 text-sm px-3 py-2"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {generatedScript}
            </pre>
          </div>
          
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Remember:</strong> Speak calmly and clearly. Avoid sudden movements. 
              This script is a guide - adapt it to your specific situation.
            </p>
          </div>
        </div>
      )}

      {/* Premium Features Preview */}
      {!isPremium && (
        <div className="card border-dashed border-gray-300">
          <div className="text-center py-6">
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Premium Features</h3>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Unlimited script generation</li>
              <li>• Multi-language support (Spanish, more coming)</li>
              <li>• Custom scenario templates</li>
              <li>• Save and organize scripts</li>
            </ul>
            <button
              onClick={() => onPremiumRequired('unlimited-scripts')}
              className="btn-primary"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScriptGenerator