// Local storage utilities for journal entries and settings

export type EntryType = 'fact' | 'reminder' | 'goal' | 'casual';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  type: EntryType;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: 'calm' | 'sombre' | 'jovial' | 'serious' | 'bored' | 'mad';
  pin?: string;
  isPinEnabled: boolean;
}

const ENTRIES_KEY = 'journal_entries';
const SETTINGS_KEY = 'journal_settings';
const PIN_KEY = 'journal_pin';

// Entry management
export const getEntries = (): JournalEntry[] => {
  try {
    const data = localStorage.getItem(ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveEntry = (entry: JournalEntry): void => {
  const entries = getEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

export const deleteEntry = (id: string): void => {
  const entries = getEntries().filter(e => e.id !== id);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

export const getEntriesByDate = (date: string): JournalEntry[] => {
  return getEntries().filter(e => e.date === date);
};

export const getEntriesByType = (type: EntryType): JournalEntry[] => {
  return getEntries().filter(e => e.type === type);
};

// Settings management
export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { theme: 'calm', isPinEnabled: false };
  } catch {
    return { theme: 'calm', isPinEnabled: false };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', settings.theme);
};

// PIN management
export const verifyPin = (pin: string): boolean => {
  const savedPin = localStorage.getItem(PIN_KEY);
  return savedPin === pin;
};

export const setPin = (pin: string): void => {
  localStorage.setItem(PIN_KEY, pin);
};

export const clearPin = (): void => {
  localStorage.removeItem(PIN_KEY);
};

export const hasPin = (): boolean => {
  return localStorage.getItem(PIN_KEY) !== null;
};

// Initialize theme on app load
export const initializeTheme = (): void => {
  const settings = getSettings();
  document.documentElement.setAttribute('data-theme', settings.theme);
};