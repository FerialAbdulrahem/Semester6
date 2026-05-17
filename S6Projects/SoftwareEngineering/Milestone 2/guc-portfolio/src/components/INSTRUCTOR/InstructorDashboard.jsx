// InstructorDashboard.jsx
import React from 'react';

const InstructorDashboard = ({ user, setActivePage }) => {
  const stats = {
    totalStudents: 350,
    activeCourses: 3,
    pendingReviews: 6,
    submissionsThisWeek: 7
  };

  const courses = [
    { id: 1, name: 'Software Engineering', code: 'CSEN603', students: 100 },
    { id: 2, name: 'Data Base I', code: 'CSEN502', students: 100},
    { id: 3, name: 'Computer and Programming lab ', code: 'CSEN401', students: 150 }
  ];

  const StatCard = ({ label, value, icon }) => (
    <div className="stat-card" style={{ textAlign: 'center' }}>
      <div className="stat-icon stat-icon--blue" style={{ margin: '0 auto 12px auto' }}>
        {icon}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );

  const ActionButton = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px 12px',
        cursor: 'pointer',
        width: '100%'
      }}
    >
      <span style={{ fontSize: '28px' }}>{icon}</span>
      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-text)' }}>{label}</span>
    </button>
  );

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        <div className="welcome-section">
          <h1 className="cm__heading">Welcome back, {user.name} 👋</h1>
          <p className="welcome-subtitle">
            Here's an overview of your teaching activities this semester
          </p>
        </div>

        <div style={{ marginBottom: '48px' }}>
          <div className="section-label" style={{ marginBottom: '20px', textAlign: 'left' }}>
            At a Glance
          </div>
          <div className="stats-grid">
            <StatCard label="Total Students" value={stats.totalStudents} icon="👥" />
            <StatCard label="Active Courses" value={stats.activeCourses} icon="📚" />
            <StatCard label="Pending Reviews" value={stats.pendingReviews} icon="📋" />
            <StatCard label="Submissions This Week" value={stats.submissionsThisWeek} icon="📤" />
          </div>
        </div>

        <div style={{ marginBottom: '48px' }}>
          <div className="section-label" style={{ marginBottom: '20px', textAlign: 'left' }}>
            Your Teaching Load
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courses.map((course) => (
              <div key={course.id} className="card" style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: '700', color: 'var(--c-text)' }}>
                    {course.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--c-text-2)' }}>
                    {course.code} • {course.students} students
                  </p>
                </div>
                <span style={{ fontSize: '20px', color: 'var(--c-primary)' }}>→</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '48px' }}>
          <div className="section-label" style={{ marginBottom: '20px', textAlign: 'left' }}>
            Quick Actions
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px'
          }}>
            <ActionButton 
              icon="📋" 
              label="Task Feedback"
              onClick={() => setActivePage('itask')}
            />
            <ActionButton 
              icon="👤" 
              label="My Profile"
              onClick={() => setActivePage('ipage1')}
            />
            <ActionButton 
              icon="📚" 
              label="Courses"
              onClick={() => setActivePage('ipage2')}
            />
            <ActionButton 
              icon="🎓" 
              label="Projects"
              onClick={() => setActivePage('ipage3')}
            />
          </div>
        </div>

        <div className="card" style={{ background: 'var(--c-primary-light)', borderColor: 'var(--c-primary-mid)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '700', color: 'var(--c-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💡 Pro Tip
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--c-text-2)', lineHeight: '1.6' }}>
            Regular feedback on student work helps them improve faster. Consider reviewing pending tasks at least twice a week to maintain engagement and provide timely guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;