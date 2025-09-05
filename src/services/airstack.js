import axios from 'axios'

class AirstackService {
  constructor() {
    this.apiKey = import.meta.env.VITE_AIRSTACK_API_KEY
    this.baseURL = 'https://api.airstack.xyz/graphql'
    
    // Create axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Execute GraphQL query
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @returns {Promise<Object>} - Query result
   */
  async executeQuery(query, variables = {}) {
    try {
      const response = await this.api.post('', {
        query,
        variables
      })

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message)
      }

      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Airstack query error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get state-specific legal rights information
   * @param {string} state - State name or abbreviation
   * @returns {Promise<Object>} - State rights data
   */
  async getStateRights(state) {
    // For demo purposes, we'll use mock data since Airstack doesn't have legal data
    // In a real implementation, this would query a legal database or knowledge graph
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const stateRightsData = this.getMockStateRights(state)
      
      return {
        success: true,
        data: stateRightsData
      }
    } catch (error) {
      console.error('Get state rights error:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.getMockStateRights(state) // Provide fallback data
      }
    }
  }

  /**
   * Get legal precedents for a specific state
   * @param {string} state - State name
   * @param {string} category - Legal category (e.g., 'recording', 'search', 'detention')
   * @returns {Promise<Object>} - Legal precedents
   */
  async getLegalPrecedents(state, category = 'recording') {
    try {
      // Mock implementation - in reality would query legal database
      const precedents = this.getMockLegalPrecedents(state, category)
      
      return {
        success: true,
        data: precedents
      }
    } catch (error) {
      console.error('Get legal precedents error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get legal aid organizations by state
   * @param {string} state - State name
   * @returns {Promise<Object>} - Legal aid organizations
   */
  async getLegalAidOrganizations(state) {
    try {
      const organizations = this.getMockLegalAidOrganizations(state)
      
      return {
        success: true,
        data: organizations
      }
    } catch (error) {
      console.error('Get legal aid organizations error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Mock state rights data (would be replaced with real API calls)
   * @param {string} state - State name
   * @returns {Object} - Mock state rights data
   */
  getMockStateRights(state) {
    const baseRights = {
      rightsSummary: [
        'You have the right to remain silent',
        'You have the right to refuse searches without a warrant',
        'You have the right to ask if you are free to leave',
        'You have the right to an attorney',
        'You have the right to record police interactions in public'
      ],
      doSay: [
        'I am exercising my right to remain silent',
        'Am I free to leave?',
        'I do not consent to any searches',
        'I would like to speak to an attorney',
        'I am recording this interaction for my safety'
      ],
      dontSay: [
        'Don\'t argue or become confrontational',
        'Don\'t provide false information',
        'Don\'t make sudden movements',
        'Don\'t consent to searches just to seem cooperative'
      ]
    }

    const stateSpecificData = {
      'California': {
        ...baseRights,
        specificNotes: 'California has strong protections for recording police in public spaces. The state also has specific laws regarding vehicle searches during traffic stops.',
        stopAndIdentify: false,
        recordingLegal: true,
        vehicleSearchRules: 'Officers need probable cause or consent to search your vehicle',
        additionalRights: [
          'Right to record in public spaces is explicitly protected',
          'Officers must inform you of the reason for the stop',
          'You can refuse field sobriety tests (with consequences)'
        ]
      },
      'Texas': {
        ...baseRights,
        rightsSummary: [
          ...baseRights.rightsSummary,
          'You may be required to provide ID during certain stops'
        ],
        specificNotes: 'Texas has "Stop and Identify" laws that may require you to provide identification in certain circumstances. However, you still have the right to remain silent beyond providing ID.',
        stopAndIdentify: true,
        recordingLegal: true,
        vehicleSearchRules: 'Officers can search your vehicle if they have probable cause or if you consent',
        additionalRights: [
          'Must provide ID if lawfully detained and asked',
          'Can record police interactions in public',
          'Right to refuse consent searches'
        ]
      },
      'New York': {
        ...baseRights,
        specificNotes: 'New York has strong protections for recording police interactions. The state also has specific rules about stop-and-frisk procedures.',
        stopAndIdentify: false,
        recordingLegal: true,
        vehicleSearchRules: 'Vehicle searches require probable cause, warrant, or consent',
        additionalRights: [
          'Strong recording rights in public spaces',
          'Stop-and-frisk requires reasonable suspicion',
          'Right to ask for officer identification'
        ]
      },
      'Florida': {
        ...baseRights,
        specificNotes: 'Florida allows recording of police in public. The state has specific laws about detention and search procedures.',
        stopAndIdentify: false,
        recordingLegal: true,
        vehicleSearchRules: 'Officers need probable cause or consent for vehicle searches',
        additionalRights: [
          'Can record police in public spaces',
          'Right to remain silent during traffic stops',
          'Officers must have reasonable suspicion for detention'
        ]
      }
    }

    return stateSpecificData[state] || {
      ...baseRights,
      specificNotes: `General constitutional rights apply in ${state}. Consult local legal resources for state-specific information.`,
      stopAndIdentify: false,
      recordingLegal: true,
      vehicleSearchRules: 'Federal constitutional protections apply',
      additionalRights: [
        'Constitutional rights are protected nationwide',
        'State-specific laws may provide additional protections'
      ]
    }
  }

  /**
   * Mock legal precedents data
   * @param {string} state - State name
   * @param {string} category - Legal category
   * @returns {Array} - Mock precedents
   */
  getMockLegalPrecedents(state, category) {
    const precedents = {
      recording: [
        {
          case: 'Glik v. Cunniffe (1st Cir. 2011)',
          summary: 'Established the right to record police officers in public',
          relevance: 'Protects recording rights in public spaces',
          jurisdiction: 'Federal (1st Circuit)'
        },
        {
          case: 'Turner v. Driver (5th Cir. 2017)',
          summary: 'Confirmed First Amendment right to record police',
          relevance: 'Strengthens recording protections',
          jurisdiction: 'Federal (5th Circuit)'
        }
      ],
      search: [
        {
          case: 'Terry v. Ohio (1968)',
          summary: 'Established stop-and-frisk doctrine requiring reasonable suspicion',
          relevance: 'Limits when police can detain and search',
          jurisdiction: 'U.S. Supreme Court'
        },
        {
          case: 'Rodriguez v. United States (2015)',
          summary: 'Traffic stops cannot be extended without reasonable suspicion',
          relevance: 'Limits duration of traffic stops',
          jurisdiction: 'U.S. Supreme Court'
        }
      ]
    }

    return precedents[category] || []
  }

  /**
   * Mock legal aid organizations data
   * @param {string} state - State name
   * @returns {Array} - Mock organizations
   */
  getMockLegalAidOrganizations(state) {
    const organizations = {
      'California': [
        {
          name: 'ACLU of California',
          phone: '(213) 977-9500',
          website: 'https://www.aclusocal.org',
          services: ['Civil rights', 'Police misconduct', 'Legal advocacy'],
          emergency: true
        },
        {
          name: 'Legal Aid Foundation of Los Angeles',
          phone: '(323) 801-7991',
          website: 'https://lafla.org',
          services: ['Free legal services', 'Civil rights'],
          emergency: false
        }
      ],
      'Texas': [
        {
          name: 'ACLU of Texas',
          phone: '(713) 942-8146',
          website: 'https://www.aclutx.org',
          services: ['Civil rights', 'Police accountability'],
          emergency: true
        },
        {
          name: 'Texas Legal Aid',
          phone: '(800) 369-9270',
          website: 'https://texaslegalaid.org',
          services: ['Free legal services', 'Civil rights'],
          emergency: false
        }
      ],
      'New York': [
        {
          name: 'NYCLU (New York Civil Liberties Union)',
          phone: '(212) 607-3300',
          website: 'https://www.nyclu.org',
          services: ['Civil rights', 'Police reform'],
          emergency: true
        },
        {
          name: 'Legal Aid Society',
          phone: '(212) 577-3300',
          website: 'https://legalaidnyc.org',
          services: ['Criminal defense', 'Civil rights'],
          emergency: true
        }
      ]
    }

    return organizations[state] || [
      {
        name: 'ACLU National',
        phone: '(212) 549-2500',
        website: 'https://www.aclu.org',
        services: ['Civil rights', 'Legal advocacy'],
        emergency: true
      },
      {
        name: 'National Legal Aid & Defender Association',
        phone: '(202) 452-0620',
        website: 'https://www.nlada.org',
        services: ['Legal aid directory', 'Referrals'],
        emergency: false
      }
    ]
  }

  /**
   * Test Airstack connection
   * @returns {Promise<boolean>} - Connection status
   */
  async testConnection() {
    try {
      // Simple test query - in real implementation would use actual Airstack schema
      const testQuery = `
        query TestConnection {
          __schema {
            types {
              name
            }
          }
        }
      `
      
      const result = await this.executeQuery(testQuery)
      return result.success
    } catch (error) {
      console.error('Airstack connection test failed:', error)
      return false
    }
  }

  /**
   * Check if Airstack is available
   * @returns {boolean} - Availability status
   */
  isAvailable() {
    return !!this.apiKey
  }
}

// Create singleton instance
const airstackService = new AirstackService()

export default airstackService
export { AirstackService }
