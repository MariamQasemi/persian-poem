/**
 * Custom date formatter for Persian dates
 * Replaces toLocaleDateString('fa-IR') to avoid browser locale requests
 */

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const persianWeekdays = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
]

/**
 * Convert Gregorian date to Persian (Jalali) date
 * @param {Date} date - Gregorian date
 * @returns {Object} Object with year, month, day
 */
function gregorianToPersian(date) {
  const gYear = date.getFullYear()
  const gMonth = date.getMonth() + 1
  const gDay = date.getDate()

  const gy2 = (gYear - (gMonth <= 6 ? 1600 : 1601)) * 365
  const gm2 = (gMonth > 6 ? (gMonth - 7) * 30 + 6 * 31 : (gMonth - 1) * 31)
  const gd2 = gDay - 1
  const gDayNo = gy2 + Math.floor((gYear - (gMonth <= 6 ? 1600 : 1601)) / 4) - Math.floor((gYear - (gMonth <= 6 ? 1600 : 1601)) / 100) + Math.floor((gYear - (gMonth <= 6 ? 1600 : 1601)) / 400) + gm2 + gd2

  let jDayNo = gDayNo - 79
  const jNp = Math.floor(jDayNo / 12053)
  jDayNo = jDayNo % 12053
  let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461)
  jDayNo %= 1461

  if (jDayNo >= 366) {
    jy += Math.floor((jDayNo - 1) / 365)
    jDayNo = (jDayNo - 1) % 365
  }

  let jm, jd
  if (jDayNo < 186) {
    jm = 1 + Math.floor(jDayNo / 31)
    jd = 1 + (jDayNo % 31)
  } else {
    jm = 7 + Math.floor((jDayNo - 186) / 30)
    jd = 1 + ((jDayNo - 186) % 30)
  }

  return { year: jy, month: jm, day: jd }
}

/**
 * Format date in Persian format (YYYY/MM/DD)
 * @param {Date|string} dateInput - Date object or ISO string
 * @returns {string} Formatted date string or '—' if invalid
 */
export function formatPersianDate(dateInput) {
  if (!dateInput) return '—'
  
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '—'
    }
    
    const persian = gregorianToPersian(date)
    const month = String(persian.month).padStart(2, '0')
    const day = String(persian.day).padStart(2, '0')
    
    return `${persian.year}/${month}/${day}`
  } catch (e) {
    console.error('Error formatting date:', e)
    return '—'
  }
}

/**
 * Format date with Persian month name (e.g., "15 فروردین 1403")
 * @param {Date|string} dateInput - Date object or ISO string
 * @returns {string} Formatted date string or '—' if invalid
 */
export function formatPersianDateWithMonth(dateInput) {
  if (!dateInput) return '—'
  
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '—'
    }
    
    const persian = gregorianToPersian(date)
    const monthName = persianMonths[persian.month - 1]
    
    return `${persian.day} ${monthName} ${persian.year}`
  } catch (e) {
    console.error('Error formatting date:', e)
    return '—'
  }
}

