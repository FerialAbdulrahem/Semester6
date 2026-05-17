import { useMemo, useState } from "react";
import "./styles/applications.css";

const internshipByStudentId = {
  3: "Frontend Internship - React Team",
  4: "AI Internship - Data Team",
  5: "Backend Internship - Cloud Team",
  6: "Embedded Systems Internship - IoT Team",
  7: "Frontend Internship - Vue Team",
  8: "Backend Internship - Node Team",
};

export default function ApplicationPage({ favoriteStudents = [] }) {

  const [applications, setApplications] = useState([
    {
      id: 1,
      name: "Mariam Boulos",
      email: "mariam@guc.edu.eg",
      major: "Computer Engineering",
      projects: 4,
      status: "pending",
      internship: "Frontend Internship - React Team"
    },
    {
      id: 2,
      name: "Omar Khaled",
      email: "omar@guc.edu.eg",
      major: "Computer Science",
      projects: 6,
      status: "pending",
      internship: "AI Internship - Data Team"
    },
    {
      id: 3,
      name: "Sara Ahmed",
      email: "sara@guc.edu.eg",
      major: "Software Engineering",
      projects: 2,
      status: "pending",
      internship: "Backend Internship - Node Team"
    },
    {
      id: 4,
      name: "Youssef Ali",
      email: "youssef@guc.edu.eg",
      major: "Computer Science",
      projects: 8,
      status: "pending",
      internship: "ML Internship - AI Team"
    },
    {
      id: 5,
      name: "Nour El Din",
      email: "nour@guc.edu.eg",
      major: "Information Systems",
      projects: 5,
      status: "pending",
      internship: "UI/UX Internship - Design Team"
    }
  ]);

  // Local status overrides for favorited students shown in the suggested section
  const [suggestedStatuses, setSuggestedStatuses] = useState({});

  const updateStatus = (id, newStatus) => {
    setApplications(applications.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  const updateSuggestedStatus = (id, newStatus) => {
    setSuggestedStatuses(prev => ({ ...prev, [id]: newStatus }));
  };

  // Suggested = students the employer favorited (from StudentFavorite / Explore page)
  // Enriched with a status field (defaulting to "pending") for the dropdown
  const favoritedApplications = useMemo(() => {
    return favoriteStudents.map(s => ({
      ...s,
      internship: internshipByStudentId[s.id] || "General Internship",
      status: suggestedStatuses[s.id] ?? "pending",
    }));
  }, [favoriteStudents, suggestedStatuses]);

  // Regular applications: all hardcoded ones, sorted by projects desc
  const regularApplications = useMemo(() => {
    return [...applications].sort((a, b) => b.projects - a.projects);
  }, [applications]);

  const getStatusClass = (status) => {
    switch(status) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'nominated': return 'status-nominated';
      default: return 'status-pending';
    }
  };

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h1 className="cm__heading">Internship Applications</h1>
        <p style={{ marginTop: 'var(--sp-5)' }}>Review and manage student candidates</p>
      </div>

      {/* Suggested Section - driven by favoriteStudents prop from DashboardLayout */}
      {favoritedApplications.length > 0 && (
        <div className="suggested-section">
          <div className="suggested-header">
            <div className="suggested-title">
              <span className="suggested-icon">❤️</span>
              <h2>Suggested for You</h2>
            </div>
            <p className="suggested-description">
              These students were added to your favorites
            </p>
          </div>

          <div className="applications-grid">
            {favoritedApplications.map((app) => (
              <div key={app.id} className="application-card suggested-card">
                <div className="favorite-badge">❤️ Favorited</div>

                <div className="student-section">
                  <h3 className="student-name">{app.name}</h3>
                  <p className="student-major">{app.major}</p>
                  <div className="student-details">
                    <span className="detail">
                      <span className="detail-icon">📧</span> {app.email}
                    </span>
                    <span className="detail">
                      <span className="detail-icon">📁</span> {Array.isArray(app.projects) ? app.projects.length : app.projects} projects
                    </span>
                  </div>
                </div>

                <div className="internship-section">
                  <div className="internship-name">{app.internship || "—"}</div>
                  <div className="status-container">
                    <select
                      className={`status-dropdown ${getStatusClass(app.status)}`}
                      value={app.status}
                      onChange={(e) => updateSuggestedStatus(app.id, e.target.value)}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="nominated">⭐ Nominated</option>
                      <option value="accepted">✅ Accepted</option>
                      <option value="rejected">❌ Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Applications Section */}
      <div className="all-applications-section">
        <div className="all-header">
          <h2>All Applications</h2>
          <span className="count-badge">{regularApplications.length} candidates</span>
        </div>

        <div className="applications-grid">
          {regularApplications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="student-section">
                <h3 className="student-name">{app.name}</h3>
                <p className="student-major">{app.major}</p>
                <div className="student-details">
                  <span className="detail">
                    <span className="detail-icon">📧</span> {app.email}
                  </span>
                  <span className="detail">
                    <span className="detail-icon">📁</span> {app.projects} projects
                  </span>
                </div>
              </div>

              <div className="internship-section">
                <div className="internship-name">{app.internship}</div>
                <div className="status-container">
                  <select
                    className={`status-dropdown ${getStatusClass(app.status)}`}
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="nominated">⭐ Nominated</option>
                    <option value="accepted">✅ Accepted</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {regularApplications.length === 0 && (
            <div className="empty-state">
              <span>📭</span>
              <p>No other applications yet</p>
            </div>
          )}
        </div>
      </div>

      {applications.length === 0 && (
        <div className="empty-state">
          <span>📭</span>
          <p>No applications yet</p>
        </div>
      )}
    </div>
  );
}