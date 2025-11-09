// Verse cache utility to reduce API calls
// Stores verse information in memory and optionally in localStorage

const memoryCache = new Map()

// Get verse info from cache
export function getVerseInfo(verseId) {
  if (!verseId) return null
  
  // Check memory cache first
  if (memoryCache.has(verseId)) {
    return memoryCache.get(verseId)
  }
  
  // Check localStorage
  try {
    const cached = localStorage.getItem(`verse_${verseId}`)
    if (cached) {
      const verseInfo = JSON.parse(cached)
      // Also store in memory cache for faster access
      memoryCache.set(verseId, verseInfo)
      return verseInfo
    }
  } catch (e) {
    console.error('Error reading verse from localStorage:', e)
  }
  
  return null
}

// Store verse info in cache
export function setVerseInfo(verseId, verseInfo) {
  if (!verseId || !verseInfo) return
  
  // Store in memory cache
  memoryCache.set(verseId, verseInfo)
  
  // Store in localStorage for persistence
  try {
    localStorage.setItem(`verse_${verseId}`, JSON.stringify(verseInfo))
  } catch (e) {
    console.error('Error storing verse in localStorage:', e)
  }
}

// Clear all cached verse data
export function clearVerseCache() {
  memoryCache.clear()
  
  // Clear localStorage
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('verse_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (e) {
    console.error('Error clearing verse cache from localStorage:', e)
  }
}

// Clear a specific verse from cache
export function clearVerseInfo(verseId) {
  if (!verseId) return
  
  memoryCache.delete(verseId)
  
  try {
    localStorage.removeItem(`verse_${verseId}`)
  } catch (e) {
    console.error('Error clearing verse from localStorage:', e)
  }
}

