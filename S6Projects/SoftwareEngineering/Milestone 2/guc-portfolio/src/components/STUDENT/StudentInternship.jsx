import React, { useState, useMemo } from 'react';
import { INTERNSHIPS, USERS } from '../../data/Data';


const StudentInternship = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [viewingInternship, setViewingInternship] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [coverLetterError, setCoverLetterError] = useState('');
  const [appliedInternships, setAppliedInternships] = useState({});
  const [notifications, setNotifications] = useState([]);

  const companies = useMemo(() => [...new Set(INTERNSHIPS.map(i => USERS[i.employerId]?.companyName || i.employerId))], []);
  const durations = useMemo(() => [...new Set(INTERNSHIPS.map(i => i.duration))], []);

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isUrgent = (deadline) => {
    const days = getDaysRemaining(deadline);
    return days > 0 && days <= 7;
  };

  const isExpired = (deadline) => {
    return getDaysRemaining(deadline) < 0;
  };

  const filteredInternships = useMemo(() => {
    const filtered = INTERNSHIPS.filter(internship => {
      const companyName = USERS[internship.employerId]?.companyName || internship.employerId;
      const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) || companyName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && (!filterCompany || companyName === filterCompany) && (!filterDuration || internship.duration === filterDuration);
    });
    return filtered.sort((a, b) => {
      const [dateA, dateB] = [new Date(a.postedAt || a.deadline), new Date(b.postedAt || b.deadline)];
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [searchQuery, filterCompany, filterDuration, sortOrder]);

  const handleViewClick = (internship) => {
    setViewingInternship(internship);
    setShowViewModal(true);
  };

  const handleApplyClick = (internship) => {
    if (appliedInternships[internship.id]) return alert('You have already applied for this internship');
    setSelectedInternship(internship);
    setCoverLetter('');
    setCoverLetterError('');
    setShowApplyModal(true);
  };

  const handleSubmitApplication = () => {
    const wordCount = coverLetter.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 20) return setCoverLetterError(`Need ${20 - wordCount} more words`);
    setCoverLetterError('');
    setAppliedInternships({
      ...appliedInternships,
      [selectedInternship.id]: { coverLetter, status: 'pending', appliedAt: new Date().toISOString() }
    });
    const notification = {
      id: Date.now(),
      type: Math.random() > 0.5 ? 'accepted' : 'rejected',
      internshipId: selectedInternship.id,
      internshipTitle: selectedInternship.title,
      companyName: USERS[selectedInternship.employerId]?.companyName || 'Unknown Company',
      timestamp: new Date().toISOString(),
    };
    setTimeout(() => setNotifications(prev => [notification, ...prev]), 2000);
    setShowApplyModal(false);
  };

  const handleCloseModal = () => {
    setShowApplyModal(false);
    setCoverLetter('');
    setCoverLetterError('');
    setSelectedInternship(null);
  };

  const handleDismissNotification = (notificationId) => setNotifications(notifications.filter(n => n.id !== notificationId));

  // Page 3 style button classes
  const getStatusClass = (deadline, internshipStatus) => {
    if (internshipStatus === 'filled') return 'badge--green';
    if (isExpired(deadline)) return 'badge--red';
    if (isUrgent(deadline)) return 'badge--yellow';
    return 'badge--blue';
  };

  const getStatusText = (status) => {
    return status === 'hiring' ? '🔥 Currently Hiring' : '✅ Position Filled';
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="cm__heading">Find Internships</h1>
      </div>

      {/* Notifications */}
      <div className="notifications-container" style={{ marginBottom: 'var(--sp-5)' }}>
        {notifications.map(notification => (
          <div key={notification.id} className={`notification notification-${notification.type}`}>
            <div className="notification-content">
              <span className="notification-icon">{notification.type === 'accepted' ? '✓' : '✗'}</span>
              <div className="notification-text">
                <strong>{notification.type === 'accepted' ? 'Congratulations!' : 'Application Status'}</strong>
                <p>{notification.type === 'accepted' ? `You have been accepted for ${notification.internshipTitle} at ${notification.companyName}!` : `Unfortunately, your application for ${notification.internshipTitle} at ${notification.companyName} was not selected at this time.`}</p>
              </div>
              <button className="notification-close" onClick={() => handleDismissNotification(notification.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Search Section - YOUR ORIGINAL SEARCH AND FILTERS */}
      <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="search-bar">
          <input type="text" placeholder="🔍 Search by internship title or company name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Company:</label>
            <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)} className="filter-select">
              <option value="">All Companies</option>
              {companies.map(company => <option key={company} value={company}>{company}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Duration:</label>
            <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)} className="filter-select">
              <option value="">All Durations</option>
              {durations.map(duration => <option key={duration} value={duration}>{duration}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <button className="clear-filters-btn" onClick={() => { setSearchQuery(''); setFilterCompany(''); setFilterDuration(''); setSortOrder('newest'); }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info" style={{ marginBottom: 'var(--sp-5)' }}>
        <p>Found <strong>{filteredInternships.length}</strong> internship{filteredInternships.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Internships Grid - Styled like Page 3 */}
      {filteredInternships.length > 0 ? (
        <div className="internships-grid">
          {filteredInternships.map(internship => {
            const companyName = USERS[internship.employerId]?.companyName || 'Unknown Company';
            const isAppliedForThis = appliedInternships[internship.id];
            const isDeadlineExpired = isExpired(internship.deadline);
            
            return (
              <div key={internship.id} className="internship-card">
                <div className="internship-header">
                  <h3>{internship.title}</h3>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    <span className={`badge ${getStatusClass(internship.deadline, internship.status)}`}>
                      {getStatusText(internship.status)}
                    </span>
                    <span className="badge">🏢 {companyName}</span>
                  </div>
                </div>
                <div className="internship-meta">
                  <div className="description">{internship.details}</div>
                  
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>🛠️ Skills Required</label>
                    <div className="skills-list" style={{ marginTop: 'var(--sp-2)' }}>
                      {internship.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="internship-meta" style={{ marginTop: 'var(--sp-3)' }}>
                    <span>⏱️ Duration: {internship.duration}</span>
                    <span>📅 Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                    {!isDeadlineExpired && !internship.archived && (
                      <span className={`badge ${isUrgent(internship.deadline) ? 'badge--yellow' : 'badge--blue'}`}>
                        {getDaysRemaining(internship.deadline)} days left
                      </span>
                    )}
                    {isDeadlineExpired && (
                      <span className="badge badge--red">
                        Deadline Passed
                      </span>
                    )}
                    <span>📢 Posted: {new Date(internship.postedAt || internship.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => handleViewClick(internship)}>
                     View Details
                  </button>
                  {isAppliedForThis ? (
                    <button className="applied-btn" disabled>✓ Applied</button>
                  ) : (
                    <button 
                      className="apply-btn" 
                      onClick={() => handleApplyClick(internship)} 
                      disabled={internship.status === 'filled' || isDeadlineExpired}
                    >
                      {internship.status === 'filled' ? 'Position Filled' : isDeadlineExpired ? 'Deadline Passed' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>😔 No internships found</p>
          <p className="empty-state-subtitle">Try adjusting your search or filters</p>
        </div>
      )}

      {/* View Internship Modal - Styled with theme */}
{showViewModal && viewingInternship && (
  <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '100%' }}>
      <div className="modal-header">
        <h2> Internship Details</h2>
        <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
      </div>
      <div className="modal-body">
        {/* Two-column layout for better organization */}
        <div className="internship-details-grid">
          {/* Left column */}
          <div className="details-column">
            <div className="info-group">
              <div className="info-item">
                <label>Position Title</label>
                <p className="info-value">{viewingInternship.title}</p>
              </div>
              
              <div className="info-item">
                <label>Company</label>
                <p className="info-value">{USERS[viewingInternship.employerId]?.companyName || 'Unknown Company'}</p>
              </div>
              
              <div className="info-item">
                <label>Status</label>
                <p className="info-value">
                  <span className={`badge ${viewingInternship.status === 'filled' ? 'badge--green' : 'badge--blue'}`}>
                    {viewingInternship.status === 'filled' ? '✅ Position Filled' : '🔥 Currently Hiring'}
                  </span>
                </p>
              </div>
              
              <div className="info-item">
                <label>Duration</label>
                <p className="info-value">{viewingInternship.duration}</p>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="details-column">
            <div className="info-group">
              <div className="info-item">
                <label>Application Deadline</label>
                <p className="info-value">
                  {new Date(viewingInternship.deadline).toLocaleDateString()}
                  {!isExpired(viewingInternship.deadline) && !viewingInternship.archived && (
                    <span className={`badge ${isUrgent(viewingInternship.deadline) ? 'badge--yellow' : 'badge--blue'}`} style={{ marginLeft: '10px' }}>
                      {getDaysRemaining(viewingInternship.deadline)} days left
                    </span>
                  )}
                  {isExpired(viewingInternship.deadline) && (
                    <span className="badge badge--red" style={{ marginLeft: '10px' }}>Deadline Passed</span>
                  )}
                </p>
              </div>
              
              <div className="info-item">
                <label>Posted On</label>
                <p className="info-value">{new Date(viewingInternship.postedAt || viewingInternship.deadline).toLocaleDateString()}</p>
              </div>
              
              <div className="info-item">
                <label>Skills Required</label>
                <div className="skills-list">
                  {viewingInternship.skills?.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description section - full width */}
        <div className="description-section">
          <div className="info-item">
            <label>Description</label>
            <p className="description-text">{viewingInternship.details}</p>
          </div>
        </div>
      </div>
      <div className="modal-actions">
        {!appliedInternships[viewingInternship.id] && viewingInternship.status !== 'filled' && !isExpired(viewingInternship.deadline) && (
          <button 
            className="btn-primary" 
            onClick={() => {
              setShowViewModal(false);
              handleApplyClick(viewingInternship);
            }}
          >
            Apply Now
          </button>
        )}
        <button className="btn-secondary" onClick={() => setShowViewModal(false)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}

    {/* Apply Modal - Styled with theme */}
    {showApplyModal && selectedInternship && (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '100%' }}>
          <div className="modal-header">
            <h2>📝 Apply for Internship</h2>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>
          </div>
          <div className="modal-body">
            {/* Internship info card */}
            <div className="application-info-card">
              <div className="application-info-header">
                <h3>{selectedInternship.title}</h3>
                <p className="company-detail">🏢 {USERS[selectedInternship.employerId]?.companyName || 'Unknown Company'}</p>
              </div>
            </div>
            
            {/* Cover letter form */}
            <div className="form-group">
              <label>Cover Letter <span className="required-star">*</span></label>
              <textarea 
                value={coverLetter} 
                onChange={(e) => { setCoverLetter(e.target.value); setCoverLetterError(''); }} 
                placeholder="Write a short cover letter explaining why you think you're a great fit for this role (minimum 20 words)..."
                rows="6"
              />
              {coverLetterError && <div className="error-message">{coverLetterError}</div>}
              <div className="word-count">
                <span className={`word-count-text ${coverLetter.trim().split(/\s+/).filter(word => word.length > 0).length >= 20 ? 'valid' : 'invalid'}`}>
                  📝 {coverLetter.trim().split(/\s+/).filter(word => word.length > 0).length}/20 words minimum
                  {coverLetter.trim().split(/\s+/).filter(word => word.length > 0).length < 20 && 
                    ` (need ${20 - coverLetter.trim().split(/\s+/).filter(word => word.length > 0).length} more)`
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={handleSubmitApplication}>
              Submit Application
            </button>
            <button className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default StudentInternship;