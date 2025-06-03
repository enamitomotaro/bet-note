
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) { // Key not found in localStorage
        return initialValue;
      }
      if (item === "undefined") { // Explicitly check for the string "undefined"
        // This handles cases where a previous version might have incorrectly stored the literal string "undefined"
        return initialValue;
      }
      // Attempt to parse other values. If item was "null", JSON.parse will correctly return null.
      return JSON.parse(item);
    } catch (error) {
      // Fallback for other parsing errors.
      console.error(`Error parsing localStorage key "${key}" with value "${window.localStorage.getItem(key)}". Returning initial value.`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const valueToProcess = typeof storedValue === 'function' ? (storedValue as Function)(storedValue) : storedValue;

        if (valueToProcess === undefined) {
          // If the value is undefined, remove it from localStorage to avoid storing the string "undefined"
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToProcess));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
