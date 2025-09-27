// API service for backend communication
const API_BASE_URL = 'http://165.227.205.3' // Your actual API URL

export class ApiService {
  static async searchPoems(query, poetFilters = []) {
    try {
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
        const verses = poem.text.split('\n').filter(line => line.trim() !== '')
        
        return {
          id: poem.id,
          poetId: poetNameToId[poem.poet] || poem.poet, // Map poet name to ID
          poetName: poem.poet,
          poemTitle: poem.title,
          verses: verses, // Split text into verses
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

  static getTestData() {
    // Return test data for debugging
    return [
      {
        id: 1,
        poetId: 1,
        poetName: 'حافظ',
        poemTitle: 'غزل شماره ۱',
        verses: [
          'ساقیا برخیز و درده جام را',
          'ساغرِ مِی بر گفَم نه تا ز بر',
          'گرچه بدنامی ست نزد عاقلان',
          'باده درده چند از این باد غرور',
          'دود آه سینه نالان من',
          'محرم راز دل شیدای خود',
          'با دلارامی مرا خاطر خوش است',
          'ننگرد دیگر به سرو اندر چمن',
          'صبر کن حافظ به سختی روز و شب'
        ],
        matchedVerse: 'ساقیا برخیز و درده جام را',
        url: '#',
        category: 'غزل'
      },
      {
        id: 2,
        poetId: 2,
        poetName: 'فردوسی',
        poemTitle: 'شاهنامه',
        verses: [
          'خاک بر سر کن غم ایام را',
          'برکشم این دلق ازرق فام را',
          'ما نمی خواهیم ننگ و نام را',
          'خاک بر سر، نفس نافرجام را',
          'سوخت این افسردگان خام را',
          'کس نمیبینم از خاص و عام را',
          'کز دلم یک باره برد آرام را',
          'هر که دید آن سرو سیم اندام را',
          'عاقبت روزی بیابی کام را'
        ],
        matchedVerse: 'خاک بر سر کن غم ایام را',
        url: '#',
        category: 'حماسی'
      }
    ]
  }

  static async getPoets() {
    try {
      const response = await fetch(`${API_BASE_URL}/poets`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const poetNames = await response.json()
      
      // Transform array of strings to objects with id and name
      return poetNames.map((name, index) => ({
        id: index + 1,
        name: name,
        poemCount: 0 // We don't have count data from this API
      }))
    } catch (error) {
      console.error('Poets API error:', error)
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
}