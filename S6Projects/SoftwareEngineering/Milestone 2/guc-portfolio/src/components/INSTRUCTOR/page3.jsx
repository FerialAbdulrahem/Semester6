// page3.jsx
import React, { useEffect, useMemo, useState } from 'react';

const projectsStorageKey = 'guc-portfolio-project-ratings';
const commentsStorageKey = 'guc-portfolio-project-comments';

const createProjectsList = () => [
  {
    id: 'proj_001',
    title: 'AI-Driven Healthcare App',
    type: 'Bachelor Project',
    description: 'A mobile application leveraging machine learning for healthcare diagnostics.',
    students: ['Ahmed', 'Sara'],
    status: 'Completed',
    submissionDate: '2025-11-15',
    rating: 0,
    courseName: null,
    thesisDraft: 'thesis_draft_001.pdf',
    comments: []
  },
  {
    id: 'proj_002',
    title: 'Software Engineering',
    type: 'Course Project',
    courseName: 'Software Engineering',
    description: 'A comprehensive web platform for student portfolio management and tracking.',
    students: ['Youssef', 'Karim'],
    status: 'In Progress',
    submissionDate: '2025-12-20',
    rating: 0,
    thesisDraft: null,
    comments: []
  },
  {
    id: 'proj_003',
    title: 'Cloud-Based Data Analytics Dashboard',
    type: 'Bachelor Project',
    description: 'Real-time analytics dashboard for processing and visualizing large datasets.',
    students: ['Fatima', 'Mohamed', 'Layla'],
    status: 'Completed',
    submissionDate: '2025-10-30',
    rating: 0,
    courseName: null,
    thesisDraft: 'thesis_draft_003.pdf',
    comments: []
  },
  {
    id: 'proj_004',
    title: 'Web Development',
    type: 'Course Project',
    courseName: 'Web Development',
    description: 'IoT-based system for intelligent traffic flow optimization in smart cities.',
    students: ['Ali', 'Nour'],
    status: 'Submitted',
    submissionDate: '2025-11-25',
    rating: 0,
    thesisDraft: null,
    comments: []
  },
  {
    id: 'proj_005',
    title: 'Augmented Reality Education Platform',
    type: 'Bachelor Project',
    description: 'AR-powered learning platform for interactive educational experiences.',
    students: ['Dina', 'Hassan', 'Zainab'],
    status: 'In Progress',
    submissionDate: '2026-01-15',
    rating: 0,
    courseName: null,
    thesisDraft: 'thesis_draft_005.pdf',
    comments: []
  }
];

const StarRating = ({ projectId, initialRating, onRate }) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starIndex) => {
    const newRating = starIndex + 1;
    setRating(newRating);
    onRate(projectId, newRating);
  };

  const handleStarHover = (starIndex) => {
    setHoverRating(starIndex + 1);
  };

  return (
    <div className="sp-stars" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <button
          key={index}
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => handleStarHover(index)}
          onMouseLeave={() => setHoverRating(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: (hoverRating || rating) > index ? '#f59e0b' : 'var(--c-muted)',
            transition: 'all var(--t-fast)',
            padding: 0
          }}
        >
          ★
        </button>
      ))}
      {rating > 0 && <span className="sp-stars__val" style={{ marginLeft: '8px' }}>({rating}/5)</span>}
    </div>
  );
};

