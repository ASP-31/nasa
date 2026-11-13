import { useCallback, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// LocalStorage persistence with graceful degradation — corrupted
// or missing data simply falls back to the initial value.
// ─────────────────────────────────────────────────────────────

export function readLocalStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode / quota) — the game still runs.
  }
}

export function removeLocalStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readLocalStorage<T>(key) ?? initialValue);

  useEffect(() => {
    writeLocalStorage(key, value);
  }, [key, value]);

  const reset = useCallback(() => {
    removeLocalStorage(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, reset] as const;
}
