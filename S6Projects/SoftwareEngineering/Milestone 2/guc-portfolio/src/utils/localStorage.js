/**
 * LocalStorage Utility Module
 * Handles all localStorage operations for the GUC Portfolio application
 */

const STORAGE_KEYS = {
  USERS: 'guc_users',
  PROJECTS: 'guc_projects',
  INTERNSHIPS: 'guc_internships',
  NOTIFICATIONS: 'guc_notifications',
  STUDENT_PROJECTS: 'guc_student_projects',
  STUDENT_FAVORITES: 'guc_student_favorites',
  EMPLOYERS: 'guc_employers',
  COURSES: 'guc_courses',
  LINK_REQUESTS: 'guc_link_requests',
  APPEALS: 'guc_appeals',
  COMPLETED_INTERNSHIPS: 'guc_completed_internships',
  SAMPLE_THESIS_DRAFTS: 'guc_thesis_drafts',
  SAMPLE_FINAL_DRAFTS: 'guc_final_drafts',
  SAMPLE_COLLABORATORS: 'guc_collaborators',
  SAMPLE_INVITATIONS: 'guc_invitations',
  PORTFOLIO_STUDENTS: 'guc_portfolio_students',
  FAVORITE_STUDENTS: 'guc_favorite_students',
  FAVORITE_PROJECTS: 'guc_favorite_projects',
  DEFAULT_COMPANY_PROFILE: 'guc_company_profile',
  EMPLOYER_NOTIFICATIONS: 'guc_employer_notifications',
  USER_AUTH: 'guc_user_auth',
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Retrieved data or default value
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Clear all application data from localStorage
 */
export const clearAllLocalStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * Initialize localStorage with default data from Data.js
 * @param {object} defaultData - Default data object from Data.js
 */
export const initializeLocalStorage = (defaultData) => {
  try {
    Object.entries(defaultData).forEach(([key, value]) => {
      const storageKey = STORAGE_KEYS[key.toUpperCase()];
      if (storageKey && !getFromLocalStorage(storageKey)) {
        saveToLocalStorage(storageKey, value);
      }
    });
    return true;
  } catch (error) {
    console.error('Error initializing localStorage:', error);
    return false;
  }
};

/**
 * Get all storage keys
 * @returns {object} - All storage keys
 */
export const getStorageKeys = () => STORAGE_KEYS;

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get storage size in bytes
 * @returns {number} - Storage size
 */
export const getStorageSize = () => {
  let size = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      size += localStorage[key].length + key.length;
    }
  }
  return size;
};

/**
 * Export all data from localStorage as JSON
 * @returns {object} - All stored data
 */
export const exportAllData = () => {
  try {
    const allData = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      allData[key] = getFromLocalStorage(storageKey);
    });
    return allData;
  } catch (error) {
    console.error('Error exporting data:', error);
    return {};
  }
};

/**
 * Import data to localStorage from exported JSON
 * @param {object} data - Data to import
 */
export const importData = (data) => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      const storageKey = STORAGE_KEYS[key];
      if (storageKey && value) {
        saveToLocalStorage(storageKey, value);
      }
    });
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Export all constants and functions
export default {
  STORAGE_KEYS,
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  clearAllLocalStorage,
  initializeLocalStorage,
  getStorageKeys,
  isLocalStorageAvailable,
  getStorageSize,
  exportAllData,
  importData,
};