const CommentSection = ({ projectId, comments, onAddComment, onEditComment, onRemoveComment }) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(projectId, newComment.trim());
      setNewComment('');
    }
  };

  const handleEditStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleEditSave = (commentId) => {
    if (editingText.trim()) {
      onEditComment(projectId, commentId, editingText.trim());
      setEditingCommentId(null);
      setEditingText('');
    }
  };

  return (
    <div style={{ marginTop: 'var(--sp-5)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--c-border)' }}>
      <h4 className="section-label" style={{ marginBottom: 'var(--sp-3)', textAlign: 'left' }}>Feedback & Comments</h4>

      <form onSubmit={handleAddComment} style={{ marginBottom: 'var(--sp-4)' }}>
        <textarea
          className="sp__search-input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add feedback or comment on this project..."
          rows="3"
          style={{ width: '100%', marginBottom: 'var(--sp-2)' }}
        />
        <button className="btn-primary" type="submit">
          Add Comment
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {comments.length === 0 ? (
          <p className="empty-state-subtitle">No comments yet. Be the first to add feedback!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="card" style={{ padding: 'var(--sp-4)' }}>
              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    className="sp__search-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows="3"
                    style={{ width: '100%', marginBottom: 'var(--sp-2)' }}
                  />
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <button className="btn-primary" onClick={() => handleEditSave(comment.id)} type="button">
                      Save
                    </button>
                    <button className="btn-secondary" onClick={() => setEditingCommentId(null)} type="button">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                    <span className="badge badge--primary">Instructor</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--c-muted)' }}>
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--c-text-2)', marginBottom: 'var(--sp-3)', lineHeight: 1.5 }}>{comment.text}</p>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <button className="btn-secondary" onClick={() => handleEditStart(comment)} type="button" style={{ minWidth: 'auto', padding: '4px 12px' }}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => onRemoveComment(projectId, comment.id)} type="button" style={{ minWidth: 'auto', padding: '4px 12px' }}>
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Page3 = ({ user }) => {
  const projectsList = useMemo(() => createProjectsList(), []);
  const [projects, setProjects] = useState(projectsList);

  useEffect(() => {
    try {
      const storedRatings = window.localStorage.getItem(projectsStorageKey);
      const storedComments = window.localStorage.getItem(commentsStorageKey);

      if (storedRatings || storedComments) {
        const ratingsMap = storedRatings ? JSON.parse(storedRatings) : {};
        const commentsMap = storedComments ? JSON.parse(storedComments) : {};

        setProjects((prevProjects) =>
          prevProjects.map((project) => ({
            ...project,
            rating: ratingsMap[project.id] || 0,
            comments: commentsMap[project.id] || [],
          }))
        );
      }
    } catch (error) {
      console.warn('Unable to load project data:', error);
    }
  }, []);

  useEffect(() => {
    try {
      const ratingsMap = {};
      const commentsMap = {};
      projects.forEach((project) => {
        if (project.rating > 0) {
          ratingsMap[project.id] = project.rating;
        }
        if (project.comments.length > 0) {
          commentsMap[project.id] = project.comments;
        }
      });
      window.localStorage.setItem(projectsStorageKey, JSON.stringify(ratingsMap));
      window.localStorage.setItem(commentsStorageKey, JSON.stringify(commentsMap));
    } catch (error) {
      console.warn('Unable to save project data:', error);
    }
  }, [projects]);

  const handleRate = (projectId, newRating) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId ? { ...project, rating: newRating } : project
      )
    );
  };

  const handleAddComment = (projectId, commentText) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              comments: [
                ...project.comments,
                {
                  id: `${Date.now()}-${Math.random()}`,
                  text: commentText,
                  date: new Date().toISOString(),
                },
              ],
            }
          : project
      )
    );
  };

  const handleEditComment = (projectId, commentId, newText) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              comments: project.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, text: newText, date: new Date().toISOString() }
                  : comment
              ),
            }
          : project
      )
    );
  };

  const handleRemoveComment = (projectId, commentId) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              comments: project.comments.filter((comment) => comment.id !== commentId),
            }
          : project
      )
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Completed': '#10b981',
      'In Progress': '#3b82f6',
      'Submitted': '#f59e0b',
      'Awaiting Review': '#ef4444'
    };
    return statusColors[status] || 'var(--c-text-2)';
  };

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        <h1 className="cm__heading">Projects 📋</h1>

        <div className="internships-grid">
          {projects.map((project) => (
            <div key={project.id} className="internship-card">
              <div className="internship-header">
                <div>
                  <h3>{project.title}</h3>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
                    <span className="badge badge--violet">{project.type}</span>
                    <span className="badge" style={{ backgroundColor: getStatusColor(project.status), color: 'white', border: 'none' }}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>

              {project.courseName && (
                <div className="application-info" style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                  <strong>Course:</strong> {project.courseName}
                </div>
              )}

              <p className="description">{project.description}</p>

              <div className="internship-meta">
                <span>👥 {project.students.join(', ')}</span>
                <span>📅 Submitted: {project.submissionDate}</span>
              </div>

              {project.thesisDraft && (
                <div className="application-info" style={{ marginTop: 'var(--sp-3)' }}>
                  <span>📄 Thesis Draft: </span>
                  <button type="button" className="link-btn" style={{ padding: 0 }}>
                    {project.thesisDraft}
                  </button>
                </div>
              )}

              <div className="card-actions" style={{ marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                <span className="stat-label" style={{ marginRight: 'var(--sp-2)' }}>Rate Project:</span>
                <StarRating
                  projectId={project.id}
                  initialRating={project.rating}
                  onRate={handleRate}
                />
              </div>

              <CommentSection
                projectId={project.id}
                comments={project.comments}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onRemoveComment={handleRemoveComment}
              />
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="empty-state">
            <p>No projects available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page3;