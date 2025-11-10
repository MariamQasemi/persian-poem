// Utility function to handle word selection from double-click

/**
 * Extract selected word from text selection
 * Handles Persian text and removes punctuation
 */
export function extractSelectedWord() {
  const selection = window.getSelection()
  
  if (!selection || selection.rangeCount === 0) {
    return null
  }
  
  const selectedText = selection.toString().trim()
  
  if (!selectedText) {
    return null
  }
  
  // Remove common punctuation marks (Persian and English)
  const cleaned = selectedText.replace(/[،,؛;:：。.؟?！!()\[\]{}«»""''\s]+/g, ' ').trim()
  
  // Take the first word if multiple words are selected
  const words = cleaned.split(/\s+/)
  const firstWord = words[0] || cleaned
  
  // Remove any remaining punctuation from the word
  const word = firstWord.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]/g, '')
  
  return word || null
}

/**
 * Get mouse position from event
 */
export function getMousePosition(event) {
  return {
    x: event.clientX,
    y: event.clientY
  }
}

/**
 * Get verse ID from clicked element
 * Looks for data-verse-id attribute or parent elements
 */
export function getVerseIdFromElement(element) {
  if (!element) return null
  
  // Check the element itself
  if (element.dataset?.verseId) {
    return element.dataset.verseId
  }
  
  // Check parent elements (up to 3 levels)
  let current = element.parentElement
  let depth = 0
  while (current && depth < 3) {
    if (current.dataset?.verseId) {
      return current.dataset.verseId
    }
    current = current.parentElement
    depth++
  }
  
  return null
}

/**
 * Handle double-click event and extract word selection info
 */
export function handleDoubleClick(event) {
  // Get selected word
  const selectedWord = extractSelectedWord()
  
  if (!selectedWord) {
    return null
  }
  
  // Get mouse position
  const position = getMousePosition(event)
  
  // Get verse ID from clicked element
  const verseId = getVerseIdFromElement(event.target)
  
  return {
    selectedWord,
    position,
    verseId: verseId ? parseInt(verseId) : null
  }
}

/**
 * Redirect to vajehyab.com with selected word
 */
export function redirectToVajehyab(word) {
  if (!word) return
  
  const encodedWord = encodeURIComponent(word)
  const url = `https://vajehyab.com/?q=${encodedWord}&d=`
  window.open(url, '_blank')
}

