import React, { useState } from 'react';
// NO CSS IMPORT - using only global theme.css

const Page3 = ({ user }) => {
  const [internships, setInternships] = useState([
    {
      id: 1,
      title: "Frontend Developer Intern",
      description: "Build web applications using React. Collaborate with design team and participate in code reviews.",
      skills: ["React", "JavaScript", "CSS", "Git"],
      duration: "3 months",
      deadline: "2026-06-30",
      languages: ["JavaScript", "HTML/CSS"],
      company: user?.name || "TechCorp",
      status: "hiring",
      archived: false
    },
    {
      id: 2,
      title: "Backend Developer Intern",
      description: "Develop RESTful APIs and work with databases. Implement authentication and authorization.",
      skills: ["Node.js", "Python", "MongoDB", "SQL"],
      duration: "4 months",
      deadline: "2026-07-15",
      languages: ["Python", "JavaScript", "SQL"],
      company: user?.name || "TechCorp",
      status: "hiring",
      archived: false
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingInternship, setViewingInternship] = useState(null);
  const [editingInternship, setEditingInternship] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [archivingId, setArchivingId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [],
    duration: '',
    deadline: '',
    languages: [],
    status: 'hiring'
  });
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const getStatusClass = (deadline, internshipStatus) => {
    if (internshipStatus === 'filled') return 'badge--green';
    if (isExpired(deadline)) return 'badge--red';
    if (isUrgent(deadline)) return 'badge--yellow';
    return 'badge--blue';
  };

  const getStatusText = (status) => {
    return status === 'hiring' ? '🔥 Currently Hiring' : '✅ Position Filled';
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addLanguage = () => {
    if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
      setFormData({
        ...formData,
        languages: [...formData.languages, languageInput.trim()]
      });
      setLanguageInput('');
    }
  };

  const removeLanguage = (languageToRemove) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(lang => lang !== languageToRemove)
    });
  };

  const openViewModal = (internship) => {
    setViewingInternship(internship);
    setIsViewModalOpen(true);
  };

  const openAddModal = () => {
    setEditingInternship(null);
    setFormData({
      title: '',
      description: '',
      skills: [],
      duration: '',
      deadline: '',
      languages: [],
      status: 'hiring'
    });
    setSkillInput('');
    setLanguageInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (internship) => {
    setEditingInternship(internship);
    setFormData({
      title: internship.title,
      description: internship.description,
      skills: [...internship.skills],
      duration: internship.duration,
      deadline: internship.deadline,
      languages: [...internship.languages],
      status: internship.status
    });
    setSkillInput('');
    setLanguageInput('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const openArchiveModal = (id) => {
    setArchivingId(id);
    setIsArchiveModalOpen(true);
  };

  const saveInternship = () => {
    if (editingInternship) {
      setInternships(internships.map(internship =>
        internship.id === editingInternship.id
          ? { ...formData, id: internship.id, company: user?.name || "TechCorp", archived: internship.archived }
          : internship
      ));
    } else {
      const newId = Math.max(...internships.map(i => i.id), 0) + 1;
      setInternships([...internships, {
        ...formData,
        id: newId,
        company: user?.name || "TechCorp",
        archived: false
      }]);
    }
    setIsModalOpen(false);
  };

  const deleteInternship = () => {
    setInternships(internships.filter(internship => internship.id !== deletingId));
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const archiveInternship = () => {
    setInternships(internships.map(internship =>
      internship.id === archivingId
        ? { ...internship, archived: true }
        : internship
    ));
    setIsArchiveModalOpen(false);
    setArchivingId(null);
  };

  const unarchiveInternship = (id) => {
    setInternships(internships.map(internship =>
      internship.id === id
        ? { ...internship, archived: false }
        : internship
    ));
  };

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesArchive = showArchived ? internship.archived === true : internship.archived === false;
    
    return matchesSearch && matchesArchive;
  });

  // Modal styles for scrolling
  const modalContentStyle = {
    maxHeight: '85vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  };

  const modalBodyStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--sp-6)'
  };

  return (
    <div className="page-container">
      <div>
        <div className="section-header">
          <h1 className="cm__heading">Internship Management</h1>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button 
              className={`btn-secondary ${showArchived ? 'active' : ''}`}
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? '📂 Show Active' : '🗄️ Show Archived'}
            </button>
            <button className="btn-primary" onClick={openAddModal}>
              ➕ Add Internship
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
          <div className="section-header">
            <h2>🔍 Search Internships</h2>
          </div>
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by title, description, or skills..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredInternships.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>📭</div>
            <h3>No internships found</h3>
            <p>{showArchived ? "No archived internships available." : "Click the 'Add Internship' button to create your first internship opportunity."}</p>
          </div>
        ) : (
          <div className="internships-grid">
            {filteredInternships.map(internship => (
              <div key={internship.id} className={`internship-card ${internship.archived ? 'archived-card' : ''}`}>
                <div className="internship-header">
                  <h3>{internship.title}</h3>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                    <span className={`badge ${getStatusClass(internship.deadline, internship.status)}`}>
                      {getStatusText(internship.status)}
                    </span>
                    <span className="badge">🏢 {internship.company}</span>
                  </div>
                </div>
                <div className="internship-meta">
                  <div className="description">{internship.description}</div>
                  
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>🛠️ Skills Required</label>
                    <div className="skills-list" style={{ marginTop: 'var(--sp-2)' }}>
                      {internship.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>💻 Programming Languages</label>
                    <div className="skills-list" style={{ marginTop: 'var(--sp-2)' }}>
                      {internship.languages.map((lang, idx) => (
                        <span key={idx} className="skill-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                  <div className="internship-meta">
                    <span>⏱️ Duration: {internship.duration}</span>
                    <span>📅 Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                    {!isExpired(internship.deadline) && !internship.archived && (
                      <span className={`badge ${isUrgent(internship.deadline) ? 'badge--yellow' : 'badge--blue'}`}>
                        {getDaysRemaining(internship.deadline)} days left
                      </span>
                    )}
                    {isExpired(internship.deadline) && !internship.archived && (
                      <span className="badge badge--red">
                        Deadline Passed
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => openViewModal(internship)}>
                    View
                  </button>
                  {!internship.archived && (
                    <>
                      <button className="edit-btn" onClick={() => openEditModal(internship)}>
                        Edit
                      </button>
                      <button className="btn-danger" onClick={() => openDeleteModal(internship.id)}>
                        Delete
                      </button>
                      {isExpired(internship.deadline) && (
                        <button className="btn-secondary" onClick={() => openArchiveModal(internship.id)}>
                          Archive
                        </button>
                      )}
                    </>
                  )}
                  {internship.archived && (
                    <>
                      <button className="btn-secondary" onClick={() => unarchiveInternship(internship.id)}>
                        Unarchive
                      </button>
                      <button className="btn-danger" onClick={() => openDeleteModal(internship.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Add/Edit - SCROLLABLE */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-header">
                <h2>{editingInternship ? 'Edit Internship' : 'Add New Internship'}</h2>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <div style={modalBodyStyle}>
                <div className="form-group">
                  <label>Internship Title <span>*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Frontend Developer Intern"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description / Responsibilities <span>*</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the internship responsibilities and requirements..."
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hiring Status <span>*</span></label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="hiring">🔥 Currently Hiring</option>
                    <option value="filled">✅ Position Filled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Skills Required</label>
                  <div className="skill-input-group">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="e.g., React, Python, Git"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button type="button" className="add-skill-btn" onClick={addSkill}>
                      Add Skill
                    </button>
                  </div>
                  <div className="skills-list">
                    {formData.skills.map((skill, idx) => (
                      <span key={idx} className="skill-item">
                        {skill}
                        <span className="remove-skill" onClick={() => removeSkill(skill)}>×</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Programming Languages</label>
                  <div className="skill-input-group">
                    <input
                      type="text"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      placeholder="e.g., JavaScript, Python, Java"
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                    />
                    <button type="button" className="add-skill-btn" onClick={addLanguage}>
                      Add Language
                    </button>
                  </div>
                  <div className="skills-list">
                    {formData.languages.map((lang, idx) => (
                      <span key={idx} className="skill-item">
                        {lang}
                        <span className="remove-skill" onClick={() => removeLanguage(lang)}>×</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Duration <span>*</span></label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 3 months, 6 months"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Application Deadline <span>*</span></label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={saveInternship}>
                    {editingInternship ? 'Update Internship' : 'Create Internship'}
                  </button>
                  <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - SCROLLABLE */}
        {isDeleteModalOpen && (
          <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-body" style={{ textAlign: 'center', ...modalBodyStyle }}>
                <div className="confirm-icon" style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>⚠️</div>
                <h3>Delete Internship</h3>
                <p>Are you sure you want to delete this internship? This action cannot be undone.</p>
                <div className="form-actions" style={{ justifyContent: 'center' }}>
                  <button className="btn-danger" onClick={deleteInternship}>
                    Delete
                  </button>
                  <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Archive Confirmation Modal - SCROLLABLE */}
        {isArchiveModalOpen && (
          <div className="modal-overlay" onClick={() => setIsArchiveModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-body" style={{ textAlign: 'center', ...modalBodyStyle }}>
                <div className="confirm-icon" style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>📦</div>
                <h3>Archive Internship</h3>
                <p>Are you sure you want to archive this internship? You can unarchive it later from the archived section.</p>
                <div className="form-actions" style={{ justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={archiveInternship}>
                    Archive
                  </button>
                  <button className="btn-secondary" onClick={() => setIsArchiveModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal - SCROLLABLE */}
        {isViewModalOpen && viewingInternship && (
          <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
              <div className="modal-header">
                <h2>👁️ Internship Details</h2>
                <button className="modal-close" onClick={() => setIsViewModalOpen(false)}>×</button>
              </div>
              <div style={modalBodyStyle}>
                <div className="form-group">
                  <strong>Title:</strong>
                  <p>{viewingInternship.title}</p>
                </div>
                <div className="form-group">
                  <strong>Company:</strong>
                  <p>{viewingInternship.company}</p>
                </div>
                <div className="form-group">
                  <strong>Description:</strong>
                  <p>{viewingInternship.description}</p>
                </div>
                <div className="form-group">
                  <strong>Status:</strong>
                  <span className={`badge ${getStatusClass(viewingInternship.deadline, viewingInternship.status)}`} style={{ marginLeft: '8px' }}>
                    {getStatusText(viewingInternship.status)}
                  </span>
                </div>
                <div className="form-group">
                  <strong>🛠️ Skills Required:</strong>
                  <div className="skills-list" style={{ marginTop: 'var(--sp-2)' }}>
                    {viewingInternship.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <strong>💻 Programming Languages:</strong>
                  <div className="skills-list" style={{ marginTop: 'var(--sp-2)' }}>
                    {viewingInternship.languages.map((lang, idx) => (
                      <span key={idx} className="skill-tag">{lang}</span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <strong>⏱️ Duration:</strong> {viewingInternship.duration}
                </div>
                <div className="form-group">
                  <strong>📅 Deadline:</strong> {new Date(viewingInternship.deadline).toLocaleDateString()}
                  {!isExpired(viewingInternship.deadline) && !viewingInternship.archived && (
                    <span className={`badge ${isUrgent(viewingInternship.deadline) ? 'badge--yellow' : 'badge--blue'}`} style={{ marginLeft: '10px' }}>
                      {getDaysRemaining(viewingInternship.deadline)} days left
                    </span>
                  )}
                  {isExpired(viewingInternship.deadline) && (
                    <span className="badge badge--red" style={{ marginLeft: '10px' }}>Deadline Passed</span>
                  )}
                </div>
                <div className="form-group">
                  <strong>Archive Status:</strong> {viewingInternship.archived ? '🗄️ Archived' : '✅ Active'}
                </div>
                <div className="form-actions">
                  {!viewingInternship.archived && (
                    <button className="edit-btn" onClick={() => { setIsViewModalOpen(false); openEditModal(viewingInternship); }}>
                      ✏️ Edit
                    </button>
                  )}
                  <button className="btn-secondary" onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page3;