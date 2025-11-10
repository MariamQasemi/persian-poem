<template>
  <Teleport to="body">
    <div 
      v-if="isVisible" 
      class="word-selection-popup"
      :style="popupStyle"
      @click.stop
    >
      <button 
        @click="handleVajehyab"
        class="popup-option vajehyab-option"
      >
        <span>واژه یاب</span>
      </button>
      <button 
        v-if="verseId && isAuthenticated"
        @click="handleCreateNote"
        class="popup-option create-note-option"
      >
        <span>ایجاد یادداشت</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  selectedWord: {
    type: String,
    default: ''
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  verseId: {
    type: [Number, String],
    default: null
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['vajehyab', 'createNote', 'close'])

const popupStyle = computed(() => {
  const { x, y } = props.position
  // Ensure popup doesn't go off-screen
  const popupWidth = 160 // Approximate popup width
  const popupHeight = 100 // Approximate popup height
  const margin = 10
  
  let left = x
  let top = y - popupHeight - margin
  
  // Adjust if too close to left edge
  if (left < popupWidth / 2 + margin) {
    left = popupWidth / 2 + margin
  }
  
  // Adjust if too close to right edge
  if (left > window.innerWidth - popupWidth / 2 - margin) {
    left = window.innerWidth - popupWidth / 2 - margin
  }
  
  // Adjust if too close to top edge
  if (top < margin) {
    top = y + margin // Show below instead
  }
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: 'translateX(-50%)'
  }
})

const handleVajehyab = () => {
  if (props.selectedWord) {
    emit('vajehyab', props.selectedWord)
  }
  emit('close')
}

const handleCreateNote = () => {
  if (props.verseId) {
    emit('createNote', props.verseId)
  }
  emit('close')
}

// Close popup when clicking outside
const handleClickOutside = (event) => {
  if (props.isVisible) {
    const popup = event.target.closest('.word-selection-popup')
    if (!popup) {
      emit('close')
    }
  }
}

// Close popup on scroll
const handleScroll = () => {
  if (props.isVisible) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>

<style scoped>
.word-selection-popup {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #1a1a1a;
  border: 1px solid #702632;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  min-width: 140px;
}

.popup-option {
  background: #121212;
  border: 1px solid #2c2c2c;
  color: #CDC7C6;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  text-align: center;
  white-space: nowrap;
}

.popup-option:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.vajehyab-option:hover {
  background: #702632;
}

.create-note-option:hover {
  background: #702632;
}
</style>

