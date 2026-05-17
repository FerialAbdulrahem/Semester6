import React, { useState, useEffect } from 'react';
import { STUDENT_PROJECTS, SAMPLE_COLLABORATORS } from '../../data/Data.js';
import StudentPortfolio from './StudentPortfolio';
import StudentProject from './StudentProject';

const StudentDashboard = ({
  user,
  setActivePage,
  favoriteStudents = [],
  favoriteProjects = [],
  notifications = [],
  unreadMessages = 0,
}) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [highlightedProject, setHighlightedProject] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Get projects from localStorage
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
  
  // Calculate language statistics
  const languagePercentages = () => {
    const langCount = {};
    userProjects.forEach(project => {
      if (project.programmingLanguages && Array.isArray(project.programmingLanguages)) {
        project.programmingLanguages.forEach(lang => {
          langCount[lang] = (langCount[lang] || 0) + 1;
        });
      }
    });
    const total = userProjects.length;
    return Object.entries(langCount).map(([language, count]) => ({
      language,
      percentage: total > 0 ? (count / total) * 100 : 0
    })).sort((a, b) => b.percentage - a.percentage);
  };

  const languagePercentagesData = languagePercentages();

  // Load recent activities
  useEffect(() => {
    const loadRecentActivities = () => {
      const savedActivities = localStorage.getItem(`recent_activities_${user.id}`);
      if (savedActivities) {
        setRecentActivities(JSON.parse(savedActivities));
      } else {
        const sampleActivities = [
          {
            id: 1,
            type: 'welcome',
            title: `Welcome to your dashboard, ${user.name}!`,
            date: new Date().toISOString(),
            icon: '🎉',
            color: '#38bdf8'
          },
          {
            id: 2,
            type: 'tip',
            title: '💡 Tip: Create your first project to get started',
            date: new Date().toISOString(),
            icon: '💡',
            color: '#f59e0b'
          }
        ];
        setRecentActivities(sampleActivities);
        localStorage.setItem(`recent_activities_${user.id}`, JSON.stringify(sampleActivities));
      }
    };
    
    loadRecentActivities();
  }, [user.id, user.name]);

  const addRecentActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      ...activity,
      date: new Date().toISOString()
    };
    const updatedActivities = [newActivity, ...recentActivities.slice(0, 9)];
    setRecentActivities(updatedActivities);
    localStorage.setItem(`recent_activities_${user.id}`, JSON.stringify(updatedActivities));
  };



  const SectionLabel = ({ text }) => <p className="section-label">{text}</p>;
  const CardGrid = ({ children }) => <div className="card-grid">{children}</div>;

  // Navigation helper - updates BOTH internal view AND parent nav bar
  const navigateTo = (view, pageName, activityTitle, icon, color) => {
    if (view) setActiveView(view);
    if (pageName) setActivePage(pageName);
    if (activityTitle) {
      addRecentActivity({
        type: 'navigation',
        title: activityTitle,
        icon: icon,
        color: color
      });
    }
  };

  // Quick Actions with correct navigation
  const quickActions = [
    { 
      id: 1, 
      label: 'Edit Portfolio', 
      sub: 'Update your profile', 
      icon: '📝', 
      color: '#f59e0b',
      onClick: () => navigateTo('portfolio', 'spage2', 'Started editing portfolio', '📝', '#f59e0b')
    },
    { 
      id: 2, 
      label: 'Create Project', 
      sub: 'Start a new project', 
      icon: '📁', 
      color: '#38bdf8',
      onClick: () => navigateTo('projects', 'spage3', 'Opened projects section', '📁', '#38bdf8')
    },
    { 
      id: 3, 
      label: 'Apply for Internship', 
      sub: 'Find and apply', 
      icon: '💼', 
      color: '#10b981',
      onClick: () => navigateTo(null, 'spage1', 'Browsed internship opportunities', '💼', '#10b981')
    },
    
    { 
      id: 4, 
      label: 'View Recommended Projects', 
      sub: 'Discover new projects', 
      icon: '🌟', 
      color: '#a78bfa',
      onClick: () => navigateTo(null, 'spage4', 'Exploring recommended projects', '🌟', '#a78bfa')
    },
  ];

  const StatCard = ({ label, value, color, icon, sub, onClick }) => (
    <div
      className="stat-card stat-card--clickable"
      style={{ 
        borderTop: `3px solid ${color}`, 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--sh-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--sh-xs)';
        }
      }}
    >
      <div className="stat-card__top">
        <span className="stat-card__icon">{icon}</span>
        <span className="stat-card__value" style={{ color }}>{value || ''}</span>
      </div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
      {onClick && <div className="stat-card__hint">Click to go →</div>}
    </div>
  );

  const handleNavigateToProject = (project) => {
    setHighlightedProject(project);
    setActiveView('projects');
    setActivePage('studentProjects');
    addRecentActivity({
      type: 'project',
      title: `Viewed project: ${project.title}`,
      icon: '👁️',
      color: '#38bdf8'
    });
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    // Optionally update parent to show dashboard is active
    // setActivePage('studentDashboard');
  };

  // Render Dashboard
  const renderDashboard = () => (
    <>
      <h1 className="cm__heading">Welcome back, {user.name}! 👋</h1>
      
      {/* Quick Actions Section */}
      <div className="section">
        <SectionLabel text="Quick Actions" />
        <CardGrid>
          {quickActions.map(action => (
            <StatCard 
              key={action.id}
              label={action.label}
              value=""
              color={action.color}
              icon={action.icon}
              sub={action.sub}
              onClick={action.onClick}
            />
          ))}
        </CardGrid>
      </div>

      {/* Project Statistics */}
      <div className="section">
          <SectionLabel text=" Project Statistics" />
       
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Total Projects Card */}
          <div 
            style={{ 
              background: 'var(--c-surface-2)', 
              borderRadius: '12px', 
              padding: '24px', 
              border: '1px solid var(--c-border)', 
              boxShadow: 'var(--sh-xs)', 
              transition: 'all 0.3s ease', 
              color: 'var(--c-text)',
             
            }}
            
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', color: 'var(--c-text-2)', marginBottom: '8px' }}>Total Projects</div>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--c-text)' }}>
                  {userProjects.length}
                </div>
              </div>
              <div style={{ fontSize: '48px', opacity: 0.3 }}>📁</div>
            </div>
          </div>

          {/* Programming Languages Card */}
          {languagePercentagesData.length > 0 && (
            <div style={{ 
              background: 'var(--c-surface-2)', 
              borderRadius: '12px', 
              padding: '24px', 
              border: '1px solid var(--c-border)', 
              boxShadow: 'var(--sh-xs)', 
              transition: 'all 0.3s ease' 
            }}>
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💻</span>
                Programming Languages
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {languagePercentagesData.slice(0, 4).map((lang, idx) => {
                  const barColors = ['#ff6b6b', '#7fb2d3', '#3dff7a', '#a96bcf'];
                  return (
                    <div key={lang.language}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--c-text)' }}>{lang.language}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', background: 'var(--c-surface-3)', padding: '2px 8px', borderRadius: '12px', color: 'var(--c-text)' }}>{lang.percentage.toFixed(0)}%</span>
                      </div>
                      <div style={{ background: 'var(--c-surface-3)', borderRadius: '6px', overflow: 'hidden', height: '8px', position: 'relative' }}>
                        <div style={{ width: `${lang.percentage}%`, background: barColors[idx % barColors.length], height: '100%', borderRadius: '6px', transition: 'width 0.3s ease' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Collaborators Card */}
          <div 
            style={{ 
              background: 'var(--c-surface-2)', 
              borderRadius: '12px', 
              padding: '24px', 
              border: '1px solid var(--c-border)', 
              boxShadow: 'var(--sh-xs)', 
              transition: 'all 0.3s ease',
              
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--c-text)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>👥</span>
              Top Collaborators
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userProjects.slice(0, 2).map((project, idx) => {
                const projectCollaborators = SAMPLE_COLLABORATORS[project.id] || [];
                return (
                  <div key={idx} style={{ background: 'var(--c-surface-3)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--c-primary-mid)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--c-text)', marginBottom: '4px' }}>
                      {project.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--c-text-2)', lineHeight: '1.5' }}>
                      {projectCollaborators.length > 0 ? projectCollaborators.map(c => c.name).join(', ') : 'No collaborators'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
<div className="section">
  <SectionLabel text="Recent Activities" />
  <div style={{ 
    background: 'var(--c-surface)', 
    borderRadius: 'var(--r-xl)', 
    border: '1px solid var(--c-border)',
    overflow: 'hidden'
  }}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Activity 1 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--c-border)',
          transition: 'background var(--t-fast)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-surface-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: '28px' }}>📁</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: 'var(--c-text)', marginBottom: '4px' }}>
            Created project: AI Chatbot Platform
          </div>
          <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>
            2 days ago
          </div>
        </div>
        <div style={{ width: '8px', height: '8px', borderRadius: 'var(--r-full)', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
      </div>

      {/* Activity 2 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--c-border)',
          transition: 'background var(--t-fast)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-surface-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: '28px' }}>💼</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: 'var(--c-text)', marginBottom: '4px' }}>
            Applied for Frontend Developer Intern
          </div>
          <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>
            5 days ago
          </div>
        </div>
        <div style={{ width: '8px', height: '8px', borderRadius: 'var(--r-full)', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
      </div>

      {/* Activity 3 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--c-border)',
          transition: 'background var(--t-fast)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-surface-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: '28px' }}>📝</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: 'var(--c-text)', marginBottom: '4px' }}>
            Updated portfolio with new skills
          </div>
          <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>
            1 week ago
          </div>
        </div>
        <div style={{ width: '8px', height: '8px', borderRadius: 'var(--r-full)', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
      </div>

      {/* Activity 4 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--c-border)',
          transition: 'background var(--t-fast)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-surface-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: '28px' }}>👥</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: 'var(--c-text)', marginBottom: '4px' }}>
            Joined project: E-Commerce Platform as collaborator
          </div>
          <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>
            2 weeks ago
          </div>
        </div>
        <div style={{ width: '8px', height: '8px', borderRadius: 'var(--r-full)', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }} />
      </div>

      {/* Activity 5 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          transition: 'background var(--t-fast)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-surface-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontSize: '28px' }}>🎉</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: 'var(--c-text)', marginBottom: '4px' }}>
            Completed internship: Web Development Intern
          </div>
          <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>
            3 weeks ago
          </div>
        </div>
        <div style={{ width: '8px', height: '8px', borderRadius: 'var(--r-full)', background: '#6ee7b7', boxShadow: '0 0 6px #6ee7b7' }} />
      </div>
    </div>
  </div>
</div>
    </>
  );

  const renderPortfolio = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleBackToDashboard}
          style={{
            background: 'var(--c-surface-2)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text-2)',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--c-primary-light)';
            e.currentTarget.style.color = '#93c5fd';
            e.currentTarget.style.borderColor = 'var(--c-primary-mid)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--c-surface-2)';
            e.currentTarget.style.color = 'var(--c-text-2)';
            e.currentTarget.style.borderColor = 'var(--c-border)';
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ margin: 0 }}>My Portfolio</h1>
      </div>
      <StudentPortfolio user={user} onNavigateToProject={handleNavigateToProject} />
    </>
  );

  const renderProjects = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleBackToDashboard}
          style={{
            background: 'var(--c-surface-2)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text-2)',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--c-primary-light)';
            e.currentTarget.style.color = '#93c5fd';
            e.currentTarget.style.borderColor = 'var(--c-primary-mid)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--c-surface-2)';
            e.currentTarget.style.color = 'var(--c-text-2)';
            e.currentTarget.style.borderColor = 'var(--c-border)';
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ margin: 0 }}>My Projects</h1>
      </div>
      <StudentProject user={user} highlightProject={highlightedProject} />
    </>
  );

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'portfolio' && renderPortfolio()}
        {activeView === 'projects' && renderProjects()}
      </div>
    </div>
  );
};

export default StudentDashboard;