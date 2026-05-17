// instructorinvitations.jsx
import React, { useState } from 'react';

const invitationsStorageKey = 'guc-portfolio-instructor-invitations';

const createDefaultInvitations = () => [
  {
    id: 1,
    projectTitle: 'Network Visualizer',
    student: 'Ahmed Hassan',
    course: 'Computer Networks',
    type: 'Supervision',
    message: 'You have been invited to supervise the Network Visualizer project by Ahmed Hassan.',
    date: '2026-05-04',
    status: 'pending',
  },
  {
    id: 2,
    projectTitle: 'Smart Campus App',
    student: 'Sara Khaled',
    course: 'Software Engineering',
    type: 'Course Review',
    message: 'You have been invited to review the Smart Campus App project as a course instructor by Sara Khaled.',
    date: '2026-05-03',
    status: 'pending',
  },
  {
    id: 3,
    projectTitle: 'AI Healthcare Diagnostics',
    student: 'Omar Farouk',
    course: 'Artificial Intelligence',
    type: 'Supervision',
    message: 'You have been invited to supervise the AI Healthcare Diagnostics bachelor project.',
    date: '2026-04-28',
    status: 'pending',
  },
];

const loadInvitations = () => {
  try {
    const saved = window.localStorage.getItem(invitationsStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Unable to load invitations:', e);
  }
  return createDefaultInvitations();
};

const saveInvitations = (invitations) => {
  try {
    window.localStorage.setItem(invitationsStorageKey, JSON.stringify(invitations));
  } catch (e) {
    console.warn('Unable to save invitations:', e);
  }
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  accepted: '#10b981',
  rejected: '#ef4444',
};

const STATUS_LABELS = {
  pending: '⏳ Pending',
  accepted: '✅ Accepted',
  rejected: '❌ Rejected',
};

const InstructorInvitations = ({ user }) => {
  const [invitations, setInvitations] = useState(loadInvitations);
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (message, color = '#10b981') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDecision = (id, decision) => {
    const updated = invitations.map((inv) =>
      inv.id === id ? { ...inv, status: decision } : inv
    );
    setInvitations(updated);
    saveInvitations(updated);
    showToast(
      decision === 'accepted'
        ? '✅ Invitation accepted successfully.'
        : '❌ Invitation rejected.',
      decision === 'accepted' ? '#10b981' : '#ef4444'
    );
  };

  const filtered =
    filterStatus === 'all'
      ? invitations
      : invitations.filter((inv) => inv.status === filterStatus);

  const counts = {
    all: invitations.length,
    pending: invitations.filter((i) => i.status === 'pending').length,
    accepted: invitations.filter((i) => i.status === 'accepted').length,
    rejected: invitations.filter((i) => i.status === 'rejected').length,
  };

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        <h1 className="cm__heading">Project Invitations 📬</h1>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {['all', 'pending', 'accepted', 'rejected'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterStatus(key)}
              className={`card ${filterStatus === key ? 'tab-btn--active' : ''}`}
              style={{
                flex: '1 1 120px',
                padding: '14px 20px',
                border: filterStatus === key ? '2px solid var(--c-primary)' : '1px solid var(--c-border)',
                background: filterStatus === key ? 'var(--c-primary-light)' : 'var(--c-surface)',
                cursor: 'pointer',
                fontWeight: filterStatus === key ? '700' : '500',
                fontSize: '14px',
                color: 'var(--c-text)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>
                {key === 'all' ? '📋' : key === 'pending' ? '⏳' : key === 'accepted' ? '✅' : '❌'}
              </div>
              <div style={{ textTransform: 'capitalize' }}>{key}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--c-primary)' }}>{counts[key]}</div>
            </button>
          ))}
        </div>

        <div className="internships-grid">
          {filtered.length === 0 && (
            <div className="empty-state">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p>No invitations in this category.</p>
            </div>
          )}

          {filtered.map((inv) => (
            <div key={inv.id} className="internship-card" style={{ borderLeft: `4px solid ${STATUS_COLORS[inv.status]}` }}>
              <div className="internship-header">
                <div>
                  <h3>📁 {inv.projectTitle}</h3>
                  <span className="badge badge--primary">{inv.type}</span>
                </div>
                <span className="badge" style={{ backgroundColor: STATUS_COLORS[inv.status], color: 'white', border: 'none' }}>
                  {STATUS_LABELS[inv.status]}
                </span>
              </div>

              <div className="internship-meta">
                <span>👤 {inv.student}</span>
                <span>📖 {inv.course}</span>
                <span>📅 {new Date(inv.date).toLocaleDateString()}</span>
              </div>

              <p className="description" style={{ fontStyle: 'italic' }}>
                "{inv.message}"
              </p>

              {inv.status === 'pending' && (
                <div className="card-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleDecision(inv.id, 'accepted')}
                    style={{ background: '#10b981' }}
                  >
                    ✅ Accept
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDecision(inv.id, 'rejected')}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {inv.status !== 'pending' && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--c-muted)' }}>
                  Decision recorded. You can no longer change this invitation.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: toast.color,
            color: 'white',
            padding: '14px 24px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: 'var(--sh-lg)',
            zIndex: 9999,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default InstructorInvitations;