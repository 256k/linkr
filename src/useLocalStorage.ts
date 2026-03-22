import { useState, useEffect } from 'react';
import type { URLItem } from './types';

const STORAGE_KEY = 'linkr-urls';

export function useLocalStorage(): [URLItem[], (items: URLItem[]) => void] {
  const [items, setItems] = useState<URLItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [items]);

  return [items, setItems];
}
