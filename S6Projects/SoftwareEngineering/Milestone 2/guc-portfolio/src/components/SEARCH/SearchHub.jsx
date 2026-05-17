import React, { useState } from 'react';
import GlobalSearchBar from './GlobalSearchBar.jsx';

const SearchHub = ({ user }) => {
  const [selected, setSelected] = useState(null);
  const [flaggedProjectIds, setFlaggedProjectIds] = useState([]);

  const handleResultClick = (type, item) => {
    setSelected({ type, item });
  };

  const handleFlagProject = () => {
    if (!selected || selected.type !== 'project') return;
    setFlaggedProjectIds((prev) => [...new Set([...prev, selected.item.id])]);
  };

  const renderDetails = () => {
    if (!selected) {
      return (
        <div className="search-hub__empty" style={{ padding: '24px', color: 'var(--c-text-2)' }}>
          Select a project, portfolio, or instructor from the search results to view its details here.
        </div>
      );
    }

    const { type, item } = selected;

    if (type === 'project') {
      return (
        <div className="search-hub__details-card" style={{ padding: '24px', background: 'var(--c-surface)', borderRadius: '18px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>{item.title}</h2>
              <p style={{ margin: '8px 0 0', color: 'var(--c-text-2)' }}>{item.course || 'No course assigned'}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {flaggedProjectIds.includes(item.id) || item.flagged ? (
                <span style={{ color: '#b91c1c', fontWeight: 700 }}>🚩 Flagged</span>
              ) : null}
              {(user.role === 'instructor' || user.role === 'admin') && !flaggedProjectIds.includes(item.id) && !item.flagged ? (
                <button
                  type="button"
                  onClick={handleFlagProject}
                  style={{ background: '#fca5a5', color: 'var(--c-surface)', border: 'none', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer' }}
                >
                  Flag Project
                </button>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginTop: '24px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--c-text-2)' }}>Student</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{item.student || 'Unknown'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--c-text-2)' }}>Instructor</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{item.instructor || 'Not assigned'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--c-text-2)' }}>Created</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{item.createdAt || 'Unknown'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--c-text-2)' }}>Rating</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{item.rating !== undefined ? item.rating : 'N/A'}</p>
            </div>
          </div>

          {item.description && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Description</h3>
              <p style={{ margin: 0, color: 'var(--c-text-2)', lineHeight: 1.75 }}>{item.description}</p>
            </div>
          )}
        </div>
      );
    }

    if (type === 'portfolio') {
      return (
        <div className="search-hub__details-card" style={{ padding: '24px', background: 'var(--c-surface)', borderRadius: '18px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
          <h2 style={{ marginTop: 0 }}>{item.name}</h2>
          <p style={{ margin: '6px 0 16px', color: 'var(--c-text-2)' }}>{item.email}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Major</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{item.major || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Projects</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{item.projectCount ?? 0}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Skills</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{item.skills?.join(', ') || 'N/A'}</p>
            </div>
          </div>

          {item.projects?.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Portfolio Projects</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
                {item.projects.map((project) => (
                  <li key={project.id} style={{ padding: '14px', borderRadius: '12px', background: 'var(--c-surface-2)', color: 'var(--c-text-2)' }}>
                    <strong>{project.title}</strong>
                    <div style={{ fontSize: '13px', color: 'var(--c-text-2)' }}>{project.course} • {project.date}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (type === 'instructor') {
      return (
        <div className="search-hub__details-card" style={{ padding: '24px', background: 'var(--c-surface)', borderRadius: '18px', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
          <h2 style={{ marginTop: 0 }}>{item.name}</h2>
          <p style={{ margin: '6px 0 16px', color: 'var(--c-text-2)' }}>{item.email}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Instructor</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>Course Instructor</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Courses</p>
              <p style={{ margin: 0, color: 'var(--c-text-2)' }}>{item.courses.length}</p>
            </div>
          </div>

          {item.courses.length > 0 ? (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Linked Courses</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
                {item.courses.map((course, idx) => (
                  <li key={idx} style={{ padding: '14px', borderRadius: '12px', background: 'var(--c-surface-2)', color: 'var(--c-text-2)' }}>
                    {course}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ color: 'var(--c-text-2)' }}>No linked courses available.</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        <h1 className="dashboard__heading">Search Hub</h1>
        <p className="section-label">Search projects, portfolios, and course instructors in one place.</p>

        <GlobalSearchBar onResultClick={handleResultClick} />

        <div style={{ marginTop: '24px' }}>
          {renderDetails()}
        </div>
      </div>
    </div>
  );
};

export default SearchHub;
