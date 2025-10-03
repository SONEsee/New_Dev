// composables/useAppEvents.ts
import { ref } from 'vue'

// Create a reactive event emitter
const eventBus = ref<Map<string, Set<Function>>>(new Map())

export const useAppEvents = () => {
  // Emit an event
  const emit = (eventName: string, data?: any) => {
    const listeners = eventBus.value.get(eventName)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Listen to an event
  const on = (eventName: string, callback: Function) => {
    if (!eventBus.value.has(eventName)) {
      eventBus.value.set(eventName, new Set())
    }
    eventBus.value.get(eventName)?.add(callback)

    // Return unsubscribe function
    return () => {
      eventBus.value.get(eventName)?.delete(callback)
    }
  }

  // Remove all listeners for an event
  const off = (eventName: string) => {
    eventBus.value.delete(eventName)
  }

  return {
    emit,
    on,
    off
  }
}

// Event names constants
export const APP_EVENTS = {
  DATA_ENTRY_UPDATED: 'data_entry_updated',
  WORKING_DAY_CHECK: 'working_day_check',
  PERMISSIONS_UPDATED: 'permissions_updated'
} as const