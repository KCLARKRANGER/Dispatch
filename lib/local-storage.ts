// Helper functions for working with localStorage
export function saveToLocalStorage(key: string, data: any): void {
  try {
    const serializedData = JSON.stringify(data)
    localStorage.setItem(key, serializedData)
    console.log(`Saved data to localStorage with key: ${key}`)
  } catch (error) {
    console.error(`Error saving to localStorage:`, error)
  }
}

export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const serializedData = localStorage.getItem(key)
    if (!serializedData) {
      console.log(`No data found in localStorage for key: ${key}`)
      return null
    }
    return JSON.parse(serializedData) as T
  } catch (error) {
    console.error(`Error retrieving from localStorage:`, error)
    return null
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
    console.log(`Removed data from localStorage with key: ${key}`)
  } catch (error) {
    console.error(`Error removing from localStorage:`, error)
  }
}

