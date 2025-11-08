// Utility class to manage liked verses persistence in localStorage
export class LikedVersesManager {
  static STORAGE_KEY = 'liked_verses'

  // Get all liked verse IDs from localStorage
  static getLikedVerses() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return new Set()
      
      const verseIds = JSON.parse(stored)
      if (!Array.isArray(verseIds)) {
        console.warn('⚠️ Liked verses in localStorage is not an array, resetting...')
        this.clearLikedVerses()
        return new Set()
      }
      
      return new Set(verseIds.map(id => String(id))) // Convert to strings for consistency
    } catch (error) {
      console.error('❌ Error reading liked verses from localStorage:', error)
      return new Set()
    }
  }

  // Add a verse ID to liked verses
  static addLikedVerse(verseId) {
    if (!verseId) return
    
    try {
      const likedVerses = this.getLikedVerses()
      likedVerses.add(String(verseId))
      this.saveLikedVerses(likedVerses)
      console.log('✅ Added liked verse to storage:', verseId)
    } catch (error) {
      console.error('❌ Error adding liked verse:', error)
    }
  }

  // Remove a verse ID from liked verses
  static removeLikedVerse(verseId) {
    if (!verseId) return
    
    try {
      const likedVerses = this.getLikedVerses()
      likedVerses.delete(String(verseId))
      this.saveLikedVerses(likedVerses)
      console.log('✅ Removed liked verse from storage:', verseId)
    } catch (error) {
      console.error('❌ Error removing liked verse:', error)
    }
  }

  // Check if a verse is liked
  static isVerseLiked(verseId) {
    if (!verseId) return false
    const likedVerses = this.getLikedVerses()
    return likedVerses.has(String(verseId))
  }

  // Save liked verses to localStorage
  static saveLikedVerses(likedVerses) {
    try {
      const verseIds = Array.from(likedVerses)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(verseIds))
      console.log('💾 Saved liked verses to localStorage:', verseIds.length, 'verses')
    } catch (error) {
      console.error('❌ Error saving liked verses to localStorage:', error)
    }
  }

  // Clear all liked verses (optional - not used on logout per user requirement)
  static clearLikedVerses() {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
      console.log('🧹 Cleared liked verses from localStorage')
    } catch (error) {
      console.error('❌ Error clearing liked verses:', error)
    }
  }

  // Sync liked verses from API response (when loading poems)
  static syncFromPoemData(poemData) {
    if (!poemData || !poemData.couplets) return
    
    const likedVerses = this.getLikedVerses()
    let updated = false
    
    poemData.couplets.forEach(couplet => {
      if (couplet.fullWidth && couplet.verseId) {
        if (couplet.isLiked) {
          likedVerses.add(String(couplet.verseId))
          updated = true
        }
      } else if (couplet.verseIds && Array.isArray(couplet.verseIds)) {
        if (couplet.verseLiked && Array.isArray(couplet.verseLiked)) {
          couplet.verseIds.forEach((verseId, index) => {
            if (verseId && couplet.verseLiked[index]) {
              likedVerses.add(String(verseId))
              updated = true
            }
          })
        }
      }
    })
    
    if (updated) {
      this.saveLikedVerses(likedVerses)
    }
  }
}

