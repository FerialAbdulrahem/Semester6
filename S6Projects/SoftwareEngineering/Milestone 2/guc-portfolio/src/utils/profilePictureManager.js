/**
 * Profile Picture Manager
 * Centralized utility for managing user profile pictures across the entire application
 */

const STORAGE_KEY = 'guc_user_profile_picture';
const EVENT_NAME = 'guc-profile-picture-updated';

/**
 * Save profile picture to localStorage and emit event
 * @param {string} dataUrl - Base64 data URL of the image
 */
export const saveProfilePicture = (dataUrl) => {
  try {
    if (dataUrl) {
      localStorage.setItem(STORAGE_KEY, dataUrl);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    // Emit global event so all components update
    window.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: dataUrl || null,
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving profile picture:', error);
    return false;
  }
};

/**
 * Get profile picture from localStorage
 * @returns {string|null} - Base64 data URL or null
 */
export const getProfilePicture = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch (error) {
    console.error('Error retrieving profile picture:', error);
    return null;
  }
};

/**
 * Remove profile picture from localStorage and emit event
 */
export const removeProfilePicture = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, {
      detail: null,
    }));
    return true;
  } catch (error) {
    console.error('Error removing profile picture:', error);
    return false;
  }
};

/**
 * Listen for profile picture updates globally
 * @param {function} callback - Function to call when picture updates
 * @returns {function} - Cleanup function to remove listener
 */
export const onProfilePictureChange = (callback) => {
  const handleUpdate = (event) => {
    callback(event.detail);
  };

  window.addEventListener(EVENT_NAME, handleUpdate);

  // Return cleanup function
  return () => window.removeEventListener(EVENT_NAME, handleUpdate);
};
