import { HistoryItem } from "../types";

export const fetchHistory = async (): Promise<HistoryItem[]> => {
  try {
    const res = await fetch('/api/history');
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return [];
  } catch (e) {
    console.error("Failed to fetch history", e);
    return [];
  }
};

export const saveHistory = async (item: Omit<HistoryItem, 'id'>) => {
  try {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
  } catch (e) {
    console.error("Failed to save history", e);
  }
};
