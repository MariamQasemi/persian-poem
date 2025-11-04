// API service for backend communication
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Production: use relative path
  : '/api'  // Development: use proxy, but we can also try direct
  
const BACKEND_URL = 'http://165.227.205.3' // Direct backend URL

// Helper function to get default headers with auth token
const getDefaultHeaders = () => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  
  // Add auth token from cookies if available
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1]
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// Enhanced error handling function
const handleApiError = async (response, operation = 'API request') => {
  console.error(`${operation} failed:`, {
    status: response.status,
    statusText: response.statusText,
    url: response.url
  })
  
  let errorData = {}
  let errorMessage = ''
  
  try {
    const responseText = await response.text()
    console.error('Raw response:', responseText)
    
    if (responseText) {
      try {
        errorData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Could not parse error response as JSON:', parseError)
        errorMessage = responseText
      }
    }
  } catch (textError) {
    console.error('Could not read response text:', textError)
    errorMessage = 'Unable to read error response'
  }
  
  // Handle specific HTTP status codes
  switch (response.status) {
    case 400:
      errorMessage = errorData.message || errorData.error || 'درخواست نامعتبر است'
      break
    case 401:
      errorMessage = 'احراز هویت نامعتبر است. لطفاً دوباره وارد شوید'
      break
    case 403:
      errorMessage = 'شما دسترسی لازم برای این عملیات را ندارید'
      break
    case 404:
      errorMessage = 'منبع مورد نظر یافت نشد'
      break
    case 422:
      // Validation errors
      if (errorData.errors) {
        const validationErrors = Object.values(errorData.errors).flat()
        errorMessage = `خطاهای اعتبارسنجی: ${validationErrors.join(', ')}`
      } else {
        errorMessage = errorData.message || 'داده‌های ارسالی نامعتبر است'
      }
      break
    case 429:
      errorMessage = 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید'
      break
    case 500:
      errorMessage = 'خطای سرور. لطفاً بعداً تلاش کنید'
      break
    case 502:
    case 503:
    case 504:
      errorMessage = 'سرور در دسترس نیست. لطفاً بعداً تلاش کنید'
      break
    default:
      errorMessage = errorData.message || errorData.error || `خطای HTTP: ${response.status}`
  }
  
  const error = new Error(errorMessage)
  error.status = response.status
  error.data = errorData
  throw error
}

