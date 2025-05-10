import { useState, useEffect } from 'react';

/**
 * Custom React hook to synchronize a piece of state with sessionStorage.
 *
 * @param key The key to use for storing data in sessionStorage.
 * @param initialValue The initial value for the state if no data is found in sessionStorage.
 * @returns A tuple containing the current state and a function to update the state.
 */
function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((prevValue: T) => T)) => void] {
  // Get initial value from sessionStorage or use the provided initialValue
  const [state, setState] = useState<T>(() => {
    try {
      const savedValue = sessionStorage.getItem(key);
      if (savedValue !== null) {
        // Parse the saved JSON string
        return JSON.parse(savedValue);
      }
    } catch (error) {
      console.error(`Error loading state from sessionStorage for key "${key}":`, error);
      // If there's an error loading, return the initial value
    }
    // If no saved value or an error occurred, return the initial value
    return initialValue;
  });

  // Effect to save the state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      // Stringify the state and save it
      sessionStorage.setItem(key, JSON.stringify(state));
      // console.log(`State saved to sessionStorage for key "${key}".`); // Optional log
    } catch (error) {
      console.error(`Error saving state to sessionStorage for key "${key}":`, error);
      // Handle potential errors like storage full
    }
  }, [key, state]); // Re-run effect if key or state changes

  // Return the state and the setState function
  return [state, setState];
}

export default useSessionStorage;
