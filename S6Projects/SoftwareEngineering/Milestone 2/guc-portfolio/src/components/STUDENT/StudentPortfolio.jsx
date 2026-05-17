import React, { useState, useEffect } from 'react';
import { USERS, COMPLETED_INTERNSHIPS, STUDENT_PROJECTS } from '../../data/Data';
// Storage key helper
const getStorageKey = (userId) => `student_projects_${userId}`;
const getBasicInfoKey = (userId) => `student_basic_info_${userId}`;

const StudentPortfolio = ({ user, onNavigateToProject }) => {
  const studentData = USERS[user.id] || {};
  const completedInternships = COMPLETED_INTERNSHIPS[user.id] || [];
  const initialProjects = STUDENT_PROJECTS[user.id] || [];
  
  // Load projects from localStorage with real-time sync
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem(getStorageKey(user.id));
    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = [...initialProjects];
      parsed.forEach(savedProject => {
        const index = merged.findIndex(p => p.id === savedProject.id);
        if (index !== -1) {
          merged[index] = { ...merged[index], ...savedProject };
        } else {
          merged.push(savedProject);
        }
      });
      return merged;
    }
    return initialProjects;
  });
  
  const visibleProjects = projects.filter(project => project.isVisibleOnPortfolio === true);
  const [activeTab, setActiveTab] = useState('featured');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    major: studentData.major || '',
    skills: studentData.skills || [],
    linkedIn: studentData.linkedIn || '',
    github: studentData.github || '',
    bio: studentData.bio || '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [showNotification, setShowNotification] = useState(null);
  
  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState(null);

  const showToast = (message, type = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const saveProjectsToStorage = (updatedProjects) => {
    localStorage.setItem(getStorageKey(user.id), JSON.stringify(updatedProjects));
    window.dispatchEvent(new CustomEvent('projectsUpdated', { 
      detail: { userId: user.id, projects: updatedProjects }
    }));
  };

  useEffect(() => {
    const savedInfo = localStorage.getItem(getBasicInfoKey(user.id));
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setFormData(prev => ({
          ...prev,
          major: parsed.major || '',
          skills: parsed.skills || [],
          linkedIn: parsed.linkedIn || '',
          github: parsed.github || '',
          bio: parsed.bio || '',
        }));
      } catch (e) {}
    }
  }, [user.id]);

  useEffect(() => {
    const handleProjectsUpdate = (event) => {
      if (event.detail.userId === user.id) {
        setProjects(event.detail.projects);
      }
    };
    
    window.addEventListener('projectsUpdated', handleProjectsUpdate);
    
    const handleStorageChange = (e) => {
      if (e.key === getStorageKey(user.id) && e.newValue) {
        setProjects(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user.id]);

  const togglePortfolioVisibility = (projectId) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        const newStatus = !project.isVisibleOnPortfolio;
        showToast(`"${project.title}" is now ${newStatus ? 'visible on' : 'hidden from'} your portfolio!`, newStatus ? 'success' : 'warning');
        return { ...project, isVisibleOnPortfolio: newStatus };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const handleProjectClick = (project) => {
    // Show modal with project details
    setSelectedProjectForModal(project);
    setShowProjectModal(true);
  };

  const updateField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !formData.skills.includes(skill)) {
      updateField('skills', [...formData.skills, skill]);
      setNewSkill('');
      showToast(`Skill "${skill}" added!`, 'success');
    }
  };

  const handleRemoveSkill = (skill) => {
    updateField('skills', formData.skills.filter(s => s !== skill));
    showToast(`Skill "${skill}" removed`, 'info');
  };

  const resetForm = () => {
    try {
      const savedInfo = localStorage.getItem(getBasicInfoKey(user.id));
      if (savedInfo) {
        const parsed = JSON.parse(savedInfo);
        setFormData({
          major: parsed.major || '',
          skills: parsed.skills || [],
          linkedIn: parsed.linkedIn || '',
          github: parsed.github || '',
          bio: parsed.bio || '',
        });
      } else {
        setFormData({
          major: studentData.major || '',
          skills: studentData.skills || [],
          linkedIn: studentData.linkedIn || '',
          github: studentData.github || '',
          bio: studentData.bio || '',
        });
      }
    } catch (e) {}
    setIsEditing(false);
  };

  const saveBasicInfo = () => {
    localStorage.setItem(getBasicInfoKey(user.id), JSON.stringify({
      major: formData.major,
      skills: formData.skills,
      linkedIn: formData.linkedIn,
      github: formData.github,
      bio: formData.bio,
    }));
    setIsEditing(false);
    showToast('Profile saved successfully!', 'success');
  };

  return (
    <div className="student-portfolio">
      {/* Modern Notification Toast */}
      {showNotification && (
        <div className={`notification-toast notification-${showNotification.type}`}>
          <div className="notification-icon">
            {showNotification.type === 'success' && '✓'}
            {showNotification.type === 'warning' && '⚠'}
            {showNotification.type === 'info' && 'ℹ'}
          </div>
          <div className="notification-message">{showNotification.message}</div>
          <button className="notification-close" onClick={() => setShowNotification(null)}>✕</button>
        </div>
      )}

      {/* Hero Section with LinkedIn and GitHub Links */}
      <div className="portfolio-hero">
        <div className="hero-content">
          <div className="hero-info">
            <h1 className="hero-name">{user.name}</h1>
            <p className="hero-email">{user.email}</p>
            {!isEditing && formData.major && <p className="hero-major">{formData.major}</p>}
            
            {!isEditing && formData.bio && <p className="hero-bio">{formData.bio}</p>}
          </div>
          <button 
            className={`edit-profile-btn ${isEditing ? 'editing' : ''}`}
            onClick={() => isEditing ? resetForm() : setIsEditing(true)}
          >
            {isEditing ? 'Cancel' : '✎ Edit Profile'}
          </button>
        </div>
      </div>

      {/* Edit Mode Panel */}
      {isEditing && (
        <div className="edit-panel">
          <div className="edit-panel-header">
            <h2>Edit Profile Information</h2>
            <button className="close-edit-btn" onClick={() => resetForm()}>×</button>
          </div>
          <form onSubmit={e => e.preventDefault()} className="edit-form">

            <div className="form-row">
              <div className="form-group">
                <label>Major / Field of Study</label>
                <input 
                  type="text" 
                  value={formData.major} 
                  onChange={e => updateField('major', e.target.value)} 
                  placeholder="e.g., Computer Science, Business Administration"
                />
              </div>
            </div>

            <div className="form-group">
              <label>LinkedIn Profile</label>
              <input 
                type="url" 
                value={formData.linkedIn} 
                onChange={e => updateField('linkedIn', e.target.value)} 
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label>Bio / About Me</label>
              <textarea 
                value={formData.bio} 
                onChange={e => updateField('bio', e.target.value)} 
                placeholder="Tell us about yourself, your interests, and career goals..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Skills & Technologies</label>
              <div className="skill-input-wrapper">
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)} 
                  placeholder="Add a skill (e.g., React, Python, Data Analysis)"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button type="button" className="add-skill-btn" onClick={handleAddSkill}>
                  + Add
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="skills-grid">
                  {formData.skills.map((skill, i) => (
                    <div key={i} className="skill-chip">
                      <span>{skill}</span>
                      <button type="button" className="remove-skill" onClick={() => handleRemoveSkill(skill)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="save-changes-btn" onClick={saveBasicInfo}>
                Save All Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--blue">🎯</div>
          <div className="stat-info">
            <div className="stat-value">{formData.skills.length}</div>
            <div className="stat-label">Skills</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--violet">📁</div>
          <div className="stat-info">
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--green">👁️</div>
          <div className="stat-info">
            <div className="stat-value">{visibleProjects.length}</div>
            <div className="stat-label">Public Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--yellow">💼</div>
          <div className="stat-info">
            <div className="stat-value">{completedInternships.length}</div>
            <div className="stat-label">Internships</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="portfolio-tabs">
        <button 
          className={`tab-btn ${activeTab === 'featured' ? 'active' : ''}`}
          onClick={() => setActiveTab('featured')}
        >
          🌟 Featured Projects
          {visibleProjects.length > 0 && <span className="tab-badge">{visibleProjects.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          ⚙️ Manage Visibility
          {projects.length > 0 && <span className="tab-badge">{projects.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'internships' ? 'active' : ''}`}
          onClick={() => setActiveTab('internships')}
        >
          💼 Completed Internships
          {completedInternships.length > 0 && <span className="tab-badge">{completedInternships.length}</span>}
        </button>
      </div>

      {/* Featured Projects Tab */}
      {activeTab === 'featured' && (
        <div className="tab-content">
          {visibleProjects.length > 0 ? (
            <div className="projects-grid">
              {visibleProjects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-card-inner">
                    <div className="project-header">
                      <h3>{project.title}</h3>
                      <span className="course-badge">{project.course}</span>
                    </div>
                    {project.description && (
                      <p className="project-description">{project.description.substring(0, 120)}...</p>
                    )}
                    <div className="project-tech">
                      {project.programmingLanguages?.slice(0, 3).map((lang, idx) => (
                        <span key={idx} className="tech-tag">{lang}</span>
                      ))}
                      {project.programmingLanguages?.length > 3 && (
                        <span className="tech-tag">+{project.programmingLanguages.length - 3}</span>
                      )}
                    </div>
                    {/* External Links - Always Clickable, Outside of Modal Trigger */}
                    <div className="external-links">
                      {project.githubLink && project.githubLink !== "N/A" && (
                        <a 
                          href={project.githubLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="external-link github-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="external-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                          </svg>
                          GitHub
                        </a>
                      )}
                      {project.demoVideo && project.demoVideo !== "N/A" && (
                        <a 
                          href={project.demoVideo} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="external-link demo-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="external-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                          Demo Video
                        </a>
                      )}
                    </div>
                    <div className="project-footer">
                      <span className="project-date">📅 {new Date(project.createdAt).toLocaleDateString()}</span>
                      <button 
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(project);
                        }}
                      >
                        Click to view details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-state-icon">👁️</div>
              <h3>No Visible Projects</h3>
              <p>Toggle projects to "Visible" in the Manage tab to showcase them here</p>
              <button className="empty-state-btn" onClick={() => setActiveTab('manage')}>
                Manage Projects →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manage Visibility Tab */}
      {activeTab === 'manage' && (
        <div className="tab-content">
          <div className="manage-header">
            <h2>Project Visibility Management</h2>
            <div className="visibility-stats">
              <div className="stat-chip visible">
                <span>👁️ Visible: {visibleProjects.length}</span>
              </div>
              <div className="stat-chip hidden">
                <span>👻 Hidden: {projects.length - visibleProjects.length}</span>
              </div>
            </div>
          </div>
          {projects.length > 0 ? (
            <div className="projects-list">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className={`project-list-item ${project.isVisibleOnPortfolio ? 'visible' : 'hidden'}`}
                >
                  <div className="project-info" onClick={() => handleProjectClick(project)}>
                    <div className="project-title-section">
                      <h3>{project.title}</h3>
                      <span className="project-course">{project.course}</span>
                    </div>
                    {project.programmingLanguages && project.programmingLanguages.length > 0 && (
                      <div className="project-tech-preview">
                        {project.programmingLanguages.slice(0, 2).map((lang, idx) => (
                          <span key={idx} className="tech-preview-tag">{lang}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="project-actions">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={project.isVisibleOnPortfolio}
                        onChange={() => togglePortfolioVisibility(project.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="visibility-status">
                      {project.isVisibleOnPortfolio ? '✓ Public' : '🔒 Private'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-state-icon">📁</div>
              <h3>No Projects Yet</h3>
              <p>Create your first project in the Projects tab!</p>
            </div>
          )}
        </div>
      )}

      {/* Internships Tab */}
      {activeTab === 'internships' && (
        <div className="tab-content">
          {completedInternships.length > 0 ? (
            <div className="internships-grid">
              {completedInternships.map((internship) => (
                <div key={internship.id} className="internship-card">
                  <div className="internship-icon">💼</div>
                  <div className="internship-content">
                    <h3>{internship.title}</h3>
                    <div className="internship-details">
                      <span className="detail-badge">🏢 {internship.companyId}</span>
                      <span className="detail-badge">⏱️ {internship.duration}</span>
                    </div>
                    {internship.description && (
                      <p className="internship-description">{internship.description}</p>
                    )}
                    <div className="internship-footer">
                      <span className="completion-date">✅ Completed: {new Date(internship.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-card">
              <div className="empty-state-icon">📋</div>
              <h3>No Completed Internships</h3>
              <p>Once you complete an internship, it will appear here automatically</p>
            </div>
          )}
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectModal && selectedProjectForModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Project Details</h2>
              <button className="modal-close" onClick={() => setShowProjectModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="info-item">
                <label>Project Title:</label>
                <p><strong>{selectedProjectForModal.title}</strong></p>
              </div>
              <div className="info-item">
                <label>Course:</label>
                <p>{selectedProjectForModal.course}</p>
              </div>
              {selectedProjectForModal.description && (
                <div className="info-item">
                  <label>Description:</label>
                  <p>{selectedProjectForModal.description}</p>
                </div>
              )}
              
              {/* GitHub and LinkedIn Links in Modal */}
              {(formData.github || formData.linkedIn) && (
                <div className="info-item">
                  <label>Profile Links:</label>
                  <div className="modal-links">
                    {formData.github && (
                      <a href={formData.github} target="_blank" rel="noopener noreferrer" className="modal-link">
                        <span>📂</span> GitHub Profile
                      </a>
                    )}
                    {formData.linkedIn && (
                      <a href={formData.linkedIn} target="_blank" rel="noopener noreferrer" className="modal-link">
                        <span>🔗</span> LinkedIn Profile
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              <div className="info-item">
                <label>Project GitHub Link:</label>
                {selectedProjectForModal.githubLink && selectedProjectForModal.githubLink !== "N/A" ? (
                  <a href={selectedProjectForModal.githubLink} target="_blank" rel="noopener noreferrer" className="modal-link">
                    {selectedProjectForModal.githubLink}
                  </a>
                ) : (
                  <p className="na-text">Not provided</p>
                )}
              </div>
              <div className="info-item">
                <label>Demo Video:</label>
                {selectedProjectForModal.demoVideo && selectedProjectForModal.demoVideo !== "N/A" ? (
                  <a href={selectedProjectForModal.demoVideo} target="_blank" rel="noopener noreferrer" className="modal-link">
                    {selectedProjectForModal.demoVideo}
                  </a>
                ) : (
                  <p className="na-text">Not provided</p>
                )}
              </div>
              <div className="info-item">
                <label>Programming Languages:</label>
                <div className="modal-skills-list">
                  {selectedProjectForModal.programmingLanguages?.length > 0 ? (
                    selectedProjectForModal.programmingLanguages.map((lang, index) => (
                      <span key={index} className="modal-skill-tag">{lang}</span>
                    ))
                  ) : (
                    <p className="na-text">No languages specified</p>
                  )}
                </div>
              </div>
              <div className="info-item">
                <label>Created At:</label>
                <p>{new Date(selectedProjectForModal.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="info-item">
                <label>Portfolio Status:</label>
                <p className={selectedProjectForModal.isVisibleOnPortfolio ? 'status-public' : 'status-private'}>
                  {selectedProjectForModal.isVisibleOnPortfolio ? '✓ Visible on Portfolio' : '🔒 Hidden from Portfolio'}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowProjectModal(false)} className="modal-close-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .student-portfolio {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 1rem 2rem;
          min-height: auto;
          overflow-y: auto;
        }

        /* Notification Toast */
        .notification-toast {
          position: fixed;
          top: 80px;
          right: 24px;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: var(--c-surface);
          border-radius: var(--r-lg);
          box-shadow: var(--sh-xl);
          animation: slideInRight 0.3s ease;
          border-left: 4px solid;
          backdrop-filter: blur(8px);
        }
        .notification-success { border-left-color: var(--c-green); }
        .notification-warning { border-left-color: var(--c-yellow); }
        .notification-info { border-left-color: var(--c-primary); }
        .notification-icon { font-size: 1.25rem; font-weight: 600; }
        .notification-success .notification-icon { color: var(--c-green); }
        .notification-warning .notification-icon { color: var(--c-yellow); }
        .notification-info .notification-icon { color: var(--c-primary); }
        .notification-message { flex: 1; font-size: 0.875rem; color: var(--c-text); }
        .notification-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: var(--c-muted);
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--r-full);
          transition: all var(--t-fast);
        }
        .notification-close:hover {
          background: var(--c-red-bg);
          color: #fca5a5;
        }

        /* Hero Section */
        .portfolio-hero {
          background: var(--c-surface);
          border: 1px solid var(--c-border-strong);
          border-radius: var(--r-2xl);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .hero-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .hero-info {
          flex: 1;
          min-width: 200px;
        }
        .hero-name {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.25rem, 4vw, 1.75rem);
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--c-text);
        }
        .hero-email {
          margin: 0 0 0.5rem 0;
          color: var(--c-text-2);
          font-size: clamp(0.75rem, 2vw, 0.875rem);
          word-break: break-word;
        }
        .hero-major {
          margin: 0.25rem 0 0 0;
          color: #93c5fd;
          font-size: clamp(0.7rem, 2vw, 0.8rem);
          font-weight: 600;
        }
        
        .hero-bio {
          margin: 0.5rem 0 0 0;
          color: var(--c-text-2);
          line-height: 1.6;
          font-size: clamp(0.75rem, 2vw, 0.875rem);
        }
        .edit-profile-btn {
          background: var(--c-primary-light);
          border: 1px solid var(--c-primary-mid);
          color: #93c5fd;
          padding: 0.75rem 1.5rem;
          border-radius: var(--r-lg);
          cursor: pointer;
          font-weight: 600;
          transition: all var(--t-base);
          white-space: nowrap;
          font-size: clamp(0.75rem, 2vw, 0.875rem);
        }
        .edit-profile-btn:hover {
          background: var(--c-primary-mid);
          transform: translateY(-2px);
        }
        .edit-profile-btn.editing {
          background: var(--c-red-bg);
          border-color: rgba(239,68,68,0.25);
          color: #fca5a5;
        }

        /* Edit Panel */
        .edit-panel {
          background: var(--c-surface);
          border: 1px solid var(--c-border-strong);
          border-radius: var(--r-2xl);
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--sh-md);
        }
        .edit-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--c-border);
          flex-wrap: wrap;
          gap: 1rem;
        }
        .edit-panel-header h2 {
          margin: 0;
          font-size: clamp(1rem, 3vw, 1.25rem);
          color: var(--c-text);
          font-family: 'Sora', sans-serif;
        }
        .close-edit-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--c-muted);
          width: 32px;
          height: 32px;
          border-radius: var(--r-full);
          transition: all var(--t-fast);
        }
        .close-edit-btn:hover {
          background: var(--c-red-bg);
          color: #fca5a5;
        }

        /* Profile Picture Edit Section */
        .profile-pic-edit {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .current-avatar-preview {
          width: 80px;
          height: 80px;
        }
        .upload-hint {
          font-size: 0.75rem;
          color: var(--c-muted);
          margin: 0;
        }

        /* Form Elements */
        .edit-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-row { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 1rem; 
        }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label {
          font-weight: 600;
          color: var(--c-text-2);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid var(--c-border-strong);
          border-radius: var(--r-md);
          background: var(--c-surface-2);
          color: var(--c-text);
          font-size: 0.875rem;
          transition: all var(--t-fast);
          width: 100%;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--c-primary);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .skill-input-wrapper { 
          display: flex; 
          gap: 0.5rem; 
          flex-wrap: wrap;
        }
        .skill-input-wrapper input { flex: 1; min-width: 150px; }
        .add-skill-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--c-primary), var(--c-accent-dark));
          color: white;
          border: none;
          border-radius: var(--r-md);
          cursor: pointer;
          font-weight: 600;
          transition: all var(--t-fast);
          white-space: nowrap;
        }
        .add-skill-btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--sh-glow);
        }
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .skill-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--c-primary-light);
          border: 1px solid var(--c-primary-mid);
          border-radius: var(--r-full);
          font-size: 0.8rem;
          color: #93c5fd;
        }
        .remove-skill {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--c-muted);
          font-size: 1rem;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--r-full);
          transition: all var(--t-fast);
        }
        .remove-skill:hover {
          background: var(--c-red-bg);
          color: #fca5a5;
        }
        .form-actions { display: flex; justify-content: flex-end; }
        .save-changes-btn {
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, var(--c-green), #059669);
          color: white;
          border: none;
          border-radius: var(--r-md);
          cursor: pointer;
          font-weight: 600;
          transition: all var(--t-fast);
        }
        .save-changes-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-xl);
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all var(--t-base);
        }
        .stat-card:hover {
          border-color: var(--c-border-strong);
          box-shadow: var(--sh-md);
          transform: translateY(-2px);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--r-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .stat-icon--blue { background: var(--c-blue-bg); color: #93c5fd; }
        .stat-icon--violet { background: var(--c-violet-bg); color: #c4b5fd; }
        .stat-icon--green { background: var(--c-green-bg); color: #6ee7b7; }
        .stat-icon--yellow { background: var(--c-yellow-bg); color: #fcd34d; }
        .stat-info { flex: 1; min-width: 0; }
        .stat-value {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.25rem, 4vw, 1.5rem);
          font-weight: 700;
          color: var(--c-text);
          line-height: 1;
        }
        .stat-label {
          font-size: 0.7rem;
          color: var(--c-muted);
          margin-top: 4px;
        }

        /* Tabs */
        .portfolio-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--c-border);
          padding-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        .tab-btn {
          padding: 0.6rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: clamp(0.75rem, 2.5vw, 0.9rem);
          font-weight: 600;
          color: var(--c-text-2);
          transition: all var(--t-fast);
          position: relative;
          border-radius: var(--r-md);
          white-space: nowrap;
        }
        .tab-btn:hover {
          color: #93c5fd;
          background: var(--c-primary-light);
        }
        .tab-btn.active {
          color: #93c5fd;
          background: var(--c-primary-light);
        }
        .tab-badge {
          display: inline-block;
          background: var(--c-surface-2);
          color: var(--c-text-2);
          padding: 0.125rem 0.5rem;
          border-radius: var(--r-full);
          font-size: 0.65rem;
          margin-left: 0.5rem;
        }
        .tab-btn.active .tab-badge {
          background: var(--c-primary-mid);
          color: #93c5fd;
        }

        /* Tab Content */
        .tab-content { animation: fadeIn 0.3s ease; }

        /* Projects Grid */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .project-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 280px;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-xl);
          overflow: hidden;
          transition: all var(--t-base);
        }
        .project-card:hover {
          border-color: var(--c-primary-mid);
          box-shadow: var(--sh-md);
          transform: translateY(-2px);
        }
        .project-card-inner { padding: 1.25rem; }
        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .project-header h3 {
          margin: 0;
          font-size: clamp(0.9rem, 3vw, 1.1rem);
          color: var(--c-text);
          font-family: 'Sora', sans-serif;
        }
        .course-badge {
          background: var(--c-primary-light);
          color: #93c5fd;
          padding: 0.25rem 0.75rem;
          border-radius: var(--r-full);
          font-size: 0.65rem;
          font-weight: 600;
          border: 1px solid var(--c-primary-mid);
          white-space: nowrap;
        }
        .project-description {
          color: var(--c-text-2);
          font-size: 0.8rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }
        .project-tech {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: 1.2rem;
        }
        .tech-tag {
          background: var(--c-surface-2);
          color: var(--c-text-2);
          padding: 0.3rem 0.7rem;
          border-radius: var(--r-full);
          font-size: 0.75rem;
          border: 1px solid var(--c-border);
        }
        
        /* External Links Section - Always Clickable */
        .external-links {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .external-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: var(--r-full);
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--t-fast);
          cursor: pointer;
        }
        .external-link.github-link {
          background: rgba(36, 41, 46, 0.9);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .external-link.github-link:hover {
          background: #24292e;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .external-link.demo-link {
          background: rgba(36, 41, 46, 0.9);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .external-link.demo-link:hover {
          background: #24292e;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .external-icon {
          width: 14px;
          height: 14px;
          stroke: currentColor;
        }
        
        .project-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          margin-top: 0.5rem;
          border-top: 1px solid var(--c-border);
          font-size: 0.75rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .project-date { color: var(--c-muted); min-width: 0; }
        .view-details-btn {
          background: none;
          border: none;
          color: #93c5fd;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          transition: opacity var(--t-fast);
          white-space: nowrap;
        }
        .view-details-btn:hover {
          opacity: 0.88;
          text-decoration: underline;
        }

        /* Manage Projects */
        .manage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .manage-header h2 {
          margin: 0;
          font-size: clamp(0.9rem, 3vw, 1.1rem);
          color: var(--c-text);
          font-family: 'Sora', sans-serif;
        }
        .visibility-stats { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .stat-chip {
          padding: 0.4rem 0.8rem;
          border-radius: var(--r-full);
          font-size: 0.7rem;
          font-weight: 500;
        }
        .stat-chip.visible { background: var(--c-green-bg); color: #6ee7b7; }
        .stat-chip.hidden { background: var(--c-surface-2); color: var(--c-muted); }
        .projects-list { display: flex; flex-direction: column; gap: 1rem; }
        .project-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--c-surface);
          border-radius: var(--r-lg);
          transition: all var(--t-base);
          border: 1px solid var(--c-border);
          flex-wrap: wrap;
          gap: 1rem;
        }
        .project-list-item.visible { border-left: 3px solid var(--c-green); }
        .project-list-item.hidden { border-left: 3px solid var(--c-muted); opacity: 0.7; }
        .project-info { flex: 1; cursor: pointer; min-width: 150px; }
        .project-title-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
          flex-wrap: wrap;
        }
        .project-title-section h3 { margin: 0; font-size: 0.9rem; color: var(--c-text); }
        .project-course { font-size: 0.65rem; color: var(--c-muted); }
        .project-tech-preview { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .tech-preview-tag { font-size: 0.65rem; color: var(--c-text-2); }
        .project-actions { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
        .visibility-status { font-size: 0.7rem; font-weight: 500; }

        /* Toggle Switch */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
          flex-shrink: 0;
        }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--c-surface-3);
          transition: 0.3s;
          border-radius: 24px;
          border: 1px solid var(--c-border);
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 2px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }
        input:checked + .toggle-slider { background-color: var(--c-green); }
        input:checked + .toggle-slider:before { transform: translateX(22px); }

        /* Internships Grid */
        .internships-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .internship-card {
          display: flex;
          gap: 1rem;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-xl);
          padding: 1.25rem;
          transition: all var(--t-base);
        }
        .internship-card:hover {
          border-color: var(--c-primary-mid);
          transform: translateY(-2px);
          box-shadow: var(--sh-md);
        }
        .internship-icon { font-size: 1.75rem; flex-shrink: 0; }
        .internship-content { flex: 1; min-width: 0; }
        .internship-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: clamp(0.9rem, 3vw, 1rem);
          color: var(--c-text);
        }
        .internship-details { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
        .detail-badge {
          background: var(--c-surface-2);
          padding: 0.2rem 0.6rem;
          border-radius: var(--r-full);
          font-size: 0.65rem;
          color: var(--c-text-2);
          border: 1px solid var(--c-border);
        }
        .internship-description {
          color: var(--c-text-2);
          font-size: 0.8rem;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .internship-footer { padding-top: 0.75rem; border-top: 1px solid var(--c-border); }
        .completion-date { font-size: 0.65rem; color: var(--c-green); font-weight: 500; }

        /* Empty State */
        .empty-state-card {
          text-align: center;
          padding: 3rem 1.5rem;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-2xl);
        }
        .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-state-card h3 {
          margin: 0 0 0.5rem 0;
          color: var(--c-text);
          font-family: 'Sora', sans-serif;
          font-size: clamp(1rem, 3vw, 1.2rem);
        }
        .empty-state-card p { color: var(--c-text-2); margin-bottom: 1.5rem; font-size: 0.8rem; }
        .empty-state-btn {
          padding: 0.6rem 1.2rem;
          background: linear-gradient(135deg, var(--c-primary), var(--c-accent-dark));
          color: white;
          border: none;
          border-radius: var(--r-md);
          cursor: pointer;
          font-weight: 600;
          transition: all var(--t-fast);
          font-size: 0.8rem;
        }
        .empty-state-btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--sh-glow);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }
        .modal-content {
          background: var(--c-surface);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--r-2xl);
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
          animation: fadeIn 0.25s ease;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: transparent;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--c-text);
          font-family: 'Sora', sans-serif;
        }
        .modal-close {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--c-text);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--r-full);
          transition: all var(--t-fast);
        }
        .modal-close:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
        }
        .modal-body {
          padding: 1.5rem;
          background: transparent;
        }
        .info-item {
          margin-bottom: 1.2rem;
          display: grid;
          gap: 0.55rem;
        }
        .info-item:last-child {
          margin-bottom: 0;
        }
        .info-item label {
          display: block;
          font-weight: 700;
          color: var(--c-text-2);
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0;
        }
        .info-item p {
          margin: 0;
          color: var(--c-text);
          font-size: 0.95rem;
          line-height: 1.65;
          word-break: break-word;
        }
        .info-item .na-text {
          color: var(--c-muted);
          font-style: italic;
        }
        .modal-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }
        .modal-link {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.5rem;
          width: 100%;
          color: #93c5fd;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all var(--t-fast);
          word-break: break-all;
          padding: 0.85rem 1rem;
          background: rgba(148, 163, 184, 0.08);
          border-radius: var(--r-lg);
          border: 1px solid rgba(148, 163, 184, 0.16);
        }
        .modal-link:hover {
          background: rgba(59, 130, 246, 0.16);
          color: #eff6ff;
          text-decoration: none;
          transform: translateY(-1px);
        }
        .modal-skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.4rem;
        }
        .modal-skill-tag {
          background: rgba(148, 163, 184, 0.12);
          color: #93c5fd;
          padding: 0.35rem 0.85rem;
          border-radius: var(--r-full);
          font-size: 0.76rem;
          border: 1px solid rgba(148, 163, 184, 0.16);
        }
        .status-public {
          color: #6ee7b7;
        }
        .status-private {
          color: var(--c-muted);
        }
        .modal-actions {
          padding: 1rem 1.5rem 1.5rem;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: transparent;
        }
        .modal-close-btn {
          padding: 0.75rem 1.45rem;
          background: rgba(59, 130, 246, 0.95);
          color: white;
          border: none;
          border-radius: var(--r-lg);
          cursor: pointer;
          font-weight: 700;
          letter-spacing: 0.02em;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .modal-close-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 36px rgba(59, 130, 246, 0.28);
        }
        @media (max-width: 640px) {
          .modal-content {
            width: 100%;
            max-height: 95vh;
          }
        }

        /* Animations */
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .student-portfolio {
            padding: 0.75rem;
          }
          .portfolio-hero {
            padding: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .student-portfolio {
            padding: 0.75rem 0.75rem 1.5rem;
          }
          .hero-content {
            flex-direction: column;
            text-align: center;
          }
          .hero-info {
            text-align: center;
          }
          .edit-profile-btn {
            width: 100%;
            max-width: 220px;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .projects-grid,
          .internships-grid {
            grid-template-columns: 1fr;
          }
          .project-card {
            min-height: auto;
          }
          .project-card-inner {
            padding: 1.35rem;
          }
          .project-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .view-details-btn {
            width: auto;
            margin-top: 0.3rem;
          }
          .external-links {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .project-list-item {
            flex-direction: column;
            text-align: center;
          }
          .project-title-section {
            justify-content: center;
          }
          .project-info {
            text-align: center;
          }
          .project-tech-preview {
            justify-content: center;
          }
          .portfolio-tabs {
            overflow-x: auto;
            flex-wrap: nowrap;
            justify-content: flex-start;
          }
          .tab-btn {
            white-space: nowrap;
          }
          .modal-content {
            width: 95%;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .stat-card {
            padding: 0.75rem;
          }
          .stat-icon {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }
          .edit-panel {
            padding: 1rem;
          }
          .skill-input-wrapper {
            flex-direction: column;
          }
          .add-skill-btn {
            width: 100%;
          }
          .project-card-inner {
            padding: 1rem;
          }
          .internship-card {
            flex-direction: column;
            text-align: center;
          }
          .internship-icon {
            margin: 0 auto;
          }
          .internship-details {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentPortfolio;