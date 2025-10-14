// API service for backend communication
const API_BASE_URL = '/poems/api' // Using Vite proxy to avoid CORS issues

export class ApiService {
  static async searchPoems(query, poetFilters = []) {
    try {
      console.log('Searching for:', query, 'with poets:', poetFilters)
      
      // Build URL manually to ensure proper encoding
      let url = `${API_BASE_URL}/search?`
      
      // Add query parameter
      if (query) {
        url += `q=${encodeURIComponent(query)}`
      }
      
      // Add poet filter parameter
      if (poetFilters && poetFilters.length > 0) {
        const poetParam = poetFilters.join(',')
        url += `&poet=${encodeURIComponent(poetParam)}`
      }
      
      // Use maximum allowed limit (50) to get as many results as possible
      url += `&limit=50`
      
      console.log('Final URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        mode: 'cors'
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('API Response data:', data)
      
      // Check if API response has the expected structure
      if (!data || !data.poems) {
        console.error('Invalid API response structure:', data)
        throw new Error('Invalid API response structure')
      }
      
      if (data.poems.length === 0) {
        console.log('API returned empty poems array')
        return {
          results: [],
          totalResults: 0
        }
      }
      
      // Get available poets to map names to IDs
      const poets = await this.getPoets()
      const poetNameToId = {}
      poets.forEach(poet => {
        poetNameToId[poet.name] = poet.id
      })
      
      // Transform the API response to match our expected format
      const transformedResults = data.poems.map(poem => {
        console.log('Raw poem text:', poem.text)
        
        // Couplets are separated by actual newline characters (\n)
        // Within each couplet, hemistichs are separated by 4 spaces
        const coupletsRaw = poem.text.split('\n').filter(line => line.trim() !== '')
        console.log('Couplets raw after split:', coupletsRaw)
        
        // Create array of couplets, where each couplet is an array of [hemistich1, hemistich2]
        const couplets = coupletsRaw.map(couplet => {
          // Split each couplet by 4 spaces to get the two hemistichs
          const hemistichs = couplet.split('    ').filter(h => h.trim() !== '')
          console.log('Hemistichs for couplet:', hemistichs)
          // Return as array of two hemistichs
          return hemistichs.length === 2 ? hemistichs : [hemistichs[0] || '', '']
        })
        
        console.log('Final couplets:', couplets)
        
        return {
          id: poem.id,
          poetId: poetNameToId[poem.poet] || poem.poet, // Map poet name to ID
          poetName: poem.poet,
          poemTitle: poem.title,
          couplets: couplets, // Array of couplet pairs
          matchedVerse: poem.text,
          url: poem.url,
          category: poem.category || 'عمومی'
        }
      })
      
      console.log('Transformed results:', transformedResults.length, 'results')
      console.log('Total results from API:', data.total_results)
      
      const returnValue = {
        results: transformedResults,
        totalResults: data.total_results || transformedResults.length
      }
      
      console.log('API Service returning:', returnValue)
      
      return returnValue
    } catch (error) {
      console.error('Search API error:', error)
      console.error('Error details:', error.message)
      throw error
    }
  }


  static async getPoets() {
    try {
      console.log('API: Fetching poets from:', `${API_BASE_URL}/poets`)
      const response = await fetch(`${API_BASE_URL}/poets`)
      
      console.log('API: Poets response status:', response.status)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const poetNames = await response.json()
      console.log('API: Received poet names:', poetNames)
      console.log('API: Number of poets:', poetNames.length)
      
      // Transform array of strings to objects with id and name
      const transformedPoets = poetNames.map((name, index) => ({
        id: index + 1,
        name: name,
        poemCount: 0 // We don't have count data from this API
      }))
      
      console.log('API: Transformed poets:', transformedPoets.slice(0, 5)) // Show first 5
      return transformedPoets
    } catch (error) {
      console.error('Poets API error:', error)
      console.error('Error details:', error.message)
      throw error
    }
  }

  static async getPoetDetails(poetId) {
    try {
      const response = await fetch(`${API_BASE_URL}/poets/${poetId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Poet details API error:', error)
      throw error
    }
  }

  static async getFullPoem(poemId) {
    try {
      console.log('API: Fetching full poem:', poemId)
      const response = await fetch(`${API_BASE_URL}/poem/${poemId}`)
      
      console.log('API: Full poem response status:', response.status)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const poemData = await response.json()
      console.log('API: Received full poem data:', poemData)
      
      // Parse the full poem text into couplets
      if (poemData.text) {
        const coupletsRaw = poemData.text.split('\n').filter(line => line.trim() !== '')
        
        const couplets = coupletsRaw.map(couplet => {
          const hemistichs = couplet.split('    ').filter(h => h.trim() !== '')
          return hemistichs.length === 2 ? hemistichs : [hemistichs[0] || '', '']
        })
        
        poemData.couplets = couplets
      }
      
      return poemData
    } catch (error) {
      console.error('Full poem API error:', error)
      console.error('Error details:', error.message)
      throw error
    }
  }
}