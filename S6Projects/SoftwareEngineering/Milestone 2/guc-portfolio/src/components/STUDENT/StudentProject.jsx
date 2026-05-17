import React, { useState, useMemo, useEffect } from 'react';
import { STUDENT_PROJECTS, COURSES } from '../../data/Data.js';
import { 
  SAMPLE_THESIS_DRAFTS, 
  SAMPLE_FINAL_DRAFTS, 
  SAMPLE_COLLABORATORS, 
  SAMPLE_INVITATIONS, 
  SAMPLE_TASKS, 
  SAMPLE_PROJECT_COMMENTS, 
  SAMPLE_FLAGGED_PROJECTS} from '../../data/Data.js';
import '../styles/sideStyles.css';
import '../styles/AdminDashboard.css';

const StudentProject = ({ user, highlightProject = null }) => {
  const userId = user.id;
  const [showSetFinalConfirm, setShowSetFinalConfirm] = useState(false);
const [showUnsetFinalConfirm, setShowUnsetFinalConfirm] = useState(false);
const [draftToSetFinal, setDraftToSetFinal] = useState(null);
const [draftToUnsetFinal, setDraftToUnsetFinal] = useState(null);

  // Sample projects where the current student is a COLLABORATOR (not creator)
  const SAMPLE_COLLABORATOR_PROJECTS = [
    {
      id: 9001,
      title: 'AI Chatbot Platform',
      course: 'Web Development',
      githubLink: 'https://github.com/sample/ai-chatbot',
      programmingLanguages: ['Python', 'React'],
      demoVideo: '',
      projectReport: 'N/A',
      createdAt: '2025-10-01',
      visibility: 'public',
      isVisibleOnPortfolio: false,
      creatorId: 9999,
      creatorName: 'Ahmed Hassan',
      isCollaboratorProject: true
    },
    {
      id: 9002,
      title: 'E-Commerce Dashboard',
      course: 'Web Development',
      githubLink: 'https://github.com/sample/ecommerce',
      programmingLanguages: ['JavaScript', 'Node.js', 'MongoDB'],
      demoVideo: '',
      projectReport: 'N/A',
      createdAt: '2025-11-15',
      visibility: 'public',
      isVisibleOnPortfolio: false,
      creatorId: 9998,
      creatorName: 'Sara Nabil',
      isCollaboratorProject: true
    }
  ];

  const getUserProjects = () => {
    try {
      const raw = localStorage.getItem(`student_projects_${user.id}`);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) return saved;
      }
    } catch (e) {}
    return STUDENT_PROJECTS[user.id] || [];
  };

  const userProjects = getUserProjects();
  
  const [projects, setProjects] = useState([...userProjects, ...SAMPLE_COLLABORATOR_PROJECTS]);

  // Returns true if the current user is the creator of the project
  const isProjectCreator = (project) => {
    if (project.isCollaboratorProject) return false;
    return true;
  };
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [thesisDrafts, setThesisDrafts] = useState(SAMPLE_THESIS_DRAFTS);
  const [finalDrafts, setFinalDrafts] = useState(SAMPLE_FINAL_DRAFTS);
  const [showThesisModal, setShowThesisModal] = useState(false);
  
  const [collaborators, setCollaborators] = useState(SAMPLE_COLLABORATORS);
  const [sentInvitations, setSentInvitations] = useState(() => {
    try {
      const saved = localStorage.getItem(`student_invitations_${user.id}`);
      return saved ? JSON.parse(saved) : (SAMPLE_INVITATIONS || {});
    } catch (e) {
      return SAMPLE_INVITATIONS || {};
    }
  });
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const [tasks, setTasks] = useState(() => {
    const baseTasks = { ...SAMPLE_TASKS };
    baseTasks[9001] = [
      { id: 8001, title: 'Implement login UI', description: 'Create the login and registration screens', assignedTo: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(), status: 'pending', deadline: '2026-06-01', importance: 3, comments: [], creatorId: 9999 },
      { id: 8002, title: 'Write unit tests', description: 'Cover authentication module with tests', assignedTo: 'Ahmed Hassan', status: 'completed', deadline: '2026-05-20', importance: 2, comments: [], creatorId: 9999 }
    ];
    baseTasks[9002] = [
      { id: 8003, title: 'Design product card component', description: 'Build reusable product card for the shop page', assignedTo: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(), status: 'pending', deadline: '2026-06-10', importance: 4, comments: [], creatorId: 9998 },
    ];
    return baseTasks;
  });
  const [taskSortOrder, setTaskSortOrder] = useState('importance');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'pending',
    deadline: '',
    importance: 1
  });
  
  const [comments] = useState(SAMPLE_PROJECT_COMMENTS);
  
  const [flaggedProjects, setFlaggedProjects] = useState(SAMPLE_FLAGGED_PROJECTS);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [projectToAppeal, setProjectToAppeal] = useState(null);
  
  const [invitationFilterStatus, setInvitationFilterStatus] = useState('all');
  const [invitationSearchQuery, setInvitationSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    githubLink: '',
    programmingLanguages: '',
    demoVideo: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (highlightProject && highlightProject.id) {
      setSelectedProject(highlightProject);
      setActiveTab(isBachelorCourse(highlightProject.course) ? 'thesis' : 'collaborators');
      
      setTimeout(() => {
        const rows = document.querySelectorAll('.breakdown__row');
        rows.forEach(row => {
          if (row.textContent.includes(highlightProject.title)) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.style.transition = 'background-color 0.5s';
            row.style.backgroundColor = 'var(--c-yellow-bg)';
            setTimeout(() => {
              row.style.backgroundColor = '';
            }, 2000);
          }
        });
      }, 100);
    }
  }, [highlightProject]);

  const isBachelorCourse = (courseName) => {
    return courseName === "Bachelor Project";
  };


  const filteredCollaborators = useMemo(() => {
    const projectCollaborators = collaborators[selectedProject?.id] || [];
    const searchTerm = collaboratorSearch.toLowerCase();
    return projectCollaborators.filter(collab => 
      collab.email?.toLowerCase().includes(searchTerm) ||
      collab.firstName?.toLowerCase().includes(searchTerm) ||
      collab.lastName?.toLowerCase().includes(searchTerm) ||
      collab.name?.toLowerCase().includes(searchTerm)
    );
  }, [collaborators, selectedProject, collaboratorSearch]);



  const allInvitations = useMemo(() => {
    const invitations = [];
    Object.entries(sentInvitations).forEach(([projectId, invites]) => {
      const project = projects.find(p => p.id === parseInt(projectId));
      if (project && !isBachelorCourse(project.course)) {
        invites.forEach(invite => {
          invitations.push({
            ...invite,
            projectTitle: project.title,
            projectCourse: project.course,
            projectId: parseInt(projectId)
          });
        });
      }
    });
    return invitations;
  }, [sentInvitations, projects]);

  const filteredInvitations = useMemo(() => {
    return allInvitations.filter(invite => {
      const matchesSearch = invite.projectTitle.toLowerCase().includes(invitationSearchQuery.toLowerCase()) ||
                           invite.name.toLowerCase().includes(invitationSearchQuery.toLowerCase()) ||
                           invite.email.toLowerCase().includes(invitationSearchQuery.toLowerCase());
      const matchesStatus = invitationFilterStatus === 'all' || invite.status === invitationFilterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [allInvitations, invitationSearchQuery, invitationFilterStatus]);

  const statistics = useMemo(() => {
    const totalProjects = projects.length;
    
    const languageCount = {};
    projects.forEach(project => {
      project.programmingLanguages?.forEach(lang => {
        languageCount[lang] = (languageCount[lang] || 0) + 1;
      });
    });
    
    const languagePercentages = Object.entries(languageCount).map(([lang, count]) => ({
      language: lang,
      percentage: totalProjects > 0 ? (count / totalProjects) * 100 : 0
    }));
    
    const projectCollaborators = {};
    projects.forEach(project => {
      if (!isBachelorCourse(project.course)) {
        const collabList = collaborators[project.id] || [];
        projectCollaborators[project.title] = collabList.slice(0, 3).map(c => c.name || `${c.firstName} ${c.lastName}`);
      } else {
        projectCollaborators[project.title] = ['Solo Project (No collaborators)'];
      }
    });
    
    return { totalProjects, languagePercentages, projectCollaborators };
  }, [projects, collaborators]);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`student_invitations_${userId}`, JSON.stringify(sentInvitations));
  }, [sentInvitations, userId]);

  const syncProjectsToStorage = (updatedProjects) => {
    localStorage.setItem(`student_projects_${userId}`, JSON.stringify(updatedProjects));
    window.dispatchEvent(new CustomEvent('projectsUpdated', { 
      detail: { userId: userId, projects: updatedProjects }
    }));
  };

  const addNotification = (message, type = 'success') => {
    setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = !filterCourse || p.course === filterCourse;
      return matchesSearch && matchesCourse;
    });
  }, [projects, searchQuery, filterCourse]);

  const handleUploadThesisDraft = (projectId, file) => {
    if (file && file.type === 'application/pdf') {
      const newDraft = {
        id: Date.now(),
        name: file.name,
        url: URL.createObjectURL(file),
        uploadDate: new Date().toISOString()
      };
      setThesisDrafts(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newDraft]
      }));
      addNotification(`Thesis draft "${file.name}" uploaded successfully!`, 'success');
      setShowThesisModal(false);
    } else {
      addNotification('Please upload a valid PDF file', 'error');
    }
  };

  const handleSelectFinalDraft = (projectId, draftId) => {
  const drafts = thesisDrafts[projectId] || [];
  const selectedDraft = drafts.find(d => d.id === draftId);
  if (selectedDraft) {
    setThesisDrafts(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(d => ({
        ...d,
        isPrivate: d.id !== draftId
      }))
    }));
    setFinalDrafts(prev => ({ ...prev, [projectId]: selectedDraft }));
    addNotification(`"${selectedDraft.name}" selected as final draft. Other drafts are now private.`, 'success');
  }
};

  const handleDownloadThesisDraft = (draft) => {
    try {
      const link = document.createElement('a');
      link.href = draft.url;
      link.download = draft.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addNotification(`Downloaded "${draft.name}" successfully!`, 'success');
    } catch (error) {
      addNotification('Failed to download file', 'error');
      console.error('Download error:', error);
    }
  };



  const handleUnsendInvitation = (projectId, invitationId) => {
    setSentInvitations(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(inv => inv.id !== invitationId)
    }));
    addNotification('Invitation unsent successfully!', 'success');
  };

  const getInvitationStatusDisplay = (status) => {
    switch(status) {
      case 'pending':
        return { text: '⏳ Waiting for reply', class: '', bgColor: 'var(--c-yellow-bg)', color: '#fcd34d' };
      case 'accepted':
        return { text: '✓ Accepted', class: 'hiring', bgColor: 'var(--c-green-bg)', color: '#6ee7b7' };
      case 'rejected':
        return { text: '✗ Rejected', class: 'filled', bgColor: 'var(--c-red-bg)', color: '#fca5a5' };
      default:
        return { text: '❓ No reply', class: '', bgColor: 'var(--c-surface-3)', color: 'var(--c-text)' };
    }
  };

  const handleRemoveCollaborator = (projectId, collaboratorId) => {
    const removedCollaborator = (collaborators[projectId] || []).find(c => c.id === collaboratorId);
    setCollaborators(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(c => c.id !== collaboratorId)
    }));
    addNotification(`${removedCollaborator?.name || 'Collaborator'} removed successfully!`, 'success');
  };

  const handleSimulateInvitationResponse = (projectId, invitationId, response) => {
    setSentInvitations(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(inv =>
        inv.id === invitationId ? { ...inv, status: response } : inv
      )
    }));
    
    const invitation = sentInvitations[projectId]?.find(inv => inv.id === invitationId);
    if (response === 'accepted' && invitation) {
      const newCollaborator = {
        id: Date.now(),
        userId: invitation.userId,
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        joinedAt: new Date().toISOString()
      };
      setCollaborators(prev => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newCollaborator]
      }));
    }
    
    addNotification(`${invitation?.name} ${response === 'accepted' ? 'accepted' : 'rejected'} the invitation!`, 'success');
  };

  const handleCreateTask = (projectId) => {
    if (!taskFormData.title || !taskFormData.description) {
      addNotification('Please fill in all required fields', 'error');
      return;
    }
    
    const newTask = {
      id: Date.now(),
      ...taskFormData,
      createdAt: new Date().toISOString(),
      comments: []
    };
    
    setTasks(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newTask]
    }));
    
    addNotification(`Task "${taskFormData.title}" created successfully!`, 'success');
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskFormData({
      title: '',
      description: '',
      assignedTo: '',
      status: 'pending',
      deadline: '',
      importance: 1
    });
  };

  const handleEditTask = (projectId, task) => {
    setEditingTask(task.id);
    setTaskFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      status: task.status,
      deadline: task.deadline,
      importance: task.importance
    });
    setShowTaskModal(true);
  };


  const handleUpdateTask = (projectId) => {
    setTasks(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(task =>
        task.id === editingTask ? { ...task, ...taskFormData } : task
      )
    }));
    addNotification(`Task "${taskFormData.title}" updated successfully!`, 'success');
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskFormData({
      title: '',
      description: '',
      assignedTo: '',
      status: 'pending',
      deadline: '',
      importance: 1
    });
  };

  const handleDeleteTask = (projectId, taskId) => {
    setTasks(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(task => task.id !== taskId)
    }));
    addNotification('Task deleted successfully!', 'success');
  };

  const getSortedTasks = (projectTasks) => {
    if (!projectTasks) return [];
    switch(taskSortOrder) {
      case 'importance':
        return [...projectTasks].sort((a, b) => b.importance - a.importance);
      case 'deadline':
        return [...projectTasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      case 'status':
        const statusOrder = { pending: 0, 'post-poned': 1, completed: 2 };
        return [...projectTasks].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      default:
        return projectTasks;
    }
  };



  const handleOpenAppealModal = (project) => {
    setProjectToAppeal(project);
    setAppealReason('');
    setShowAppealModal(true);
  };

  const handleSendAppeal = () => {
    if (!appealReason.trim()) {
      addNotification('Please explain your point of view', 'error');
      return;
    }
    
    setFlaggedProjects(prev => ({
      ...prev,
      [projectToAppeal.id]: { 
        ...prev[projectToAppeal.id], 
        appeal: appealReason, 
        appealStatus: 'pending',
        appealDate: new Date().toISOString()
      }
    }));
    
    addNotification(`Appeal submitted for project "${projectToAppeal.title}". Waiting for instructor review.`, 'success');
    setShowAppealModal(false);
    setProjectToAppeal(null);
    setAppealReason('');
  };

  const handleViewProject = (project) => {
    setViewingProject(project);
    setShowViewModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Project title is required';
    if (!formData.course) errors.course = 'Course is required';
    if (formData.githubLink && !/^https?:\/\/.+/.test(formData.githubLink)) errors.githubLink = 'Invalid GitHub URL';
    if (formData.demoVideo && !/^https?:\/\/.+/.test(formData.demoVideo)) errors.demoVideo = 'Invalid demo video URL';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({ title: '', course: '', githubLink: '', programmingLanguages: '', demoVideo: '' });
    setFormErrors({});
    setEditingProject(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project.id);
    setFormData({
      title: project.title,
      course: project.course,
      githubLink: project.githubLink,
      programmingLanguages: project.programmingLanguages.join(', '),
      demoVideo: project.demoVideo
    });
    setShowCreateModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmitForm = () => {
    if (!validateForm()) return;

    const languagesArray = formData.programmingLanguages.split(',').map(lang => lang.trim()).filter(lang => lang.length > 0);

    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject ? { ...p, title: formData.title, course: formData.course, githubLink: formData.githubLink, programmingLanguages: languagesArray, demoVideo: formData.demoVideo } : p));
      addNotification(`Project "${formData.title}" updated successfully!`, 'success');
    } else {
      const newProject = {
        id: Math.max(...projects.map(p => p.id), 0) + 1,
        title: formData.title,
        course: formData.course,
        githubLink: formData.githubLink,
        programmingLanguages: languagesArray,
        demoVideo: formData.demoVideo,
        projectReport: 'N/A',
        createdAt: new Date().toISOString().split('T')[0],
        visibility: 'public',
        isVisibleOnPortfolio: false
      };
      setProjects([...projects, newProject]);
      addNotification(`Project "${formData.title}" created successfully!`, 'success');
    }
    setShowCreateModal(false);
    resetForm();
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      const projectName = projectToDelete.title;
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
      addNotification(`Project "${projectName}" has been deleted successfully!`, 'success');
    }
  };



  const handleTogglePortfolioVisibility = (projectId) => {
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        const newStatus = !p.isVisibleOnPortfolio;
        const statusText = newStatus ? 'visible on' : 'hidden from';
        addNotification(`Project "${p.title}" is now ${statusText} your portfolio!`, 'success');
        return { ...p, isVisibleOnPortfolio: newStatus };
      }
      return p;
    });
    setProjects(updatedProjects);
    syncProjectsToStorage(updatedProjects);
  };



  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div className="page-container student-project-container">
    <h1 className="cm__heading">My Projects</h1>

      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div key={notification.id} className={`notification notification-${notification.type === 'success' ? 'accepted' : 'rejected'}`}>
              <div className="notification-content">
                <div className="notification-icon">{notification.type === 'success' ? '✓' : '⚠'}</div>
                <div className="notification-text">
                  <strong>{notification.type === 'success' ? 'Success!' : 'Notification'}</strong>
                  <p>{notification.message}</p>
                </div>
                <button className="notification-close" onClick={() => removeNotification(notification.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="filters-row" style={{ marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={() => { setActiveTab('projects'); setSelectedProject(null); }} className={`edit-btn ${activeTab === 'projects' ? 'submit-btn' : ''}`}>📁 My Projects</button>
        <button onClick={() => { setActiveTab('allInvitations'); setSelectedProject(null); }} className={`edit-btn ${activeTab === 'allInvitations' ? 'submit-btn' : ''}`}>📨 All Invitations</button>
        <button onClick={() => setActiveTab('statistics')} className={`edit-btn ${activeTab === 'statistics' ? 'submit-btn' : ''}`}>📊 Statistics</button>
        {selectedProject && (
          <>
            {isBachelorCourse(selectedProject.course) && (
              <button onClick={() => setActiveTab('thesis')} className={`edit-btn ${activeTab === 'thesis' ? 'submit-btn' : ''}`}>📄 Thesis Drafts</button>
            )}
            {!isBachelorCourse(selectedProject.course) && (
              <>
                <button onClick={() => setActiveTab('collaborators')} className={`edit-btn ${activeTab === 'collaborators' ? 'submit-btn' : ''}`}>👥 Collaborators</button>
                <button onClick={() => setActiveTab('tasks')} className={`edit-btn ${activeTab === 'tasks' ? 'submit-btn' : ''}`}>✅ Tasks</button>
              </>
            )}
            <button onClick={() => setActiveTab('comments')} className={`edit-btn ${activeTab === 'comments' ? 'submit-btn' : ''}`}>💬 Comments</button>
          </>
        )}
      </div>

      {activeTab === 'allInvitations' && (
        <>
          <div className="internship-search-section">
            <div className="filters-row" style={{ gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', minWidth: '150px' }}>All Invitations</h2>
              <input 
                type="text" 
                placeholder="Search by project, name or email..." 
                value={invitationSearchQuery} 
                onChange={(e) => setInvitationSearchQuery(e.target.value)} 
                className="search-input" 
                style={{ height: '40px', flex: 1, minWidth: '250px', padding: '10px 12px' }} 
              />
              <select 
                value={invitationFilterStatus} 
                onChange={(e) => setInvitationFilterStatus(e.target.value)} 
                className="filter-select"
                style={{ height: '40px', minWidth: '150px', padding: '8px' }}
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="accepted">✓ Accepted</option>
                <option value="rejected">✗ Rejected</option>
              </select>
            </div>
          </div>

          {allInvitations.length === 0 ? (
  <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
    <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>📭 No invitations sent yet</p>
    <p style={{ color: 'var(--c-text-2)', marginBottom: '10px' }}>You haven't sent any invitations to collaborators</p>
    <p style={{ fontSize: '0.9rem', color: 'var(--c-muted)' }}>Go to your projects and invite collaborators to get started</p>
  </div>
) : filteredInvitations.length === 0 ? (
  <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
    <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>🔍 No invitations match your filters</p>
    <p style={{ color: 'var(--c-text-2)' }}>Try adjusting your search or filter criteria</p>
  </div>
) : (
  <div className="breakdown" style={{ overflowX: 'auto' }}>
    <p className="breakdown__title">
      All Invitations 
      <span style={{ fontSize: '0.85rem', marginLeft: '10px', color: 'var(--c-text-2)' }}>
        ({filteredInvitations.length} invitation{filteredInvitations.length !== 1 ? 's' : ''})
      </span>
    </p>
    <table className="breakdown__table" style={{ minWidth: '1200px', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ minWidth: '180px', width: '18%' }}>Project Title</th>
          <th style={{ minWidth: '130px', width: '13%' }}>Course</th>
          <th style={{ minWidth: '170px', width: '17%' }}>Invited User</th>
          <th style={{ minWidth: '100px', width: '10%' }}>Status</th>
          <th style={{ minWidth: '110px', width: '11%' }}>Invited Date</th>
          <th style={{ minWidth: '310px', width: '31%' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredInvitations.map(invitation => {
          const statusDisplay = getInvitationStatusDisplay(invitation.status);
          return (
            <tr key={invitation.id} className="breakdown__row">
              <td 
                style={{ cursor: 'pointer', wordBreak: 'break-word', color: 'var(--c-primary)' }}
                onClick={() => {
                  const project = projects.find(p => p.id === invitation.projectId);
                  if (project) {
                    setSelectedProject(project);
                    setActiveTab('collaborators');
                  }
                }}
              >
                {invitation.projectTitle}
              </td>
              <td style={{ wordBreak: 'break-word' }}>{invitation.projectCourse}</td>
              <td>
                <div>
                  <strong>{invitation.name}</strong>
                  <br />
                  <small style={{ color: 'var(--c-text-2)', wordBreak: 'break-word' }}>{invitation.email}</small>
                </div>
              </td>
              <td>
                <span 
                  className="status-badge" 
                  style={{ 
                    whiteSpace: 'nowrap', 
                    background: statusDisplay.bgColor, 
                    color: statusDisplay.color,
                    border: 'none',
                    display: 'inline-block',
                    textAlign: 'center',
                    minWidth: '90px'
                  }}
                >
                  {statusDisplay.text}
                </span>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>
                {new Date(invitation.invitedAt).toLocaleDateString()}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', justifyContent: 'flex-start' }}>
                  {invitation.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleSimulateInvitationResponse(invitation.projectId, invitation.id, 'accepted')} 
                        className="edit-btn" 
                        style={{ 
                          whiteSpace: 'nowrap', 
                          padding: '5px 10px', 
                          background: '#10b981', 
                          color: 'white', 
                          border: 'none', 
                          cursor: 'pointer', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          minWidth: '32px',
                          height: '30px'
                        }}
                        title="Mark this invitation as accepted"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleSimulateInvitationResponse(invitation.projectId, invitation.id, 'rejected')} 
                        className="cancel-btn" 
                        style={{ 
                          whiteSpace: 'nowrap', 
                          padding: '5px 10px', 
                          background: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          cursor: 'pointer', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          minWidth: '32px',
                          height: '30px'
                        }}
                        title="Mark this invitation as rejected"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleUnsendInvitation(invitation.projectId, invitation.id)} 
                        className="cancel-btn" 
                        style={{ 
                          whiteSpace: 'nowrap', 
                          padding: '5px 10px', 
                          background: 'var(--c-text-2)', 
                          color: 'white', 
                          border: 'none', 
                          cursor: 'pointer', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          minWidth: '32px',
                          height: '30px'
                        }}
                        title="Cancel and remove this invitation"
                      >
                        Unsend
                      </button>
                    </>
                  )}
                  {invitation.status !== 'pending' && (
                    <>
                      <button 
                        onClick={() => {
                          const project = projects.find(p => p.id === invitation.projectId);
                          if (project) {
                            setSelectedProject(project);
                            setActiveTab('collaborators');
                          }
                        }} 
                        className="edit-btn" 
                        style={{ 
                          whiteSpace: 'nowrap', 
                          padding: '5px 10px', 
                          background: '#3b82f6', 
                          color: 'white', 
                          border: 'none', 
                          cursor: 'pointer', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          minWidth: '32px',
                          height: '30px'
                        }}
                        title="View this project's collaborators"
                      >
                        View Project
                      </button>
                      <button 
                        onClick={() => handleUnsendInvitation(invitation.projectId, invitation.id)} 
                        className="cancel-btn" 
                        style={{ 
                          whiteSpace: 'nowrap', 
                          padding: '5px 10px', 
                          background: 'var(--c-text-2)', 
                          color: 'white', 
                          border: 'none', 
                          cursor: 'pointer', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          minWidth: '32px',
                          height: '30px'
                        }}
                        title="Remove this invitation"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

          {allInvitations.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
              <div className="internship-card" style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem' }}>📨</div>
                <h4 style={{ margin: '10px 0 5px' }}>Total Invitations</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{filteredInvitations.length}</p>
              </div>
              <div className="internship-card" style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem' }}>⏳</div>
                <h4 style={{ margin: '10px 0 5px' }}>Pending</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#fcd34d' }}>
                  {filteredInvitations.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <div className="internship-card" style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem' }}>✓</div>
                <h4 style={{ margin: '10px 0 5px' }}>Accepted</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#6ee7b7' }}>
                  {filteredInvitations.filter(i => i.status === 'accepted').length}
                </p>
              </div>
              <div className="internship-card" style={{ textAlign: 'center', padding: '15px' }}>
                <div style={{ fontSize: '2rem' }}>✗</div>
                <h4 style={{ margin: '10px 0 5px' }}>Rejected</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#fca5a5' }}>
                  {filteredInvitations.filter(i => i.status === 'rejected').length}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'projects' && (
        <>
          <div className="internship-search-section">
            <div className="filters-row">
              <button className="submit-btn" style={{ height: '48px' }} onClick={handleOpenCreateModal}>+ Create New Project</button>
              <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" style={{ height: '38px', flex: 1, marginTop: 15 }} />
              <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="filter-select">
                <option value="">All Courses</option>
                {COURSES.map(course => <option key={course.id} value={course.name}>{course.name}</option>)}
              </select>
              {filteredProjects.length > 0 && (
                <div className="bulk-actions" style={{ display: 'flex', gap: '10px' }}>

                </div>
              )}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="empty-state"><p>📭 No projects found</p><p className="empty-state-subtitle">Create your first project to get started!</p></div>
          ) : (
            <div className="breakdown" style={{ overflowX: 'auto' }}>
              <p className="breakdown__title">All Projects</p>
              <table className="breakdown__table" style={{ minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '200px' }}>Project Title</th>
                    <th style={{ minWidth: '120px' }}>Course</th>
                    <th style={{ minWidth: '90px' }}>Role</th>
                    <th style={{ minWidth: '80px', textAlign: 'center' }}>Portfolio</th>
                    <th style={{ minWidth: '100px' }}>Created</th>
                    <th style={{ minWidth: '220px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="breakdown__row">
                      <td className="project-title" style={{ cursor: 'pointer', wordBreak: 'break-word', maxWidth: '250px' }} onClick={() => { setSelectedProject(project); setActiveTab(isBachelorCourse(project.course) ? 'thesis' : 'collaborators'); }}>{project.title} {flaggedProjects[project.id]?.flagged && '⚠️'}
                      </td>
                      <td style={{ wordBreak: 'break-word' }}>{project.course}</td>
                      <td>
                        {project.isCollaboratorProject
                          ? <span className="status-badge" style={{ background: 'var(--c-blue-bg)', color: '#93c5fd', whiteSpace: 'nowrap' }}>👥 Collaborator</span>
                          : <span className="status-badge" style={{ background: 'var(--c-green-bg)', color: '#6ee7b7', whiteSpace: 'nowrap' }}>👑 Creator</span>
                        }
                      </td>
                     
                      <td className="checkbox-cell" style={{ textAlign: 'center' }}><input type="checkbox" checked={project.isVisibleOnPortfolio} onChange={() => handleTogglePortfolioVisibility(project.id)} style={{ cursor: 'pointer', width: '18px', height: '18px' }} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{project.isCollaboratorProject ? <span style={{ fontSize: '0.85rem', color: 'var(--c-text-2)' }}>By {project.creatorName}</span> : project.createdAt}</td>
                      <td className="actions-cell" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleViewProject(project)} className="edit-btn" style={{ marginTop: 0, padding: '6px 10px', fontSize: '0.85rem', whiteSpace: 'nowrap', background: 'var(--c-green)' }}>View</button>
                        {!project.isCollaboratorProject && (
                          <>
                            <button onClick={() => handleEditProject(project)} className="edit-btn" style={{ marginTop: 0, padding: '6px 10px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Edit</button>
                            <button onClick={() => handleDeleteClick(project)} className="cancel-btn" style={{ marginTop: 0, padding: '6px 10px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>🗑️ Delete</button>
                          </>
                        )}
                        {flaggedProjects[project.id]?.flagged && <span className="status-badge" style={{ background: 'var(--c-red-bg)', color: '#fca5a5', whiteSpace: 'nowrap' }}>⚠️ Flagged</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'statistics' && (
        <div className="portfolio-section">
          <h2>📊 Project Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="internship-card">
              <h3>Total Projects</h3>
              <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--c-primary)' }}>{statistics.totalProjects}</p>
            </div>
            <div className="internship-card">
              <h3>Programming Languages (%)</h3>
              {statistics.languagePercentages.map(lang => (
                <div key={lang.language} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}><span style={{ wordBreak: 'break-word' }}>{lang.language}</span><span>{lang.percentage.toFixed(1)}%</span></div>
                  <div style={{ background: 'var(--c-surface-3)', borderRadius: '10px', overflow: 'hidden', height: '8px' }}><div style={{ width: `${lang.percentage}%`, background: 'var(--c-primary)', height: '100%' }}></div></div>
                </div>
              ))}
            </div>
            <div className="internship-card">
              <h3>Top Collaborators Per Project</h3>
              {Object.entries(statistics.projectCollaborators).map(([project, collabs]) => (
                <div key={project} style={{ marginBottom: '15px' }}>
                  <strong style={{ wordBreak: 'break-word' }}>{project}:</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--c-text-2)', marginTop: '5px', wordBreak: 'break-word' }}>{collabs.length > 0 ? collabs.join(', ') : 'No collaborators yet'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <>
          {activeTab === 'thesis' && isBachelorCourse(selectedProject.course) && (
  <div className="portfolio-section">
    <div className="section-header">
      <h2>📄 Thesis Drafts</h2>
      <button className="submit-btn" onClick={() => setShowThesisModal(true)}>
        + Upload New Draft
      </button>
    </div>
    
    <p style={{ marginBottom: '20px', color: 'var(--c-text-2)', fontSize: '0.85rem' }}>
      Project: <strong>{selectedProject.title}</strong>
    </p>
    
    {(thesisDrafts[selectedProject.id] || []).length === 0 ? (
      <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
        <span style={{ fontSize: '48px' }}>📄</span>
        <p style={{ marginTop: '16px', fontSize: '16px' }}>No thesis drafts uploaded yet</p>
        <p className="empty-state-subtitle">Click "Upload New Draft" to add your first thesis draft.</p>
      </div>
    ) : (
      <div className="thesis-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {(thesisDrafts[selectedProject.id] || []).map(draft => {
          const isFinal = finalDrafts[selectedProject.id]?.id === draft.id;
          const isPrivate = draft.isPrivate && !isFinal;
          
          return (
            <div key={draft.id} className="thesis-card" style={{
              background: isFinal ? 'linear-gradient(135deg, var(--c-surface), rgba(16, 185, 129, 0.1))' : 'var(--c-surface)',
              border: `2px solid ${isFinal ? '#10b981' : isPrivate ? 'var(--c-border)' : 'var(--c-border)'}`,
              borderRadius: 'var(--r-lg)',
              padding: '20px',
              opacity: isPrivate ? 0.7 : 1,
              transition: 'all var(--t-base)',
              position: 'relative',
              boxShadow: isFinal ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none'
            }}>
              {/* Final Badge */}
              {isFinal && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  right: '20px',
                  background: '#10b981',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⭐ FINAL DRAFT
                </div>
              )}
              
              {/* Draft Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '28px' }}>{isFinal ? '⭐' : '📄'}</span>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      color: 'var(--c-text)',
                      wordBreak: 'break-word'
                    }}>
                      {draft.name}
                    </h3>
                    {isFinal && (
                      <span style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>Approved Final Submission</span>
                    )}
                  </div>
                </div>
                {isPrivate && !isFinal && (
                  <span className="badge" style={{ background: 'var(--c-surface-3)', color: 'var(--c-text-2)' }}>🔒 Private</span>
                )}
              </div>
              
              {/* Upload Date */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '16px',
                fontSize: '0.75rem',
                color: 'var(--c-muted)'
              }}>
                <span>📅</span>
                <span>Uploaded: {new Date(draft.uploadDate).toLocaleDateString()}</span>
              </div>
              
              {/* Private Notice */}
              {isPrivate && !isFinal && (
                <div style={{ 
                  padding: '8px 12px', 
                  background: 'var(--c-surface-2)', 
                  borderRadius: 'var(--r-md)',
                  marginBottom: '16px',
                  fontSize: '0.75rem',
                  color: 'var(--c-text-2)',
                  fontStyle: 'italic'
                }}>
                  🔒 This draft is private because another draft was marked as final.
                </div>
              )}
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleDownloadThesisDraft(draft)} 
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  📥 Download
                </button>
                
                {!isFinal && !isPrivate && (
                  <button 
                    onClick={() => {
                      setDraftToSetFinal(draft);
                      setShowSetFinalConfirm(true);
                    }} 
                    className="btn-primary"
                    style={{ flex: 1, background: '#10b981' }}
                  >
                    ⭐ Set as Final
                  </button>
                )}
                
                {isFinal && (
                  <button 
                    onClick={() => {
                      setDraftToUnsetFinal(draft);
                      setShowUnsetFinalConfirm(true);
                    }} 
                    className="btn-danger"
                    style={{ flex: 1 }}
                  >
                    🔄 Unset as Final
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    )}
    
    {/* Final Thesis Submission Section */}
    {finalDrafts[selectedProject.id] && (
      <div className="final-submission-section" style={{
        marginTop: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
        border: '2px solid #10b981',
        borderRadius: 'var(--r-xl)',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '-12px', 
          left: '20px',
          background: '#10b981',
          color: 'white',
          padding: '4px 16px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          ⭐ FINAL SUBMISSION
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, color: '#6ee7b7' }}>
                {finalDrafts[selectedProject.id].name}
              </h3>
              <span className="badge" style={{ background: '#10b981', color: 'white' }}>✓ Approved</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--c-text-2)' }}>
              <span>📅 Submitted: {new Date(finalDrafts[selectedProject.id].uploadDate).toLocaleDateString()}</span>
              <span>✅ Status: Final - Approved</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => handleDownloadThesisDraft(finalDrafts[selectedProject.id])} 
              className="btn-primary"
              style={{ background: '#10b981' }}
            >
              📥 Download Final
            </button>
            <button 
              onClick={() => {
                setDraftToUnsetFinal(finalDrafts[selectedProject.id]);
                setShowUnsetFinalConfirm(true);
              }} 
              className="btn-danger"
            >
              🔄 Unset Final
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Set as Final Confirmation Modal */}
    {showSetFinalConfirm && draftToSetFinal && (
      <div className="modal-overlay" onClick={() => setShowSetFinalConfirm(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-body" style={{ textAlign: 'center' }}>
            <div className="confirm-icon" style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>⭐</div>
            <h3>Set as Final Draft</h3>
            <p>Are you sure you want to set <strong>"{draftToSetFinal.name}"</strong> as the final thesis draft?</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-muted)', marginTop: '8px' }}>
              Other drafts will become private and only the final draft will be visible on your portfolio.
            </p>
            <div className="form-actions" style={{ justifyContent: 'center', marginTop: '20px' }}>
              <button 
                className="btn-primary" 
                onClick={() => {
                  handleSelectFinalDraft(selectedProject.id, draftToSetFinal.id);
                  setShowSetFinalConfirm(false);
                  setDraftToSetFinal(null);
                }}
              >
                Yes, Set as Final
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowSetFinalConfirm(false);
                  setDraftToSetFinal(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Unset as Final Confirmation Modal */}
    {showUnsetFinalConfirm && draftToUnsetFinal && (
      <div className="modal-overlay" onClick={() => setShowUnsetFinalConfirm(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-body" style={{ textAlign: 'center' }}>
            <div className="confirm-icon" style={{ fontSize: '3rem', marginBottom: 'var(--sp-4)' }}>🔄</div>
            <h3>Unset as Final Draft</h3>
            <p>Are you sure you want to unset <strong>"{draftToUnsetFinal.name}"</strong> as the final thesis draft?</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-muted)', marginTop: '8px' }}>
              All drafts will become visible again, and you can select a different draft as final.
            </p>
            <div className="form-actions" style={{ justifyContent: 'center', marginTop: '20px' }}>
              <button 
                className="btn-danger" 
                onClick={() => {
                  setFinalDrafts(prev => {
                    const newFinal = { ...prev };
                    delete newFinal[selectedProject.id];
                    return newFinal;
                  });
                  setThesisDrafts(prev => ({
                    ...prev,
                    [selectedProject.id]: (prev[selectedProject.id] || []).map(d => ({
                      ...d,
                      isPrivate: false
                    }))
                  }));
                  addNotification(`"${draftToUnsetFinal.name}" is no longer the final draft.`, 'info');
                  setShowUnsetFinalConfirm(false);
                  setDraftToUnsetFinal(null);
                }}
              >
                Yes, Unset as Final
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowUnsetFinalConfirm(false);
                  setDraftToUnsetFinal(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Info Box - Instructions */}
    <div style={{ 
      marginTop: '24px', 
      padding: '12px 16px', 
      background: 'var(--c-blue-bg)', 
      borderRadius: 'var(--r-md)',
      borderLeft: '4px solid var(--c-primary)',
      fontSize: '0.8rem',
      color: '#93c5fd'
    }}>
      <strong>ℹ️ About Thesis Drafts:</strong> Only one draft can be marked as the final submission. When you set a draft as final, all other drafts become private. You can unset the final draft at any time to select a different one.
    </div>
  </div>
)}

          {activeTab === 'collaborators' && !isBachelorCourse(selectedProject.course) && (
  <div className="portfolio-section">
    <div className="section-header">
      <h2>👥 Collaborators & Invitations</h2>
      {isProjectCreator(selectedProject) && (
        <button className="submit-btn" onClick={() => setShowInviteModal(true)}>
          + Invite New
        </button>
      )}
    </div>
    
    {/* Search Bar */}
    <div className="search-bar" style={{ marginBottom: '24px' }}>
      <input 
        type="text" 
        placeholder="🔍 Search collaborators by name or email..." 
        value={collaboratorSearch} 
        onChange={(e) => setCollaboratorSearch(e.target.value)} 
        className="search-input" 
        style={{ padding: '12px 16px' }} 
      />
    </div>
    
    {/* Sent Invitations Section */}
    <div style={{ marginBottom: '32px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid var(--c-border)'
      }}>
        <span style={{ fontSize: '20px' }}>📤</span>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Sent Invitations</h3>
        <span className="badge" style={{ marginLeft: '8px' }}>
          {(sentInvitations[selectedProject.id] || []).length}
        </span>
      </div>
      
      {(sentInvitations[selectedProject.id] || []).length === 0 ? (
        <div className="empty-state" style={{ padding: '30px', textAlign: 'center' }}>
          <span style={{ fontSize: '32px' }}>📭</span>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>No pending invitations sent</p>
        </div>
      ) : (
        <div className="invitations-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {(sentInvitations[selectedProject.id] || []).map(invite => {
            const statusDisplay = getInvitationStatusDisplay(invite.status);
            return (
              <div key={invite.id} className="invitation-card" style={{
                background: 'var(--c-surface)',
                border: `1px solid ${invite.status === 'accepted' ? 'rgba(16, 185, 129, 0.3)' : invite.status === 'rejected' ? 'rgba(239, 68, 68, 0.3)' : 'var(--c-border)'}`,
                borderRadius: 'var(--r-lg)',
                padding: '16px',
                transition: 'all var(--t-base)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--c-text)' }}>{invite.name}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--c-muted)' }}>{invite.role}</span>
                  </div>
                  <span className="badge" style={{ 
                    background: statusDisplay.bgColor, 
                    color: statusDisplay.color 
                  }}>
                    {statusDisplay.text}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', marginBottom: '4px' }}>
                  📧 {invite.email}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: '12px' }}>
                  📅 Invited: {new Date(invite.invitedAt).toLocaleDateString()}
                </p>
                {invite.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleSimulateInvitationResponse(selectedProject.id, invite.id, 'accepted')} 
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#10b981' }}
                    >
                      ✓ Accept
                    </button>
                    <button 
                      onClick={() => handleSimulateInvitationResponse(selectedProject.id, invite.id, 'rejected')} 
                      className="btn-danger"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      ✗ Reject
                    </button>
                    <button 
                      onClick={() => handleUnsendInvitation(selectedProject.id, invite.id)} 
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      ↺ Unsend
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    
    {/* Current Collaborators Section */}
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid var(--c-border)'
      }}>
        <span style={{ fontSize: '20px' }}>👥</span>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Current Collaborators</h3>
        <span className="badge badge--green" style={{ marginLeft: '8px' }}>
          {filteredCollaborators.length}
        </span>
      </div>
      
      {filteredCollaborators.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px', textAlign: 'center' }}>
          <span style={{ fontSize: '32px' }}>👥</span>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>No collaborators yet</p>
          <p className="empty-state-subtitle">Invite someone to join your project!</p>
        </div>
      ) : (
        <div className="collaborators-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {filteredCollaborators.map(collab => (
            <div key={collab.id} className="collaborator-card" style={{
              background: 'linear-gradient(135deg, var(--c-surface), var(--c-surface-2))',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-lg)',
              padding: '16px',
              transition: 'all var(--t-base)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--c-text)' }}>{collab.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--c-muted)' }}>{collab.role}</span>
                </div>
                <span className="badge badge--green" style={{ background: '#10b981', color: 'white' }}>✅ Active</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', marginBottom: '4px' }}>
                📧 {collab.email}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: '12px' }}>
                📅 Joined: {collab.joinedAt ? new Date(collab.joinedAt).toLocaleDateString() : 'Recently'}
              </p>
              <button 
                onClick={() => handleRemoveCollaborator(selectedProject.id, collab.id)} 
                className="btn-danger"
                style={{ padding: '6px 12px', fontSize: '0.75rem', width: '100%' }}
              >
                🗑️ Remove Collaborator
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

          {activeTab === 'tasks' && !isBachelorCourse(selectedProject.course) && (() => {
  const isCreator = isProjectCreator(selectedProject);
  const currentUserName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const projectTasks = tasks[selectedProject.id] || [];
  
  return (
    <div className="portfolio-section">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <h2>✅ Tasks</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select 
            value={taskSortOrder} 
            onChange={(e) => setTaskSortOrder(e.target.value)} 
            className="filter-select" 
            style={{ padding: '8px 12px', minWidth: '150px' }}
          >
            <option value="importance">⭐ Sort by Importance</option>
            <option value="deadline">📅 Sort by Deadline</option>
            <option value="status">📊 Sort by Status</option>
          </select>
          {isCreator && (
            <button 
              className="submit-btn" 
              onClick={() => { 
                setEditingTask(null); 
                setTaskFormData({ 
                  title: '', 
                  description: '', 
                  assignedTo: '', 
                  status: 'pending', 
                  deadline: '', 
                  importance: 1 
                }); 
                setShowTaskModal(true); 
              }} 
              style={{ whiteSpace: 'nowrap' }}
            >
              + Create Task
            </button>
          )}
        </div>
      </div>
      
      {!isCreator && (
        <div className="info-message" style={{ 
          padding: '12px 16px', 
          background: 'var(--c-blue-bg)', 
          borderLeft: '4px solid var(--c-primary)', 
          borderRadius: 'var(--r-md)', 
          marginBottom: '20px', 
          fontSize: '0.85rem', 
          color: '#93c5fd' 
        }}>
          ℹ️ You are a collaborator on this project. You can only update the status of tasks assigned to you.
        </div>
      )}
      
      {projectTasks.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>📋</span>
          <p style={{ marginTop: '16px', fontSize: '16px' }}>No tasks yet</p>
          <p className="empty-state-subtitle">
            {isCreator ? 'Click "Create Task" to add your first task.' : 'Tasks will appear here when the project creator adds them.'}
          </p>
        </div>
      ) : (
        <div className="tasks-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
          gap: '20px' 
        }}>
          {getSortedTasks(projectTasks).map(task => {
            const isMyTask = task.assignedTo === currentUserName;
            const canEditFull = isCreator;
            const canChangeStatus = !isCreator && isMyTask;
            
            return (
              <div key={task.id} className="task-card" style={{
                background: 'var(--c-surface)',
                border: `1px solid ${task.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : task.status === 'post-poned' ? 'rgba(245, 158, 11, 0.3)' : 'var(--c-border)'}`,
                borderRadius: 'var(--r-lg)',
                padding: '20px',
                transition: 'all var(--t-base)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Task Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    color: 'var(--c-text)',
                    wordBreak: 'break-word'
                  }}>
                    {task.title}
                  </h3>
                  <span className={`badge ${task.status === 'completed' ? 'badge--green' : task.status === 'post-poned' ? 'badge--yellow' : 'badge--blue'}`} style={{ whiteSpace: 'nowrap' }}>
                    {task.status === 'pending' ? '⏳ Pending' : task.status === 'completed' ? '✓ Completed' : '⏸ Post-poned'}
                  </span>
                </div>
                
                {/* Task Description */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--c-text-2)', lineHeight: '1.5' }}>
                    {task.description}
                  </p>
                </div>
                
                {/* Task Meta Info */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px',
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'var(--c-surface-2)',
                  borderRadius: 'var(--r-md)'
                }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>👤 Assigned To</label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--c-text)' }}>{task.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>📅 Deadline</label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: task.deadline && new Date(task.deadline) < new Date() ? '#fca5a5' : 'var(--c-text)' }}>
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>⭐ Importance</label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#fbbf24' }}>
                      {'⭐'.repeat(task.importance)}
                      {task.importance < 5 && '☆'.repeat(5 - task.importance)}
                    </span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--c-muted)', display: 'block', marginBottom: '4px' }}>🔧 Actions</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {canEditFull && (
                        <>
                          <button 
                            onClick={() => handleEditTask(selectedProject.id, task)} 
                            className="edit-btn" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(selectedProject.id, task.id)} 
                            className="cancel-btn" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      {canChangeStatus && (
                        <select
                          value={task.status}
                          onChange={(e) => setTasks(prev => ({ 
                            ...prev, 
                            [selectedProject.id]: (prev[selectedProject.id] || []).map(t => 
                              t.id === task.id ? { ...t, status: e.target.value } : t
                            ) 
                          }))}
                          className="filter-select"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="post-poned">⏸ Post-poned</option>
                          <option value="completed">✓ Completed</option>
                        </select>
                      )}
                      {!canEditFull && !canChangeStatus && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)', fontStyle: 'italic' }}>View only</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Comments Section */}
                {task.comments && task.comments.length > 0 && (
                  <div style={{ 
                    marginTop: '16px', 
                    borderTop: '1px solid var(--c-border)', 
                    paddingTop: '12px' 
                  }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--c-muted)', marginBottom: '8px', display: 'block' }}>💬 Comments</label>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {task.comments.map(comment => (
                        <div key={comment.id} style={{ 
                          background: 'var(--c-surface-2)', 
                          padding: '8px 12px', 
                          borderRadius: 'var(--r-md)', 
                          marginBottom: '8px',
                          wordBreak: 'break-word'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.75rem', color: 'var(--c-text)' }}>{comment.author}</strong>
                            <small style={{ fontSize: '0.65rem', color: 'var(--c-muted)' }}>
                              {new Date(comment.timestamp).toLocaleString()}
                            </small>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--c-text-2)' }}>{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
})()}

{activeTab === 'comments' && (
  <div className="portfolio-section">
    <div className="section-header">
      <h2>💬 Project Comments</h2>
    </div>
    
    {(!comments[selectedProject.id] || comments[selectedProject.id].length === 0) ? (
      <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
        <span style={{ fontSize: '48px' }}>💬</span>
        <p style={{ marginTop: '16px', fontSize: '16px' }}>No comments yet</p>
       
      </div>
    ) : (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {(comments[selectedProject.id] || []).map(comment => (
          <div key={comment.id} style={{
            display: 'flex',
            gap: '16px',
            padding: '20px',
            background: comment.authorRole === 'Course Instructor' ? 'rgba(59, 130, 246, 0.05)' : 'var(--c-surface-2)',
            borderRadius: 'var(--r-lg)',
            border: `1px solid ${comment.authorRole === 'Course Instructor' ? 'rgba(59, 130, 246, 0.2)' : 'var(--c-border)'}`,
            transition: 'all var(--t-base)'
          }}>
            {/* Avatar Column */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: comment.authorRole === 'Course Instructor' ? 'linear-gradient(135deg, #3b82f6, #a78bfa)' : 'linear-gradient(135deg, #3b82f6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                color: 'white'
              }}>
                {comment.authorRole === 'Course Instructor' ? '👨‍🏫' : '👩‍🎓'}
              </div>
            </div>
            
            {/* Comment Content Column */}
            <div style={{ flex: 1 }}>
              {/* Author and Role */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                flexWrap: 'wrap',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  color: 'var(--c-text)'
                }}>
                  {comment.author}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  background: comment.authorRole === 'Course Instructor' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: comment.authorRole === 'Course Instructor' ? '#93c5fd' : '#6ee7b7',
                  fontWeight: 500
                }}>
                  {comment.authorRole}
                </span>
              </div>
              
              {/* Comment Text */}
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--c-text-2)',
                lineHeight: '1.6',
                marginBottom: '12px',
                wordBreak: 'break-word'
              }}>
                {comment.text}
              </div>
              
              {/* Timestamp */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.7rem',
                color: 'var(--c-muted)'
              }}>
                <span>📅</span>
                <span>{new Date(comment.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    
   
    
    {/* Flagged Project Section */}
    {flaggedProjects[selectedProject.id]?.flagged && (
      <div className="flagged-section" style={{ 
        marginTop: '32px', 
        padding: '20px', 
        background: 'var(--c-red-bg)', 
        borderLeft: '4px solid #ef4444', 
        borderRadius: 'var(--r-lg)',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px' }}>⚠️</span>
          <h3 style={{ margin: 0, color: '#fca5a5' }}>Project Flagged</h3>
        </div>
        
        <div style={{ marginBottom: '16px', paddingLeft: '40px' }}>
          <p style={{ marginBottom: '8px', color: 'var(--c-text-2)' }}>
            <strong style={{ color: '#fca5a5' }}>Reason:</strong> {flaggedProjects[selectedProject.id].reason}
          </p>
          {flaggedProjects[selectedProject.id].flaggedBy && (
            <p style={{ marginBottom: '8px', color: 'var(--c-text-2)' }}>
              <strong style={{ color: '#fca5a5' }}>Flagged By:</strong> {flaggedProjects[selectedProject.id].flaggedBy}
            </p>
          )}
          {flaggedProjects[selectedProject.id].flaggedDate && (
            <p style={{ marginBottom: '8px', color: 'var(--c-text-2)' }}>
              <strong style={{ color: '#fca5a5' }}>Date:</strong> {new Date(flaggedProjects[selectedProject.id].flaggedDate).toLocaleDateString()}
            </p>
          )}
        </div>
        
        {!flaggedProjects[selectedProject.id]?.appeal && (
          <button 
            onClick={() => handleOpenAppealModal(selectedProject)} 
            className="edit-btn" 
            style={{ marginLeft: '40px', whiteSpace: 'nowrap' }}
          >
            📝 Send Appeal
          </button>
        )}
        
        {flaggedProjects[selectedProject.id]?.appeal && (
          <div className="appeal-box" style={{ 
            marginTop: '16px', 
            marginLeft: '40px',
            padding: '16px', 
            background: 'var(--c-surface)', 
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--c-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <strong style={{ color: 'var(--c-text)' }}>Your Appeal:</strong>
              <span className={`badge ${flaggedProjects[selectedProject.id].appealStatus === 'pending' ? 'badge--yellow' : 'badge--green'}`}>
                {flaggedProjects[selectedProject.id].appealStatus === 'pending' ? '⏳ Pending Review' : '✓ Reviewed'}
              </span>
            </div>
            <p style={{ margin: '8px 0', color: 'var(--c-text-2)', wordBreak: 'break-word' }}>{flaggedProjects[selectedProject.id].appeal}</p>
            {flaggedProjects[selectedProject.id].appealDate && (
              <small style={{ color: 'var(--c-muted)', display: 'block', marginTop: '8px' }}>
                Submitted: {new Date(flaggedProjects[selectedProject.id].appealDate).toLocaleDateString()}
              </small>
            )}
          </div>
        )}
      </div>
    )}
  </div>
)}
        </>
      )}

      {showViewModal && viewingProject && (
  <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', width: '100%' }}>
      <div className="modal-header">
        <h2>📄 Project Details</h2>
        <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
      </div>
      <div className="modal-body">
        {/* Two-column layout for better organization */}
        <div className="project-details-grid">
          {/* Left column */}
          <div className="details-column">
            <div className="info-group">
              <div className="info-item">
                <label>Project Title</label>
                <p className="info-value">{viewingProject.title}</p>
              </div>
              
              <div className="info-item">
                <label>Course</label>
                <p className="info-value">
                  {isBachelorCourse(viewingProject.course) ? (
                    <span className="badge badge--primary">🎓 Bachelor Thesis</span>
                  ) : (
                    <span className="badge badge--blue">{viewingProject.course}</span>
                  )}
                </p>
              </div>
              
              <div className="info-item">
                <label>Visibility</label>
                <p className="info-value">
                  <span className={`badge ${viewingProject.visibility === 'public' ? 'badge--green' : 'badge--red'}`}>
                    {viewingProject.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                  </span>
                </p>
              </div>
              
              <div className="info-item">
                <label>Portfolio Status</label>
                <p className="info-value">
                  <span className={`badge ${viewingProject.isVisibleOnPortfolio ? 'badge--green' : 'badge--red'}`}>
                    {viewingProject.isVisibleOnPortfolio ? '✓ Visible on Portfolio' : '✗ Hidden from Portfolio'}
                  </span>
                </p>
              </div>
              
              <div className="info-item">
                <label>Created At</label>
                <p className="info-value">{viewingProject.createdAt}</p>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="details-column">
            <div className="info-group">
              <div className="info-item">
                <label>Programming Languages</label>
                <div className="skills-list">
                  {viewingProject.programmingLanguages?.length > 0 ? (
                    viewingProject.programmingLanguages.map((lang, index) => (
                      <span key={index} className="skill-tag">{lang}</span>
                    ))
                  ) : (
                    <p className="info-value muted">No languages specified</p>
                  )}
                </div>
              </div>
              
              <div className="info-item">
                <label>GitHub Link</label>
                {viewingProject.githubLink ? (
                  <a href={viewingProject.githubLink} target="_blank" rel="noopener noreferrer" className="project-link github-link">
                    <span className="link-icon">🔗</span> View Repository
                  </a>
                ) : (
                  <p className="info-value muted">Not provided</p>
                )}
              </div>
              
              <div className="info-item">
                <label>Demo Video</label>
                {viewingProject.demoVideo ? (
                  <a href={viewingProject.demoVideo} target="_blank" rel="noopener noreferrer" className="project-link demo-link">
                    <span className="link-icon">🎬</span> Watch Demo
                  </a>
                ) : (
                  <p className="info-value muted">Not provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Flagged status section - full width */}
        {flaggedProjects[viewingProject.id]?.flagged && (
          <div className="flagged-section">
            <div className="flagged-warning">
              <span className="warning-icon">⚠️</span>
              <div className="flagged-content">
                <label>Flagged Status</label>
                <p className="flagged-reason">Reason: {flaggedProjects[viewingProject.id].reason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="modal-actions">
        <button onClick={() => setShowViewModal(false)} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  </div>
)}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', width: '500px' }}>
            <div className="modal-header"><h2>{editingProject ? '✏️ Edit Project' : '📁 Create New Project'}</h2><button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Project Title *</label>
                <input type="text" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} className={formErrors.title ? 'input-error' : ''} style={{ width: '100%', boxSizing: 'border-box' }} />
                {formErrors.title && <p className="error-message">{formErrors.title}</p>}
              </div>
              <div className="form-group">
                <label>Course *</label>
                <select value={formData.course} onChange={(e) => handleFormChange('course', e.target.value)} disabled={!!editingProject} className="filter-select" style={{ width: '100%' }}>
                  <option value="">Select a course</option>
                  {COURSES.map(course => <option key={course.id} value={course.name}>{course.name}</option>)}
                </select>
                {formErrors.course && <p className="error-message">{formErrors.course}</p>}
              </div>
              <div className="form-group">
                <label>GitHub Link</label>
                <input type="text" value={formData.githubLink} onChange={(e) => handleFormChange('githubLink', e.target.value)} placeholder="https://github.com/username/repo" className={formErrors.githubLink ? 'input-error' : ''} style={{ width: '100%' }} />
                {formErrors.githubLink && <p className="error-message">{formErrors.githubLink}</p>}
              </div>
              <div className="form-group">
                <label>Programming Languages (comma-separated)</label>
                <input type="text" value={formData.programmingLanguages} onChange={(e) => handleFormChange('programmingLanguages', e.target.value)} placeholder="React, JavaScript, Node.js" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Demo Video URL</label>
                <input type="text" value={formData.demoVideo} onChange={(e) => handleFormChange('demoVideo', e.target.value)} placeholder="https://youtube.com/watch?v=..." className={formErrors.demoVideo ? 'input-error' : ''} style={{ width: '100%' }} />
                {formErrors.demoVideo && <p className="error-message">{formErrors.demoVideo}</p>}
              </div>
              <div className="info-note" style={{ padding: '10px', background: 'var(--c-surface-2)', borderRadius: '8px', marginTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#059669' }}>
                  {formData.course === "Bachelor Project" 
                    ? "🎓 Note: Bachelor projects are solo projects. You will be the only member and can upload thesis drafts." 
                    : "👥 Note: For non-bachelor projects, you can invite collaborators and assign tasks."}
                </p>
              </div>
              <div className="modal-actions" style={{ flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                <button onClick={handleSubmitForm} className="submit-btn">{editingProject ? 'Update Project' : 'Create Project'}</button>
                <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="cancel-modal-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showThesisModal && (
        <div className="modal-overlay" onClick={() => setShowThesisModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', width: '400px' }}>
            <div className="modal-header"><h2>Upload Thesis Draft</h2><button className="modal-close" onClick={() => setShowThesisModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select PDF File</label>
                <input type="file" accept=".pdf" onChange={(e) => handleUploadThesisDraft(selectedProject.id, e.target.files[0])} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && !isBachelorCourse(selectedProject?.course) && (
  <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
    <div 
      className="modal-content" 
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: '90%', width: '650px' }}
    >
      <div className="modal-header">
        <h2>Invite Collaborators</h2>
        <button className="modal-close" onClick={() => setShowInviteModal(false)}>✕</button>
      </div>
      
      <div className="modal-body">
        {/* Course Info Banner */}
        <div style={{ 
          background: 'var(--c-blue-bg)', 
          padding: 'var(--sp-4)', 
          borderRadius: 'var(--r-lg)', 
          marginBottom: 'var(--sp-6)', 
          fontSize: '0.85rem', 
          color: '#93c5fd',
          border: '1px solid var(--c-primary-mid)'
        }}>
          <strong>📋 Selected Project Course: </strong>
          <strong style={{ color: '#93c5fd' }}>{selectedProject?.course}</strong>
          <br />
          <small>Showing: All students + Instructors who teach this course</small>
        </div>
        
        {/* Search Input */}
        <div className="form-group" style={{ marginBottom: 'var(--sp-5)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--sp-2)', fontWeight: '600', fontSize: '0.85rem' }}>🔍 Search Users</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            onChange={(e) => setCollaboratorSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Users List */}
        <div style={{ 
          maxHeight: '450px', 
          overflowY: 'auto', 
          border: '1px solid var(--c-border)', 
          borderRadius: 'var(--r-lg)', 
          background: 'var(--c-surface-2)',
          marginBottom: 'var(--sp-6)'
        }}>
          {(() => {
            const courseName = selectedProject?.course;
            
            // ALL USERS FROM YOUR DATA
            const ALL_USERS = [
              // STUDENTS FROM USERS array
              { id: 1, name: "Ahmed Mostafa", email: "ahmed.m@student.guc.edu.eg", role: "Student" },
              { id: 2, name: "Sara Ali", email: "sara.ali@student.guc.edu.eg", role: "Student" },
              { id: 3, name: "Youssef Khaled", email: "youssef.k@student.guc.edu.eg", role: "Student" },
              // INSTRUCTORS FROM USERS array
              { id: 4, name: "Dr. Mervat", email: "mervat@guc.edu.eg", role: "Course Instructor", coursesTaught: ['Software Engineering', 'Web Development'] },
              { id: 5, name: "Dr. Aya Salama", email: "aya.salama@guc.edu.eg", role: "Course Instructor", coursesTaught: ['Computer Networks', 'Cybersecurity'] },
              // INSTRUCTORS FROM COURSE_INSTRUCTORS array
              { id: 101, name: "Dr. Ahmed Hassan", email: "ahmed.hassan@guc.edu.eg", role: "Course Instructor", coursesTaught: ['Web Development', 'Computer Science', 'Database Systems', 'Software Engineering'] },
              { id: 102, name: "Prof. Sarah Mahmoud", email: "sarah.mahmoud@guc.edu.eg", role: "Senior Instructor", coursesTaught: ['Computer Networks', 'Web Development', 'UI/UX Design', 'Frontend Development'] },
              { id: 103, name: "Dr. Mohamed Ibrahim", email: "mohamed.ibrahim@guc.edu.eg", role: "Course Instructor", coursesTaught: ['Database Systems', 'Data Science', 'Artificial Intelligence', 'Machine Learning'] }
            ];
            
            // Filter out current user and already invited/collaborators
            const projectSentInvites = sentInvitations[selectedProject?.id] || [];
            const projectCollaboratorsList = collaborators[selectedProject?.id] || [];
            const invitedUserIds = projectSentInvites.map(inv => inv.userId);
            const collaboratorUserIds = projectCollaboratorsList.map(collab => collab.userId);
            const excludedUserIds = [...invitedUserIds, ...collaboratorUserIds, userId];
            
            // FILTER: Students always show + Instructors who teach this course ONLY
            let filteredUsers = ALL_USERS.filter(user => {
              // Exclude already invited/added users
              if (excludedUserIds.includes(user.id)) return false;
              // Students are ALWAYS eligible
              if (user.role === 'Student') return true;
              // Instructors ONLY if they teach this course
              if (user.role === 'Course Instructor' || user.role === 'Senior Instructor') {
                return user.coursesTaught?.includes(courseName);
              }
              return false;
            });
            
            // Apply search filter
            if (collaboratorSearch) {
              const searchLower = collaboratorSearch.toLowerCase();
              filteredUsers = filteredUsers.filter(u => 
                u.name.toLowerCase().includes(searchLower) || 
                u.email.toLowerCase().includes(searchLower)
              );
            }
            
            if (filteredUsers.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-muted)' }}>
                  <span style={{ fontSize: '48px' }}>👥</span>
                  <p style={{ marginTop: '16px', fontSize: '16px' }}>No eligible users found for this course</p>
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>Only students and instructors who teach {courseName} can be invited</p>
                </div>
              );
            }
            
            return filteredUsers.map(user => {
              const isSelected = selectedUsers.includes(user.id);
              
              return (
                <div
                  key={user.id}
                  style={{ 
                    padding: 'var(--sp-4) var(--sp-5)', 
                    borderBottom: '1px solid var(--c-border)', 
                    cursor: 'pointer', 
                    background: isSelected ? 'var(--c-primary-light)' : 'var(--c-surface-2)',
                    transition: 'background var(--t-fast)'
                  }}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    } else {
                      setSelectedUsers([...selectedUsers, user.id]);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--c-surface-3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--c-surface-2)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        cursor: 'pointer', 
                        marginTop: '2px',
                        accentColor: 'var(--c-primary)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--c-text)', fontSize: '1rem' }}>{user.name}</span>
                        <span style={{ 
                          display: 'inline-block', 
                          background: (user.role === 'Course Instructor' || user.role === 'Senior Instructor') ? 'var(--c-violet-bg)' : 'var(--c-blue-bg)', 
                          color: (user.role === 'Course Instructor' || user.role === 'Senior Instructor') ? '#c4b5fd' : '#93c5fd', 
                          padding: '4px 12px', 
                          borderRadius: 'var(--r-full)', 
                          fontSize: '0.7rem', 
                          fontWeight: '600' 
                        }}>
                          {(user.role === 'Course Instructor' || user.role === 'Senior Instructor') ? '👨‍🏫 Instructor' : '🎓 Student'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--c-text-2)', marginBottom: '6px' }}>{user.email}</div>
                      {user.coursesTaught && (
                        <div style={{ fontSize: '0.75rem', color: '#c4b5fd', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>📚 Teaches:</span>
                          {user.coursesTaught.map(course => (
                            <span key={course} style={{ background: 'var(--c-violet-bg)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.7rem', color: '#c4b5fd' }}>
                              {course}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setSelectedUsers([]);
              setCollaboratorSearch('');
            }}
            className="btn-secondary"
          >
            Clear Selection
          </button>
          
          <button
            onClick={() => {
              const ALL_USERS_FOR_SEND = [
                { id: 1, name: "Ahmed Mostafa", email: "ahmed.m@student.guc.edu.eg", role: "Student" },
                { id: 2, name: "Sara Ali", email: "sara.ali@student.guc.edu.eg", role: "Student" },
                { id: 3, name: "Youssef Khaled", email: "youssef.k@student.guc.edu.eg", role: "Student" },
                { id: 4, name: "Dr. Mervat", email: "mervat@guc.edu.eg", role: "Course Instructor" },
                { id: 5, name: "Dr. Aya Salama", email: "aya.salama@guc.edu.eg", role: "Course Instructor" },
                { id: 101, name: "Dr. Ahmed Hassan", email: "ahmed.hassan@guc.edu.eg", role: "Course Instructor" },
                { id: 102, name: "Prof. Sarah Mahmoud", email: "sarah.mahmoud@guc.edu.eg", role: "Senior Instructor" },
                { id: 103, name: "Dr. Mohamed Ibrahim", email: "mohamed.ibrahim@guc.edu.eg", role: "Course Instructor" }
              ];
              
              const selectedUserObjects = ALL_USERS_FOR_SEND.filter(u => selectedUsers.includes(u.id));
              
              if (selectedUserObjects.length === 0) {
                addNotification('No users selected', 'error');
                return;
              }
              
              const newInvitations = selectedUserObjects.map(user => ({
                id: Date.now() + Math.random(),
                userId: user.id,
                name: user.name,
                email: user.email,
                status: 'pending',
                invitedAt: new Date().toISOString(),
                role: user.role || 'collaborator'
              }));
              
              setSentInvitations(prev => ({
                ...prev,
                [selectedProject.id]: [...(prev[selectedProject.id] || []), ...newInvitations]
              }));
              
              addNotification(`Invitation(s) sent to ${selectedUserObjects.length} user(s)!`, 'success');
              setShowInviteModal(false);
              setSelectedUsers([]);
              setCollaboratorSearch('');
            }}
            className="btn-primary"
            disabled={selectedUsers.length === 0}
            style={{
              opacity: selectedUsers.length === 0 ? 0.5 : 1,
              cursor: selectedUsers.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Send Invitations ({selectedUsers.length})
          </button>
          
          <button
            onClick={() => {
              setShowInviteModal(false);
              setSelectedUsers([]);
              setCollaboratorSearch('');
            }}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {showTaskModal && !isBachelorCourse(selectedProject?.course) && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', width: '500px' }}>
            <div className="modal-header"><h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2><button className="modal-close" onClick={() => setShowTaskModal(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label>Task Title *</label>
                <input type="text" value={taskFormData.title} onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })} placeholder="Enter task title" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Description (1 line) *</label>
                <input type="text" value={taskFormData.description} onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })} placeholder="Brief task description" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskFormData.assignedTo} onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })} className="filter-select" style={{ width: '100%' }}>
                  <option value="">Unassigned</option>
                  {(collaborators[selectedProject?.id] || []).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={taskFormData.status} onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })} className="filter-select" style={{ width: '100%' }}>
                  <option value="pending">Pending</option>
                  <option value="post-poned">Post-poned</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={taskFormData.deadline} onChange={(e) => setTaskFormData({ ...taskFormData, deadline: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label>Importance (1-5)</label>
                <input type="number" min="1" max="5" value={taskFormData.importance} onChange={(e) => setTaskFormData({ ...taskFormData, importance: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div className="modal-actions" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <button onClick={() => editingTask ? handleUpdateTask(selectedProject.id) : handleCreateTask(selectedProject.id)} className="submit-btn">{editingTask ? 'Update' : 'Create'}</button>
                <button onClick={() => setShowTaskModal(false)} className="cancel-modal-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAppealModal && projectToAppeal && (
        <div className="modal-overlay" onClick={() => setShowAppealModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', width: '500px' }}>
            <div className="modal-header">
              <h2>📝 Appeal Project Flag</h2>
              <button className="modal-close" onClick={() => setShowAppealModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Project: <strong>{projectToAppeal.title}</strong></label>
              </div>
              <div className="form-group">
                <label>Reason for Flag</label>
                <p style={{ background: 'var(--c-surface-3)', padding: '10px', borderRadius: '8px', wordBreak: 'break-word' }}>
                  {flaggedProjects[projectToAppeal.id]?.reason}
                </p>
              </div>
              <div className="form-group">
                <label>Explain your point of view *</label>
                <textarea 
                  value={appealReason} 
                  onChange={(e) => setAppealReason(e.target.value)} 
                  placeholder="Please explain why the project should be unflagged. Provide any evidence or clarification that supports your case..." 
                  rows="6" 
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
                />
              </div>
              <div className="modal-actions" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <button onClick={handleSendAppeal} className="submit-btn">Submit Appeal</button>
                <button onClick={() => setShowAppealModal(false)} className="cancel-modal-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && projectToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90%', width: '400px' }}>
            <div className="modal-header"><h2>🗑️ Delete Project?</h2><button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button></div>
            <div className="modal-body">
              <p className="delete-warning" style={{ wordBreak: 'break-word' }}>
                Are you sure you want to delete "{projectToDelete.title}"? This action cannot be undone.
              </p>
              <div className="modal-actions" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <button onClick={handleConfirmDelete} className="cancel-btn">Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="cancel-modal-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProject;