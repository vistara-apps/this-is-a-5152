import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || 'your-api-key-here',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

const scenarioPrompts = {
  'traffic-stop': 'Generate a calm, respectful script for a traffic stop situation',
  'street-encounter': 'Generate a script for a police encounter on the street',
  'home-visit': 'Generate a script for when police come to your home',
  'search-request': 'Generate a script for when police request to search you or your property',
  'arrest-situation': 'Generate a script for during an arrest situation'
}

export const generateScript = async (scenario, state, language = 'en') => {
  const basePrompt = scenarioPrompts[scenario] || scenarioPrompts['traffic-stop']
  
  const prompt = `${basePrompt} in ${state}. The script should be:
  - Calm and respectful in tone
  - Legally sound and appropriate for ${state} laws
  - Include specific phrases to assert constitutional rights
  - Include "what to say" and "what not to say" guidance
  - Be concise and memorable under stress
  - ${language === 'es' ? 'Written in Spanish' : 'Written in English'}
  
  Format the response as a clear, step-by-step script that someone could easily follow during a stressful situation.`

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a legal rights expert who creates calm, clear scripts for police encounters. Focus on constitutional rights and de-escalation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || 'Unable to generate script at this time.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // Fallback script for demo purposes
    return `SAMPLE SCRIPT FOR ${scenario.toUpperCase()} IN ${state}:

1. STAY CALM: Keep your hands visible and speak clearly.

2. ASSERT YOUR RIGHTS:
   "I am exercising my right to remain silent."
   "Am I free to leave?"
   "I do not consent to any searches."

3. DOCUMENT:
   If safe, announce: "I am recording this interaction for my safety."

4. DO NOT:
   - Argue or become confrontational
   - Reach for anything without announcing it
   - Provide false information
   - Consent to searches

5. REQUEST:
   "I would like to speak to an attorney."

Remember: Stay calm, be respectful, know your rights.

Note: This is a sample script. For full functionality, please add your OpenAI API key.`
  }
}