import React, { useState, useRef } from 'react';
import '../styles/sideStyles.css';

const StudentProfilePic = ({ user, onPictureUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentPicture, setCurrentPicture] = useState(() => {
    // Load from localStorage
    const key = `student_profile_pic_${user.id}`;
    return localStorage.getItem(key) || user.avatar || null;
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleUpload = () => {
    if (selectedFile && preview) {
      // Save to localStorage
      const key = `student_profile_pic_${user.id}`;
      localStorage.setItem(key, preview);

      // Update current picture
      setCurrentPicture(preview);

      // Notify parent component
      if (onPictureUpdate) {
        onPictureUpdate(preview);
      }

      // Reset selection
      setSelectedFile(null);
      setPreview(null);
      fileInputRef.current.value = '';

      alert('Profile picture updated successfully!');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    fileInputRef.current.value = '';
  };

  return (
    <div className="profile-pic-upload">
      <h3>Profile Picture</h3>

      {/* Current Picture */}
      <div className="current-picture">
        <img
          src={currentPicture || '/default-avatar.png'}
          alt="Current Profile"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #ddd'
          }}
        />
      </div>

      {/* File Input */}
      <div className="file-input-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          ref={fileInputRef}
          style={{ margin: '10px 0' }}
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="preview-section">
          <h4>Preview:</h4>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #4CAF50'
            }}
          />
        </div>
      )}

      {/* Buttons */}
      {selectedFile && (
        <div className="button-section" style={{ marginTop: '10px' }}>
          <button
            onClick={handleUpload}
            style={{
              backgroundColor: '#4CAF50',
              color: 'var(--c-surface)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Upload
          </button>
          <button
            onClick={handleCancel}
            style={{
              backgroundColor: '#f44336',
              color: 'var(--c-surface)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentProfilePic;