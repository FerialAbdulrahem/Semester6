import React, { useState } from 'react';
import '../styles/sideStyles.css';
import '../EMPLOYER/styles/favorite.css';

const StudentFavorite = ({ favoriteStudents = [], favoriteProjects = [], removeStudentFavorite, removeProjectFavorite }) => {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'portfolios'

  return (
    <div className="favorites-page">
      <div className="favorites-hero">
        <div>
          <h1 className="cm__heading">My Favorites</h1>
          <p className="favorite-subtitle">Manage your favorite projects and student portfolios</p>
        </div>
        <div className="favorites-stats">
          <div className="stat-card">
            <span className="stat-number">{favoriteProjects.length}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{favoriteStudents.length}</span>
            <span className="stat-label">Portfolios</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="favorite-tabs">
        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          📁 Projects ({favoriteProjects.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'portfolios' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolios')}
        >
          👤 Portfolios ({favoriteStudents.length})
        </button>
      </div>

      {/* Favorites List */}
      {activeTab === 'projects' && (
        <section className="favorites-section">
          <div className="section-header">
            <h2>Projects</h2>
          </div>

          {favoriteProjects.length === 0 ? (
            <div className="empty-state">
              <p>📭 No favorite projects yet</p>
              <p className="empty-desc">Add projects to your favorites to access them quickly</p>
            </div>
          ) : (
            <div className="favorites-grid">
              {favoriteProjects.map(project => (
                <div key={project.id} className="favorite-card">
                  <div className="favorite-top">
                    <div className="project-icon">📁</div>
                    <button
                      className="favorite-heart active"
                      onClick={() => removeProjectFavorite(project.id)}
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>

                  <h3>{project.title}</h3>
                  <div className="favorite-meta">
                    <span>{project.course}</span>
                    <span>{project.createdAt || project.date || 'No date'}</span>
                  </div>

                  <p>{project.description || 'No description available'}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'portfolios' && (
        <section className="favorites-section">
          <div className="section-header">
            <h2>Portfolios</h2>
          </div>

          {favoriteStudents.length === 0 ? (
            <div className="empty-state">
              <p>📭 No favorite portfolios yet</p>
              <p className="empty-desc">Add student portfolios to your favorites to access them quickly</p>
            </div>
          ) : (
            <div className="favorites-grid">
              {favoriteStudents.map(portfolio => (
                <div key={portfolio.id} className="favorite-card">
                  <div className="favorite-top">
                    <div className="favorite-avatar">{portfolio.name.charAt(0)}</div>
                    <button
                      className="favorite-heart active"
                      onClick={() => removeStudentFavorite(portfolio.id)}
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>

                  <h3>{portfolio.name}</h3>
                  <div className="favorite-meta">
                    <span>{portfolio.email}</span>
                    <span>{portfolio.major}</span>
                  </div>

                  <p>{portfolio.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
};

export default StudentFavorite;