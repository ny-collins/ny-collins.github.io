/**
 * Dear Darling — Storage Manager
 * Safely persists opened letters, favorites, and interactive states to localStorage
 */

const STORAGE_KEYS = {
  OPENED: "dear_darling_opened_letters",
  FAVORITES: "dear_darling_favorite_letters",
  VOUCHER: "dear_darling_voucher_redeemed",
  HUGS: "dear_darling_hugs_count",
  CHECKLIST: "dear_darling_checklist_state",
  AUDIO_MUTED: "dear_darling_audio_muted"
};

// In-memory fallback if localStorage is disabled or throws SecurityError
let memoryStore = {};

function safeGet(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return memoryStore[key] || null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    memoryStore[key] = value;
  }
}

export const StorageManager = {
  getOpenedLetters() {
    const raw = safeGet(STORAGE_KEYS.OPENED);
    return Array.isArray(raw) ? new Set(raw) : new Set();
  },

  markLetterOpened(id) {
    const opened = this.getOpenedLetters();
    opened.add(id);
    safeSet(STORAGE_KEYS.OPENED, Array.from(opened));
    return opened;
  },

  getFavorites() {
    const raw = safeGet(STORAGE_KEYS.FAVORITES);
    return Array.isArray(raw) ? new Set(raw) : new Set();
  },

  toggleFavorite(id) {
    const favs = this.getFavorites();
    if (favs.has(id)) {
      favs.delete(id);
    } else {
      favs.add(id);
    }
    safeSet(STORAGE_KEYS.FAVORITES, Array.from(favs));
    return favs.has(id);
  },

  isFavorite(id) {
    return this.getFavorites().has(id);
  },

  isVoucherRedeemed() {
    return Boolean(safeGet(STORAGE_KEYS.VOUCHER));
  },

  redeemVoucher() {
    safeSet(STORAGE_KEYS.VOUCHER, true);
    return true;
  },

  getHugCount() {
    const count = safeGet(STORAGE_KEYS.HUGS);
    return typeof count === "number" ? count : 0;
  },

  incrementHugCount() {
    const nextCount = this.getHugCount() + 1;
    safeSet(STORAGE_KEYS.HUGS, nextCount);
    return nextCount;
  },

  getChecklistState() {
    const state = safeGet(STORAGE_KEYS.CHECKLIST);
    return Array.isArray(state) ? state : [];
  },

  saveChecklistState(indices) {
    safeSet(STORAGE_KEYS.CHECKLIST, indices);
  }
};
