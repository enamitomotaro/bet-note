"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  // 初回レンダーでは initialValue をそのまま使い、マウント後に localStorage から読み込む
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // マウント時に一度だけ localStorage の値を読み込む
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === "undefined") {
        setStoredValue(initialValue);
      } else {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(
        `Error parsing localStorage key "${key}" with value "${window.localStorage.getItem(
          key
        )}". Using initial value.`,
        error
      );
      setStoredValue(initialValue);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const valueToProcess =
          typeof storedValue === "function"
            ? (storedValue as Function)(storedValue)
            : storedValue;

        if (valueToProcess === undefined) {
          // undefined の場合は文字列 "undefined" を保存しないよう削除
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
