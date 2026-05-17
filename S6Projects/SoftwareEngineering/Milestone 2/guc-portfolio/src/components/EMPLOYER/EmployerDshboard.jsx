import React, { useState } from 'react';
import "../styles/EmployerDashboard.css";

const EmployerDashboard = ({ user, setActivePage }) => {
  const [timeRange, setTimeRange] = useState('year');

  const stats = [
    { id: 1, label: 'Active Internships', value: '4', change: '+2 this month', icon: '💼', color: 'var(--c-primary)' },
    { id: 2, label: 'Total Applicants', value: '28', change: '+12 this week', icon: '👥', color: '#10b981' },
    { id: 3, label: 'Applications Pending', value: '16', change: 'need review', icon: '📋', color: '#f59e0b' },
    { id: 4, label: 'Nominated Students', value: '8', change: 'top candidates', icon: '⭐', color: '#ef4444' },
  ];

  // Internship Statistics
  const internshipStats = {
    totalInternshipsOffered: 24,
    totalStudentsCompleted: 18,
    currentInterns: 6,
    completionRate: 75,
  };

  // Chart data based on time range
  const getChartData = () => {
    if (timeRange === 'year') {
      return {
        internships: [8, 10, 6],
        students: [6, 9, 3],
        labels: ['2024', '2025', '2026'],
      };
    } else if (timeRange === 'month') {
      return {
        internships: [3, 2, 4, 5, 3, 2],
        students: [2, 1, 3, 4, 2, 1],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      };
    } else {
      return {
        internships: [18, 6],
        students: [15, 3],
        labels: ['2024-2025', '2025-2026'],
      };
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.internships, ...chartData.students);

  const recentApplicants = [
    { name: 'Mariam Boulos', position: 'Frontend Intern', status: 'Pending', avatar: 'MB' },
    { name: 'Omar Khaled', position: 'AI Internship', status: 'Nominated', avatar: 'OK' },
    { name: 'Sara Ahmed', position: 'Backend Intern', status: 'Pending', avatar: 'SA' },
    { name: 'Youssef Ali', position: 'ML Internship', status: 'Nominated', avatar: 'YA' },
  ];

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'nominated': return 'status-nominated';
      case 'accepted': return 'status-accepted';
      default: return 'status-pending';
    }
  };

  // Navigation function for search results

  return (
    <div className="employer-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="cm__heading">Welcome, {user?.name || 'Employer'}! 👋</h1>
        <p className="welcome-subtitle">
          Your personalized dashboard is here to help you manage internships and discover top talent.
        </p>
      </div>


      {/* Quick Actions */}
      <div className="quick-actions-row">
        <div className="quick-actions-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={() => setActivePage('epage3')}>
              ➕ Post New Internship
            </button>
            <button className="action-btn secondary" onClick={() => setActivePage('epage2')}>
              👥 Review Applications
            </button>
            <button className="action-btn secondary" onClick={() => setActivePage('epage1')}>
              🎓 Browse Portfolios
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.id} className="stat-card" style={{ borderTop: `3px solid ${stat.color}` }}>
            <div className="stat-card__icon">{stat.icon}</div>
            <div className="stat-card__info">
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
              <div className="stat-card__change">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Section */}
      <div className="statistics-section">
        <div className="statistics-header">
          <h3 className="section-title">Internship Statistics</h3>
          <div className="time-range-buttons">
            <button 
              className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Monthly
            </button>
            <button 
              className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              Yearly
            </button>
            <button 
              className={`time-btn ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-info">
              <div className="summary-value">{internshipStats.totalInternshipsOffered}</div>
              <div className="summary-label">Total Internships Offered</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🎓</div>
            <div className="summary-info">
              <div className="summary-value">{internshipStats.totalStudentsCompleted}</div>
              <div className="summary-label">Students Completed</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">👥</div>
            <div className="summary-info">
              <div className="summary-value">{internshipStats.currentInterns}</div>
              <div className="summary-label">Current Interns</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📈</div>
            <div className="summary-info">
              <div className="summary-value">{internshipStats.completionRate}%</div>
              <div className="summary-label">Completion Rate</div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <span className="chart-title">Internships vs Completed Students</span>
            <span className="chart-legend">
              <span className="legend-bar internships"></span> Internships Offered
              <span className="legend-bar students"></span> Students Completed
            </span>
          </div>
          <div className="bar-chart">
            {chartData.labels.map((label, index) => (
              <div key={index} className="bar-group">
                <div className="bars">
                  <div 
                    className="bar internships-bar" 
                    style={{ 
                      height: `${(chartData.internships[index] / maxValue) * 150}px`,
                      backgroundColor: 'var(--c-primary)'
                    }}
                  >
                    <span className="bar-value">{chartData.internships[index]}</span>
                  </div>
                  <div 
                    className="bar students-bar" 
                    style={{ 
                      height: `${(chartData.students[index] / maxValue) * 150}px`,
                      backgroundColor: '#10b981'
                    }}
                  >
                    <span className="bar-value">{chartData.students[index]}</span>
                  </div>
                </div>
                <div className="bar-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applicants Section */}
      <div className="recent-section">
        <div className="section-header">
          <h3 className="section-title">Recent Applicants</h3>
          <button className="view-all-link" onClick={() => setActivePage('epage2')}>
            View All →
          </button>
        </div>
        <div className="applicants-grid">
          {recentApplicants.map((applicant, idx) => (
            <div key={idx} className="applicant-card">
              <div className="applicant-avatar">{applicant.avatar}</div>
              <div className="applicant-info">
                <div className="applicant-name">{applicant.name}</div>
                <div className="applicant-position">{applicant.position}</div>
              </div>
              <div className={`applicant-status ${getStatusClass(applicant.status)}`}>
                {applicant.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Contact */}
      <div className="dashboard-footer">
        <div className="footer-contact">
          <span>📧 employer@guc.edu.eg</span>
          <span>📞 +20 (2) 2615-2694</span>
          <span>📍 New Cairo, Cairo</span>
        </div>
        <p>© 2024 InterConnect. Connecting employers with talented students.</p>
      </div>
    </div>
  );
};

export default EmployerDashboard;