export class ApiService {
  static async searchPoems(query, poetFilters = [], options = {}) {
    try {
      const { page = 1, limit = 50 } = options
      console.log('Searching for:', query, 'with poets:', poetFilters, 'page:', page, 'limit:', limit)
      
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
      
      // Add pagination parameters
      url += `&limit=${limit}&offset=${(page - 1) * limit}`
      
      console.log('Final URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
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
      
      // Check if API response has the expected structure (new format uses 'verses' instead of 'poems')
      if (!data || (!data.verses && !data.poems)) {
        console.error('Invalid API response structure:', data)
        throw new Error('Invalid API response structure')
      }
      
      // Handle new structure with 'verses' array
      const verses = data.verses || data.poems || []
      
      if (verses.length === 0) {
        console.log('API returned empty verses array')
        return {
          results: [],
          totalResults: 0,
          totalPages: 0,
          currentPage: page
        }
      }
      
      // Get available poets to map names to IDs
      const poets = await this.getPoets()
      const poetNameToId = {}
      poets.forEach(poet => {
        poetNameToId[poet.name] = poet.id
      })
      
      // Transform verses array to match our expected format
      const transformedResults = verses.map(verse => {
        // Check if this is the new structure (has context_verses)
        if (verse.context_verses && Array.isArray(verse.context_verses)) {
          // New structure: build couplets from context_verses
          // Sort context_verses by vorder to ensure correct order
          const sortedVerses = [...verse.context_verses].sort((a, b) => a.vorder - b.vorder)
          
          // Find the matching verse (is_match: true)
          const matchingVerse = sortedVerses.find(v => v.is_match === true)
          let filteredVerses
          if (!matchingVerse) {
            console.warn('No matching verse found in context_verses')
            // Fallback: use all verses
            filteredVerses = sortedVerses
          } else {
            const matchingIndex = sortedVerses.indexOf(matchingVerse)
            const matchingPosition = matchingVerse.position
            
            // Determine how many verses before and after based on position
            let versesBefore, versesAfter
            if (matchingPosition === 1) {
              // Position 1: 3 verses before + 2 verses after
              versesBefore = 3
              versesAfter = 2
            } else {
              // Position 0: 2 verses before + 3 verses after
              versesBefore = 2
              versesAfter = 3
            }
            
            // Calculate start and end indices
            const startIndex = Math.max(0, matchingIndex - versesBefore)
            const endIndex = Math.min(sortedVerses.length, matchingIndex + versesAfter + 1)
            
            // Filter verses based on position
            filteredVerses = sortedVerses.slice(startIndex, endIndex)
            
            console.log(`Matching verse at index ${matchingIndex}, position ${matchingPosition}`)
            console.log(`Showing ${startIndex} to ${endIndex} (${filteredVerses.length} verses)`)
          }
          
          // Group filtered verses by couplet
          const versesByCouplet = {}
          filteredVerses.forEach(contextVerse => {
            // Calculate couplet number: every two verses (vorder) form a couplet
            // vorder starts from 1, so couplet number is floor((vorder - 1) / 2)
            const coupletNumber = Math.floor((contextVerse.vorder - 1) / 2)
            
            if (!versesByCouplet[coupletNumber]) {
              versesByCouplet[coupletNumber] = ['', '']
            }
            
            // Set the text based on position (0 = first line, 1 = second line)
            if (contextVerse.position === 0) {
              versesByCouplet[coupletNumber][0] = contextVerse.text
            } else if (contextVerse.position === 1) {
              versesByCouplet[coupletNumber][1] = contextVerse.text
            }
          })
          
          // Convert to array and sort by couplet number
          const couplets = Object.keys(versesByCouplet)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(key => versesByCouplet[key])
          
          console.log('Transformed couplets from filtered context_verses:', couplets)
          
          return {
            id: verse.poem_id, // Use poem_id for navigation
            verseId: verse.id, // Keep original verse ID
            poetId: poetNameToId[verse.poet] || verse.poet,
            poetName: verse.poet,
            poemTitle: verse.poem_title,
            couplets: couplets,
            matchedVerse: verse.text,
            url: verse.url,
            category: verse.category || 'عمومی',
            vorder: verse.vorder,
            position: verse.position
          }
        } else {
          // Old structure: fallback for backwards compatibility
          console.log('Using old structure fallback')
          const coupletsRaw = (verse.text || '').split('\n').filter(line => line.trim() !== '')
          
          const couplets = coupletsRaw.map(couplet => {
            const hemistichs = couplet.split('    ').filter(h => h.trim() !== '')
            return hemistichs.length === 2 ? hemistichs : [hemistichs[0] || '', '']
          })
          
          return {
            id: verse.id || verse.poem_id,
            verseId: verse.id,
            poetId: poetNameToId[verse.poet] || verse.poet,
            poetName: verse.poet,
            poemTitle: verse.poem_title || verse.title,
            couplets: couplets,
            matchedVerse: verse.text,
            url: verse.url,
            category: verse.category || 'عمومی'
          }
        }
      })
      
      const totalResults = data.total_results || data.total || transformedResults.length
      const totalPages = Math.ceil(totalResults / limit)
      
      console.log('Transformed results:', transformedResults.length, 'results')
      console.log('Total results from API:', totalResults)
      console.log('Total pages:', totalPages)
      
      const returnValue = {
        results: transformedResults,
        totalResults: totalResults,
        totalPages: totalPages,
        currentPage: page,
        limit: limit
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
      const response = await fetch(`${API_BASE_URL}/poets`, {
        method: 'GET',
        headers: getDefaultHeaders(),
        redirect: 'follow',
        mode: 'cors'
      })
      
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
      const response = await fetch(`${API_BASE_URL}/poem/${poemId}`, {
        method: 'GET',
        headers: getDefaultHeaders(),
        redirect: 'follow',
        mode: 'cors'
      })
      
      console.log('API: Full poem response status:', response.status)
      if (!response.ok) {
        await handleApiError(response, 'Get Full Poem')
      }
      
      const poemData = await response.json()
      console.log('API: Received full poem data:', poemData)
      
      // Ensure poemData has the required structure
      // Parse the full poem text into couplets
      if (poemData.text) {
        const coupletsRaw = poemData.text.split('\n').filter(line => line.trim() !== '')
        
        const couplets = coupletsRaw.map(couplet => {
          const hemistichs = couplet.split('    ').filter(h => h.trim() !== '')
          return hemistichs.length === 2 ? hemistichs : [hemistichs[0] || '', '']
        })
        
        poemData.couplets = couplets
      } else if (poemData.verses && Array.isArray(poemData.verses)) {
        // If API returns verses array instead of text, process them
        console.log('API: Processing verses array instead of text')
        const versesByCouplet = {}
        
        poemData.verses.forEach(verse => {
          const coupletNumber = Math.floor((verse.vorder - 1) / 2)
          
          if (!versesByCouplet[coupletNumber]) {
            versesByCouplet[coupletNumber] = ['', '']
          }
          
          if (verse.position === 0) {
            versesByCouplet[coupletNumber][0] = verse.text
          } else if (verse.position === 1) {
            versesByCouplet[coupletNumber][1] = verse.text
          }
        })
        
        const couplets = Object.keys(versesByCouplet)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(key => versesByCouplet[key])
        
        poemData.couplets = couplets
      } else {
        // Ensure couplets array exists even if empty
        console.warn('API: No text or verses found in poem data, creating empty couplets')
        poemData.couplets = []
      }
      
      // Ensure required fields exist with defaults
      if (!poemData.poet && poemData.poet_name) {
        poemData.poet = poemData.poet_name
      }
      if (!poemData.title && poemData.poem_title) {
        poemData.title = poemData.poem_title
      }
      if (!poemData.category) {
        poemData.category = 'عمومی'
      }
      
      console.log('API: Processed poem data with couplets:', poemData.couplets?.length || 0, 'couplets')
      
      return poemData
    } catch (error) {
      console.error('Full poem API error:', error)
      console.error('Error details:', error.message)
      throw error
    }
  }

  static async registerUser(userData) {
    try {
      console.log('🚀 Starting user registration process...')
      console.log('📝 Registration data:', {
        name: userData.name,
        email: userData.email,
        hasPassword: !!userData.password,
        hasPasswordConfirmation: !!userData.password_confirmation
      })
      
      // Prepare request data
      const requestData = {
        name: userData.name?.trim(),
        email: userData.email?.trim(),
        password: userData.password,
        password_confirmation: userData.password_confirmation
      }
      
      console.log('📤 Sending registration request to:', `${API_BASE_URL}/auth/register`)
      console.log('📤 Request payload:', JSON.stringify(requestData, null, 2))
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(requestData)
      })
      
      console.log('📥 Registration response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        await handleApiError(response, 'User Registration')
      }
      
      const result = await response.json()
      console.log('✅ Registration successful!')
      console.log('📋 Response data:', {
        hasToken: !!result.token,
        hasUser: !!result.user,
        hasAccessToken: !!result.access_token,
        responseKeys: Object.keys(result)
      })
      
      // Validate response structure
      if (!result.user) {
        console.warn('⚠️ Warning: No user data in registration response')
      }
      
      if (!result.token && !result.access_token) {
        console.warn('⚠️ Warning: No authentication token in registration response')
      }
      
      // Normalize response format for consistency
      if (result.access_token && !result.token) {
        result.token = result.access_token
      }
      
      if (result.user && result.user.full_name && !result.user.name) {
        result.user.name = result.user.full_name
      }
      
      return result
      
    } catch (error) {
      console.error('❌ Registration failed:', error)
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید')
      }
      
      // Re-throw API errors with proper handling
      throw error
    }
  }

  // Try different login data structures to find what the backend expects
  static async loginUserWithFallback(credentials) {
    console.log('🔄 Starting login with fallback attempts...')
    
    const loginAttempts = [
      // Attempt 1: username/password (backend expects this based on 422 error)
      {
        username: credentials.email?.trim(),
        password: credentials.password
      }
    ]

    for (let i = 0; i < loginAttempts.length; i++) {
      const attempt = loginAttempts[i]
      console.log(`🔄 Login attempt ${i + 1}:`, attempt)
      
      try {
        // Try form-encoded data instead of JSON (OAuth2 format)
        const formData = new URLSearchParams()
        formData.append('username', attempt.username)
        formData.append('password', attempt.password)
        
        const body = formData.toString()
        console.log('📋 Request body (form-encoded):', body)
        
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
        
        console.log('📋 Request headers:', headers)
        
        const response = await fetch(`${API_BASE_URL}/auth/authenticate`, {
          method: 'POST',
          headers: headers,
          body: body
        })
        
        console.log(`📥 Login attempt ${i + 1} response:`, {
          status: response.status,
          ok: response.ok
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log(`✅ Login attempt ${i + 1} successful!`)
          return result
        } else {
          console.log(`❌ Login attempt ${i + 1} failed with status: ${response.status}`)
          if (i === loginAttempts.length - 1) {
            // Last attempt failed, handle the error
            await handleApiError(response, `Login Attempt ${i + 1}`)
          }
        }
      } catch (error) {
        console.log(`❌ Login attempt ${i + 1} error:`, error.message)
        if (i === loginAttempts.length - 1) {
          // Last attempt failed, re-throw the error
          throw error
        }
      }
    }
    
    // This should never be reached due to the error handling above
    throw new Error('همه تلاش‌های ورود ناموفق بود. لطفاً اطلاعات خود را بررسی کنید')
  }

  static async loginUser(credentials) {
    try {
      console.log('🔐 Starting user login process...')
      console.log('📝 Login credentials:', {
        email: credentials.email,
        hasPassword: !!credentials.password
      })
      
      // Prepare request data - backend expects username, not email
      const requestData = {
        username: credentials.email?.trim(), // Backend expects username field
        password: credentials.password
      }
      
      console.log('📤 Sending login request to:', `${API_BASE_URL}/auth/authenticate`)
      console.log('📤 Request payload:', JSON.stringify(requestData, null, 2))
      
      const response = await fetch(`${API_BASE_URL}/auth/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('📥 Login response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        await handleApiError(response, 'User Login')
      }
      
      const result = await response.json()
      console.log('✅ Login successful!')
      console.log('📋 Response data:', {
        hasToken: !!result.token,
        hasUser: !!result.user,
        hasAccessToken: !!result.access_token,
        responseKeys: Object.keys(result)
      })
      
      // Validate response structure
      if (!result.user) {
        console.warn('⚠️ Warning: No user data in login response')
      }
      
      if (!result.token && !result.access_token) {
        console.warn('⚠️ Warning: No authentication token in login response')
      }
      
      // Normalize response format for consistency
      if (result.access_token && !result.token) {
        result.token = result.access_token
      }
      
      if (result.user && result.user.full_name && !result.user.name) {
        result.user.name = result.user.full_name
      }
      
      return result
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید')
      }
      
      // Re-throw API errors with proper handling
      throw error
    }
  }

  // Test backend connectivity and endpoints
  static async testBackendConnectivity() {
    console.log('🔍 Testing backend connectivity...')
    
    try {
      // Test basic connectivity
      console.log('📡 Testing basic connectivity to:', API_BASE_URL)
      const response = await fetch(`${API_BASE_URL}/auth/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'testpassword' })
      })
      
      console.log('📊 Connectivity test results:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      const responseText = await response.text()
      console.log('📄 Response body:', responseText)
      
      if (response.ok) {
        console.log('✅ Backend is reachable and responding')
      } else {
        console.log('⚠️ Backend is reachable but returned error status')
        try {
          const errorData = JSON.parse(responseText)
          console.log('📋 Parsed error data:', errorData)
        } catch (e) {
          console.log('⚠️ Could not parse error response as JSON')
        }
      }
      
      return {
        reachable: true,
        status: response.status,
        response: responseText
      }
      
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error)
      return {
        reachable: false,
        error: error.message
      }
    }
  }

  // Get current user information
  static async getCurrentUser() {
    try {
      console.log('👤 Fetching current user information...')
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getDefaultHeaders()
      })
      
      console.log('📥 Current user response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Get Current User')
      }
      
      const result = await response.json()
      console.log('✅ Current user data:', result)
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to get current user:', error)
      throw error
    }
  }

  // Update user profile
  static async updateUserProfile(userData) {
    try {
      console.log('✏️ Updating user profile...')
      console.log('📝 Profile data:', userData)
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: getDefaultHeaders(),
        body: JSON.stringify(userData)
      })
      
      console.log('📥 Profile update response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Update User Profile')
      }
      
      const result = await response.json()
      console.log('✅ Profile updated successfully:', result)
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to update profile:', error)
      throw error
    }
  }

  // Update user's default poets
  static async updateFavouritePoets(poetNames) {
    try {
      console.log('✏️ Updating user favourite poets...')
      console.log('📝 Favourite poets:', poetNames)
      
      // Prepare payload for /api/favourite-poets endpoint
      const payload = {
        favourite_poets: poetNames
      }
      
      console.log('📤 Sending request to:', `${API_BASE_URL}/favourite-poets`)
      console.log('📤 Request method: PUT')
      console.log('📤 Request payload:', JSON.stringify(payload, null, 2))
      
      const response = await fetch(`${API_BASE_URL}/favourite-poets`, {
        method: 'PUT',
        headers: getDefaultHeaders(),
        body: JSON.stringify(payload)
      })
      
      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        await handleApiError(response, 'Update Favourite Poets')
      }
      
      const result = await response.json()
      console.log('✅ Favourite poets updated successfully:', result)
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to update favourite poets:', error)
      throw error
    }
  }

  // Deprecated: Keep old method for backwards compatibility
  static async updateDefaultPoets(defaultPoets) {
    console.log('⚠️ updateDefaultPoets is deprecated, use updateFavouritePoets instead')
    return this.updateFavouritePoets(defaultPoets)
  }

  // Change user password
  static async changePassword(passwordData) {
    try {
      console.log('🔐 Changing user password...')
      
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(passwordData)
      })
      
      console.log('📥 Password change response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Change Password')
      }
      
      const result = await response.json()
      console.log('✅ Password changed successfully')
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to change password:', error)
      throw error
    }
  }

  // Logout user
  static async logoutUser() {
    try {
      console.log('🚪 Logging out user...')
      
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getDefaultHeaders()
      })
      
      console.log('📥 Logout response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        await handleApiError(response, 'User Logout')
      }
      
      const result = await response.json()
      console.log('✅ User logged out successfully:', result)
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to logout:', error)
      
      // Even if the API call fails, we should still allow logout
      // since JWT tokens are stateless and logout is primarily client-side
      console.log('⚠️ API logout failed, but proceeding with client-side logout')
      
      throw error
    }
  }

  // Get blog posts
  static async getBlogPosts(options = {}) {
    try {
      console.log('📝 Fetching blog posts...')
      
      const { limit = 20, offset = 0, author = null, includeUnpublished = false } = options
      
      let url = `${API_BASE_URL}/blog/posts?limit=${limit}&offset=${offset}`
      
      if (author) {
        url += `&author=${encodeURIComponent(author)}`
      }
      
      if (includeUnpublished) {
        url += `&include_unpublished=true`
      }
      
      console.log('📤 Request URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders(),
        mode: 'cors',
        redirect: 'follow'
      })
      
      console.log('📥 Blog posts response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Get Blog Posts')
      }
      
      const result = await response.json()
      console.log('✅ Blog posts fetched:', {
        total: result.total,
        postsCount: result.posts?.length || 0
      })
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to get blog posts:', error)
      throw error
    }
  }

  // Get user's own blog posts
  static async getMyBlogPosts(includeUnpublished = false) {
    try {
      console.log('📝 Fetching my blog posts...')
      
      let url = `${API_BASE_URL}/blog/posts/my`
      
      if (includeUnpublished) {
        url += `?include_unpublished=true`
      }
      
      console.log('📤 Request URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getDefaultHeaders()
      })
      
      console.log('📥 My blog posts response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Get My Blog Posts')
      }
      
      const result = await response.json()
      console.log('✅ My blog posts fetched:', {
        total: result.total,
        postsCount: result.posts?.length || 0
      })
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to get my blog posts:', error)
      throw error
    }
  }

  // Get a single blog post by ID
  static async getBlogPost(postId) {
    try {
      console.log('📝 Fetching blog post:', postId)
      
      const response = await fetch(`${API_BASE_URL}/blog/posts/${postId}`, {
        method: 'GET',
        headers: getDefaultHeaders()
      })
      
      console.log('📥 Blog post response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Get Blog Post')
      }
      
      const result = await response.json()
      console.log('✅ Blog post fetched:', result)
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to get blog post:', error)
      throw error
    }
  }

  // Create a new blog post
  static async createBlogPost(postData) {
    try {
      console.log('✍️ Creating new blog post...')
      console.log('📝 Post data:', postData)
      
      // Validate required fields
      if (!postData.title || !postData.content) {
        throw new Error('عنوان و محتوا الزامی هستند')
      }
      
      // Prepare the payload for the API
      const payload = {
        title: postData.title.trim(),
        content: postData.content.trim(),
        published: postData.is_published || postData.published || false,
        tags: postData.tags || []
      }
      
      // Add optional fields if provided
      if (postData.author_name) {
        payload.author_name = postData.author_name.trim()
      }
      
      if (postData.author_username) {
        payload.author_username = postData.author_username.trim()
      }
      
      const url = `${API_BASE_URL}/blog/posts`
      console.log('📤 Create post URL:', url)
      console.log('📤 Request payload:', JSON.stringify(payload, null, 2))
      console.log('📤 Headers:', getDefaultHeaders())
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(payload),
        mode: 'cors',
        redirect: 'follow'
      })
      
      console.log('📥 Create post response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Create Blog Post')
      }
      
      const result = await response.json()
      console.log('✅ Blog post created successfully:', result)
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to create blog post:', error)
      if (error?.status) {
        console.error('Create post error status:', error.status)
      }
      throw error
    }
  }

  // Update a blog post
  static async updateBlogPost(postId, postData) {
    try {
      console.log('✏️ Updating blog post:', postId)
      console.log('📝 Post data:', postData)
      
      const response = await fetch(`${API_BASE_URL}/blog/posts/${postId}`, {
        method: 'PUT',
        headers: getDefaultHeaders(),
        body: JSON.stringify(postData)
      })
      
      console.log('📥 Update post response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Update Blog Post')
      }
      
      const result = await response.json()
      console.log('✅ Blog post updated successfully:', result)
      
      return result
      
    } catch (error) {
      console.error('❌ Failed to update blog post:', error)
      throw error
    }
  }

  // Delete a blog post
  static async deleteBlogPost(postId) {
    try {
      console.log('🗑️ Deleting blog post:', postId)
      
      const response = await fetch(`${API_BASE_URL}/blog/posts/${postId}`, {
        method: 'DELETE',
        headers: getDefaultHeaders()
      })
      
      console.log('📥 Delete post response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        await handleApiError(response, 'Delete Blog Post')
      }
      
      console.log('✅ Blog post deleted successfully')
      
      return true
      
    } catch (error) {
      console.error('❌ Failed to delete blog post:', error)
      throw error
    }
  }

  // Debug method to test API endpoints
  static async testAuthEndpoints() {
    console.log('=== Testing Auth Endpoints ===')
    
    // Test registration endpoint
    try {
      const testRegisterData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123'
      }
      
      console.log('Testing registration endpoint with:', testRegisterData)
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(testRegisterData)
      })
      
      console.log('Registration endpoint response:', {
        status: registerResponse.status,
        statusText: registerResponse.statusText,
        headers: Object.fromEntries(registerResponse.headers.entries())
      })
      
    } catch (error) {
      console.error('Registration endpoint test failed:', error)
    }
    
    // Test login endpoint
    try {
      const testLoginData = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      console.log('Testing login endpoint with:', testLoginData)
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(testLoginData)
      })
      
      console.log('Login endpoint response:', {
        status: loginResponse.status,
        statusText: loginResponse.statusText,
        headers: Object.fromEntries(loginResponse.headers.entries())
      })
      
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text()
        console.log('Login error response body:', errorText)
      }
      
    } catch (error) {
      console.error('Login endpoint test failed:', error)
    }
  }
}