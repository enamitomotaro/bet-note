
"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) { // localStorage にキーが無い場合
        return initialValue;
      }
      if (item === "undefined") { // 文字列 "undefined" が保存されていた場合の対処
        // 以前のバージョンで誤って "undefined" が保存されていた可能性を考慮
        return initialValue;
      }
      // それ以外は JSON.parse で変換（"null" の場合は null が返る）
      return JSON.parse(item);
    } catch (error) {
      // 解析に失敗した場合のフォールバック
      console.error(`Error parsing localStorage key "${key}" with value "${window.localStorage.getItem(key)}". Returning initial value.`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const valueToProcess = typeof storedValue === 'function' ? (storedValue as Function)(storedValue) : storedValue;

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
