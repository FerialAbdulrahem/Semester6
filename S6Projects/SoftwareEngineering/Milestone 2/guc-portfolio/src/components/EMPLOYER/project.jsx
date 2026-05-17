import React, { useState, useMemo } from 'react';
import { STUDENT_PROJECTS, USERS, COURSES } from '../../data/Data.js';
import ProjectSearchFilterSort from '../EMPLOYER/ProjectSearch.jsx';
import '../styles/AdminDashboard.css';
import '../styles/sideStyles.css';

const ProjectPage = ({ user }) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);

  // Get all projects from all students with student info
  const allProjects = useMemo(() => {
    const projects = [];
    
    Object.entries(STUDENT_PROJECTS).forEach(([studentId, studentProjects]) => {
      const student = USERS.find(u => u.id === parseInt(studentId));
      const studentName = student ? student.name : `Student ${studentId}`;
      const studentEmail = student?.email || '';
      const studentMajor = student?.major || 'N/A';
      
      studentProjects.forEach(project => {
        projects.push({
          ...project,
          studentId: parseInt(studentId),
          studentName: studentName,
          studentEmail: studentEmail,
          studentMajor: studentMajor
        });
      });
    });
    
    return projects;
  }, []);

  const handleViewProject = (project) => {
    setViewingProject(project);
    setSelectedStudent({
      name: project.studentName,
      email: project.studentEmail,
      major: project.studentMajor
    });
    setShowViewModal(true);
  };

  // Get instructors from USERS data
  const instructors = useMemo(() => {
    return USERS.filter(u => u.role === "Course Instructor" || u.role === "Instructor");
  }, []);

  return (
    <div className="page-container">
      <h1>Student Projects</h1>

      {/* Search, Filter, Sort Component */}
      <ProjectSearchFilterSort 
        projects={allProjects}
        courses={COURSES}
        users={instructors}
        onFilteredProjectsChange={setFilteredProjects}
        showActiveFilters={true}
      />

      {/* Projects Table */}
      {(filteredProjects.length > 0 ? filteredProjects : allProjects).length === 0 ? (
        <div className="empty-state">
          <p>📭 No projects found</p>
        </div>
      ) : (
        <div className="breakdown" style={{ overflowX: 'auto' }}>
          <p className="breakdown__title">All Student Projects</p>
          <table className="breakdown__table" style={{ minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filteredProjects.length > 0 ? filteredProjects : allProjects).map((project) => (
                <tr key={project.id} className="breakdown__row">
                  <td><strong>{project.title}</strong></td>
                  <td>{project.studentName}</td>
                  <td>{project.course}</td>
                  <td>{project.createdAt}</td>
                  <td>
                    <button 
                      onClick={() => handleViewProject(project)} 
                      className="edit-btn"
                    >
                      👁️ View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Project Modal */}
      {showViewModal && viewingProject && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Project Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Student Information Section */}
              <div className="info-section">
                <h3 className="section-subtitle">👤 Student Information</h3>
                <div className="info-item">
                  <label>Name:</label>
                  <p>{selectedStudent.name}</p>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <p>{selectedStudent.email}</p>
                </div>
                <div className="info-item">
                  <label>Major:</label>
                  <p>{selectedStudent.major}</p>
                </div>
              </div>

              {/* Project Information Section */}
              <div className="info-section">
                <h3 className="section-subtitle">📁 Project Information</h3>
                <div className="info-item">
                  <label>Project Title:</label>
                  <p><strong>{viewingProject.title}</strong></p>
                </div>
                
                <div className="info-item">
                  <label>Course:</label>
                  <p>{viewingProject.course}</p>
                </div>
                
                <div className="info-item">
                  <label>Created Date:</label>
                  <p>{viewingProject.createdAt}</p>
                </div>
                
                <div className="info-item">
                  <label>Visibility:</label>
                  <p>{viewingProject.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</p>
                </div>
                
                <div className="info-item">
                  <label>Portfolio Status:</label>
                  <p>{viewingProject.isVisibleOnPortfolio ? '✓ Visible on Portfolio' : '✗ Hidden from Portfolio'}</p>
                </div>
              </div>

              {/* Technical Details Section */}
              <div className="info-section">
                <h3 className="section-subtitle">💻 Technical Details</h3>
                <div className="info-item">
                  <label>GitHub Link:</label>
                  {viewingProject.githubLink ? (
                    <a href={viewingProject.githubLink} target="_blank" rel="noopener noreferrer">{viewingProject.githubLink}</a>
                  ) : (
                    <p className="not-provided">Not provided</p>
                  )}
                </div>
                
                <div className="info-item">
                  <label>Programming Languages:</label>
                  <div className="skills-list">
                    {viewingProject.programmingLanguages?.length > 0 ? (
                      viewingProject.programmingLanguages.map((lang, index) => (
                        <span key={index} className="skill-tag">{lang}</span>
                      ))
                    ) : (
                      <p className="not-provided">No languages specified</p>
                    )}
                  </div>
                </div>
                
                <div className="info-item">
                  <label>Demo Video:</label>
                  {viewingProject.demoVideo ? (
                    <a href={viewingProject.demoVideo} target="_blank" rel="noopener noreferrer">Watch Demo Video</a>
                  ) : (
                    <p className="not-provided">Not provided</p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowViewModal(false)} className="submit-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .section-subtitle {
          font-size: 1.1rem;
          font-weight: 600;
          color: #4f46e5;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e0e7ff;
        }
        
        .info-section {
          margin-bottom: 25px;
        }
        
        .not-provided {
          color: #999;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ProjectPage;