import React, { useMemo, useState } from 'react';
import { PORTFOLIO_STUDENTS } from '../../data/Data';
import { getRecommendedProjects} from '../../data/recommendedProjectsData';
import '../styles/sideStyles.css';
import '../EMPLOYER/styles/favorite.css';
import '../styles/exploreModal.css';

const ENHANCED_PORTFOLIO_STUDENTS = [
  ...PORTFOLIO_STUDENTS,
  {
    id: 3,
    name: 'Youssef Mansour',
    email: 'youssef@guc.edu.eg',
    major: 'Computer Engineering',
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    description: 'Full-stack developer passionate about building scalable web applications.',
    projects: [
      { id: 301, title: 'E-Learning Platform', course: 'Web Development', instructor: 'Dr. Sara', date: '2026-04-25', technologies: ['React', 'Node.js', 'MongoDB'], description: 'Online learning platform.' },
      { id: 302, title: 'Task Management App', course: 'Software Engineering', instructor: 'Dr. Ahmed', date: '2026-03-20', technologies: ['React', 'Express', 'PostgreSQL'], description: 'Team collaboration tool for task tracking.' },
      { id: 303, title: 'Real-time Dashboard', course: 'Database Systems', instructor: 'Dr. Mona', date: '2026-04-10', technologies: ['Socket.io', 'React', 'Node.js'], description: 'Real-time analytics dashboard.' },
    ],
  },
  {
    id: 4,
    name: 'Nadine Atef',
    email: 'nadine@guc.edu.eg',
    major: 'Computer Science',
    skills: ['Python', 'Django', 'Machine Learning'],
    description: 'AI and data science enthusiast focused on predictive modeling.',
    projects: [
      { id: 401, title: 'Stock Price Predictor', course: 'Artificial Intelligence', instructor: 'Dr. Khaled', date: '2026-02-28', technologies: ['Python', 'TensorFlow', 'scikit-learn'], description: 'LSTM-based stock price prediction model.' },
      { id: 402, title: 'Movie Recommendation System', course: 'Data Mining', instructor: 'Dr. Mona', date: '2026-03-15', technologies: ['Python', 'Pandas', 'Surprise'], description: 'Collaborative filtering recommendation engine.' },
    ],
  },
  {
    id: 5,
    name: 'Karim Wael',
    email: 'karim@guc.edu.eg',
    major: 'Information Systems',
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    description: 'Backend developer specializing in microservices and cloud architecture.',
    projects: [
      { id: 501, title: 'Cloud Inventory System', course: 'Cloud Computing', instructor: 'Dr. Youssef', date: '2026-04-18', technologies: ['Java', 'Spring Boot', 'AWS'], description: 'Inventory management system deployed on AWS.' },
    ],
  },
  {
    id: 6,
    name: 'Farida Hany',
    email: 'farida@guc.edu.eg',
    major: 'Computer Engineering',
    skills: ['C++', 'Embedded Systems', 'IoT'],
    description: 'Embedded systems engineer working on IoT solutions.',
    projects: [
      { id: 601, title: 'Smart Home Automation', course: 'Embedded Systems', instructor: 'Dr. Ahmed', date: '2026-01-15', technologies: ['Arduino', 'C++', 'MQTT'], description: 'IoT-based home automation system.' },
      { id: 602, title: 'Waste Management Tracker', course: 'IoT Systems', instructor: 'Dr. Youssef', date: '2026-03-30', technologies: ['ESP32', 'Sensors', 'Cloud'], description: 'Smart bin monitoring system.' },
      { id: 603, title: 'Health Monitoring Device', course: 'Digital System Design', instructor: 'Dr. Ahmed', date: '2026-04-05', technologies: ['C++', 'Bluetooth', 'Sensors'], description: 'Wearable health tracking device.' },
    ],
  },
  {
    id: 7,
    name: 'Seif Eldin',
    email: 'seif@guc.edu.eg',
    major: 'Computer Science',
    skills: ['JavaScript', 'Vue.js', 'Firebase'],
    description: 'Frontend developer creating responsive and accessible web applications.',
    projects: [
      { id: 701, title: 'E-commerce Store', course: 'Web Development', instructor: 'Dr. Sara', date: '2026-04-22', technologies: ['Vue.js', 'Firebase', 'Tailwind'], description: 'Full-featured e-commerce platform.' },
      { id: 702, title: 'Social Media Dashboard', course: 'Software Engineering', instructor: 'Dr. Ahmed', date: '2026-03-10', technologies: ['Vue.js', 'Chart.js', 'Firebase'], description: 'Analytics dashboard for social media metrics.' },
    ],
  },
  {
    id: 8,
    name: 'Laila Hussein',
    email: 'laila@guc.edu.eg',
    major: 'Information Systems',
    skills: ['PHP', 'Laravel', 'MySQL', 'Bootstrap'],
    description: 'Full-stack developer focused on business information systems.',
    projects: [
      { id: 801, title: 'HR Management System', course: 'Database Systems', instructor: 'Dr. Mona', date: '2025-12-20', technologies: ['PHP', 'Laravel', 'MySQL'], description: 'Complete HR management solution.' },
      { id: 802, title: 'Inventory Management', course: 'Information Systems', instructor: 'Dr. Khaled', date: '2026-02-14', technologies: ['PHP', 'Laravel', 'Bootstrap'], description: 'Warehouse inventory tracking system.' },
    ],
  },
];

const ENHANCED_PROJECTS = [

  { id: 5, title: "E-Learning Platform", student: "Youssef Mansour", course: "Web Development", instructor: "Dr. Sara", date: "2026-04-25", technologies: ["React", "Node.js", "MongoDB"], rating: 4.8, description: "Online learning platform." },
  { id: 6, title: "Stock Price Predictor", student: "Nadine Atef", course: "Artificial Intelligence", instructor: "Dr. Khaled", date: "2026-02-28", technologies: ["Python", "TensorFlow"], rating: 4.9, description: "LSTM-based stock prediction model." },
  { id: 7, title: "Smart Home Automation", student: "Farida Hany", course: "Embedded Systems", instructor: "Dr. Ahmed", date: "2026-01-15", technologies: ["Arduino", "C++"], rating: 4.6, description: "IoT home automation system." },
  { id: 8, title: "Task Management App", student: "Youssef Mansour", course: "Software Engineering", instructor: "Dr. Ahmed", date: "2026-03-20", technologies: ["React", "Express"], rating: 4.5, description: "Team collaboration tool." },
  { id: 9, title: "Movie Recommender", student: "Nadine Atef", course: "Data Mining", instructor: "Dr. Mona", date: "2026-03-15", technologies: ["Python", "Pandas"], rating: 4.7, description: "Movie recommendation engine." },
  { id: 10, title: "Cloud Inventory System", student: "Karim Wael", course: "Cloud Computing", instructor: "Dr. Youssef", date: "2026-04-18", technologies: ["Java", "Spring Boot", "AWS"], rating: 4.4, description: "AWS cloud inventory system." },
  { id: 11, title: "E-commerce Store", student: "Seif Eldin", course: "Web Development", instructor: "Dr. Sara", date: "2026-04-22", technologies: ["Vue.js", "Firebase"], rating: 4.9, description: "Full e-commerce platform." },
  { id: 12, title: "HR Management System", student: "Laila Hussein", course: "Database Systems", instructor: "Dr. Mona", date: "2025-12-20", technologies: ["PHP", "Laravel"], rating: 4.2, description: "HR management solution." },
  { id: 14, title: "AI Image Classifier", student: "Nadine Atef", course: "Artificial Intelligence", instructor: "Dr. Khaled", date: "2026-05-01", technologies: ["Python", "PyTorch"], rating: 4.9, description: "Deep learning image classification." },
  { id: 15, title: "Blockchain Voting System", student: "Karim Wael", course: "Cloud Computing", instructor: "Dr. Youssef", date: "2026-05-05", technologies: ["Solidity", "Web3"], rating: 4.7, description: "Decentralized voting platform." },
];

const canFavorite = (userRole) => userRole === 'student' || userRole === 'employer';
const canSeeRecommended = (userRole) => userRole === 'student' || userRole === 'employer' || userRole === 'instructor';
const canFlag = (userRole) => userRole === 'admin' || userRole === 'instructor';

const StudentExplore = ({
  user,
  favoriteStudents = [],
  favoriteProjects = [],
  addStudentFavorite,
  addProjectFavorite,
  removeStudentFavorite,
  removeProjectFavorite,
  userRole: userRoleProp = 'student'
}) => {
  const userRole = user?.role || userRoleProp;
  const [activeTab, setActiveTab] = useState('portfolios');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterMajor, setFilterMajor] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterInstructor, setFilterInstructor] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [flagModal, setFlagModal] = useState(null); // { project }
  const [flagReason, setFlagReason] = useState('');
  const [flaggedProjects, setFlaggedProjects] = useState(() => {
    try {
      const saved = window.localStorage.getItem('guc-portfolio-flagged-projects');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  const [flagToast, setFlagToast] = useState(null);

  const allStudents = useMemo(() => ENHANCED_PORTFOLIO_STUDENTS, []);
  const allProjects = useMemo(() => ENHANCED_PROJECTS, []);

  const recommendedProjectsList = useMemo(() => {
    return getRecommendedProjects(userRole, favoriteStudents, favoriteProjects);
  }, [userRole, favoriteStudents, favoriteProjects]);

  const allInstructors = useMemo(() => {
    const instructorMap = new Map();
    allProjects.forEach(project => {
      if (project.instructor) {
        if (!instructorMap.has(project.instructor)) {
          instructorMap.set(project.instructor, {
            id: `inst-${project.instructor.replace(/\s/g, '')}`,
            name: project.instructor,
            courses: new Set(),
            projects: [],
            students: new Set(),
            rating: 0
          });
        }
        const instructor = instructorMap.get(project.instructor);
        instructor.courses.add(project.course);
        instructor.projects.push(project);
        instructor.students.add(project.student);
        const totalRating = instructor.projects.reduce((sum, p) => sum + (p.rating || 0), 0);
        instructor.rating = totalRating / instructor.projects.length;
      }
    });
    return Array.from(instructorMap.values()).map(inst => ({
      ...inst,
      courses: Array.from(inst.courses),
      students: Array.from(inst.students),
      projectCount: inst.projects.length
    }));
  }, [allProjects]);

  const majors = useMemo(() => ['all', ...new Set(allStudents.map(s => s.major))], [allStudents]);
  const skills = useMemo(() => ['all', ...new Set(allStudents.flatMap(s => s.skills))], [allStudents]);
  const courses = useMemo(() => ['all', ...new Set(allProjects.map(p => p.course))], [allProjects]);
  const instructors = useMemo(() => ['all', ...new Set(allProjects.map(p => p.instructor).filter(Boolean))], [allProjects]);

  const search = searchTerm.trim().toLowerCase();

  const filteredPortfolios = useMemo(() => {
    let filtered = allStudents.filter(student => {
      const matchesSearch = search === '' ||
        student.name.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search);
      const matchesMajor = filterMajor === 'all' || student.major === filterMajor;
      const matchesSkill = filterSkill === 'all' || student.skills.includes(filterSkill);
      return matchesSearch && matchesMajor && matchesSkill;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'popular') return (b.projects?.length || 0) - (a.projects?.length || 0);
      const dateA = a.projects?.[0]?.date || '1970-01-01';
      const dateB = b.projects?.[0]?.date || '1970-01-01';
      return new Date(dateB) - new Date(dateA);
    });
  }, [allStudents, search, filterMajor, filterSkill, sortBy]);

  const filteredProjects = useMemo(() => {
    let filtered = allProjects.filter(project => {
      // Students and employers never see flagged (deactivated) projects
      if (!canFlag(userRole) && flaggedProjects[project.id]) return false;
      const matchesSearch = search === '' || project.title.toLowerCase().includes(search);
      const matchesCourse = filterCourse === 'all' || project.course === filterCourse;
      const matchesInstructor = filterInstructor === 'all' || project.instructor === filterInstructor;
      let matchesDateRange = true;
      if (startDate || endDate) {
        const projectDate = new Date(project.date);
        if (startDate && new Date(startDate) > projectDate) matchesDateRange = false;
        if (endDate && new Date(endDate) < projectDate) matchesDateRange = false;
      }
      return matchesSearch && matchesCourse && matchesInstructor && matchesDateRange;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'popular') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01');
    });
  }, [allProjects, search, filterCourse, filterInstructor, startDate, endDate, sortBy, flaggedProjects, userRole]);

  const filteredInstructors = useMemo(() => {
    let filtered = allInstructors.filter(instructor => {
      const matchesSearch = search === '' ||
        instructor.name.toLowerCase().includes(search) ||
        instructor.courses.some(course => course.toLowerCase().includes(search));
      return matchesSearch;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'popular') return b.projectCount - a.projectCount;
      return b.rating - a.rating;
    });
  }, [allInstructors, search, sortBy]);

  const studentIsFavorite = (id) => favoriteStudents.some(s => s.id === id);
  const projectIsFavorite = (id) => favoriteProjects.some(p => p.id === id);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setFilterMajor('all');
    setFilterSkill('all');
    setFilterCourse('all');
    setFilterInstructor('all');
    setStartDate('');
    setEndDate('');
    setSortBy('latest');
    setSelectedItem(null);
  };

  const handleClearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleFavoriteToggle = (item, type) => {
    if (type === 'student') {
      studentIsFavorite(item.id) ? removeStudentFavorite(item.id) : addStudentFavorite(item);
    } else {
      projectIsFavorite(item.id) ? removeProjectFavorite(item.id) : addProjectFavorite(item);
    }
  };

  const showFlagToast = (message, color = '#ef4444') => {
    setFlagToast({ message, color });
    setTimeout(() => setFlagToast(null), 3000);
  };

  const handleOpenFlagModal = (project) => {
    setFlagModal({ project });
    setFlagReason('');
  };

  const handleSubmitFlag = () => {
    if (!flagReason.trim()) return;
    const updated = {
      ...flaggedProjects,
      [flagModal.project.id]: {
        reason: flagReason.trim(),
        flaggedAt: new Date().toISOString(),
        flaggedBy: user?.name || 'Instructor/Admin',
        status: 'deactivated',
      },
    };
    setFlaggedProjects(updated);
    try {
      window.localStorage.setItem('guc-portfolio-flagged-projects', JSON.stringify(updated));
    } catch (e) { console.warn('Could not save flagged projects:', e); }
    setFlagModal(null);
    setFlagReason('');
    showFlagToast('🚩 Project flagged and automatically deactivated.');
  };

  const isProjectFlagged = (id) => !!flaggedProjects[id];

  // FIXED: Projects without rating show zero stars
  const renderRating = (rating) => {
    if (!rating || rating === 0) {
      return <span className="rating">☆☆☆☆☆ (No rating yet)</span>;
    }
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    const stars = '⭐'.repeat(fullStars) + '☆'.repeat(emptyStars);
    return <span className="rating">{stars} ({rating.toFixed(1)})</span>;
  };

  const getRecommendationTitle = () => {
    switch (userRole) {
      case 'student': return '🎓 Recommended For You';
      case 'employer': return '💼 Recommended Projects for Hiring';
      case 'instructor': return '📚 Recommended Projects to Review';
      default: return '⭐ Recommended Projects';
    }
  };

  const getRecommendationSubtitle = () => {
    switch (userRole) {
      case 'student': return 'Based on your major, skills, and interests';
      case 'employer': return 'Matched with your hiring requirements and industry needs';
      case 'instructor': return 'Projects from your courses or aligned with your expertise';
      default: return 'Personalized project recommendations';
    }
  };

  return (
    <div className="favorites-page">
      <div className="favorites-hero">
        <div>
          <h1 className="cm__heading">Explore Students, Projects & Instructors</h1>
          <p className="favorite-subtitle" style={{ marginTop: 'var(--sp-5)' }}>
  {activeTab === 'portfolios' && '🔍 Search by name/email | Filter by major/skills | Sort by project count'}
  {activeTab === 'projects' && '🔍 Search by title | Filter by course/instructor/date range | Sort by date/rating'}
  {activeTab === 'instructors' && '🔍 Search by name or course | Sort by projects/rating'}
  {activeTab === 'recommended' && getRecommendationSubtitle()}
</p>
        </div>
        <div className="favorites-stats">
          <div className="stat-card">
            <span className="stat-number">{allStudents.length}</span>
            <span className="stat-label">Portfolios</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{allProjects.length}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{allInstructors.length}</span>
            <span className="stat-label">Instructors</span>
          </div>
        </div>
      </div>

      <div className="favorite-tabs">
        <button className={`tab-btn ${activeTab === 'portfolios' ? 'active' : ''}`} onClick={() => handleTabChange('portfolios')}>
          📁 Portfolios ({filteredPortfolios.length})
        </button>
        <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => handleTabChange('projects')}>
          🚀 Projects ({filteredProjects.length})
        </button>
        <button className={`tab-btn ${activeTab === 'instructors' ? 'active' : ''}`} onClick={() => handleTabChange('instructors')}>
          👨‍🏫 Instructors ({filteredInstructors.length})
        </button>
        {canSeeRecommended(userRole) && (
          <button className={`tab-btn ${activeTab === 'recommended' ? 'active' : ''}`} onClick={() => handleTabChange('recommended')}>
            ⭐ Recommended ({recommendedProjectsList.length})
          </button>
        )}
      </div>

      <div className="explore-controls">
        {activeTab !== 'recommended' && (
          <input
            className="search-input"
            type="text"
            placeholder={
              activeTab === 'portfolios' ? '🔍 Search by student name or email (e.g., "Mariam" or "mariam@guc.edu.eg")' :
              activeTab === 'projects' ? '🔍 Search by project title (e.g., "Smart" or "Chatbot")' :
              '🔍 Search by instructor name or course (e.g., "Dr. Sara" or "Web Development")'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}

        {activeTab === 'recommended' && (
          <div className="recommendation-banner" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'var(--c-surface)',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🎯</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{getRecommendationTitle()}</h3>
                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>
                  {getRecommendationSubtitle()} • Based on {favoriteStudents.length} favorite students and {favoriteProjects.length} favorite projects
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="control-row">
          {activeTab === 'portfolios' && (
            <>
              <select value={filterMajor} onChange={(e) => setFilterMajor(e.target.value)}>
                <option value="all">📚 All Majors</option>
                {majors.slice(1).map(major => <option key={major} value={major}>{major}</option>)}
              </select>
              <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
                <option value="all">⚙️ All Skills</option>
                {skills.slice(1).map(skill => <option key={skill} value={skill}>{skill}</option>)}
              </select>
            </>
          )}

          {activeTab === 'projects' && (
            <>
              <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                <option value="all">📖 All Courses</option>
                {courses.slice(1).map(course => <option key={course} value={course}>{course}</option>)}
              </select>
              <select value={filterInstructor} onChange={(e) => setFilterInstructor(e.target.value)}>
                <option value="all">👨‍🏫 All Instructors</option>
                {instructors.slice(1).map(instructor => <option key={instructor} value={instructor}>{instructor}</option>)}
              </select>
            </>
          )}

          {activeTab !== 'recommended' && (
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {activeTab === 'portfolios' ? (
                <>
                  <option value="latest">📅 Newest (by project date)</option>
                  <option value="popular">📊 Most Projects</option>
                  <option value="name">🔤 Name (A-Z)</option>
                </>
              ) : activeTab === 'projects' ? (
                <>
                  <option value="latest">📅 Newest (by creation date)</option>
                  <option value="popular">⭐ Highest Rated</option>
                  <option value="name">🔤 Title (A-Z)</option>
                </>
              ) : (
                <>
                  <option value="latest">⭐ Highest Rated</option>
                  <option value="popular">📊 Most Projects</option>
                  <option value="name">🔤 Name (A-Z)</option>
                </>
              )}
            </select>
          )}
        </div>

        {activeTab === 'projects' && (
          <div className="date-range-filter" style={{
            display: 'flex',
            gap: '12px',
            marginTop: '12px',
            padding: '12px',
            background: 'var(--c-surface-2)',
            borderRadius: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <label style={{ fontWeight: '500', color: 'var(--c-text-2)' }}>📅 Filter by Creation Date:</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={handleClearDateFilters}
                style={{ padding: '8px 16px', background: '#ef4444', color: 'var(--c-surface)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
              >
                Clear Dates
              </button>
            )}
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', marginLeft: 'auto' }}>
              {filteredProjects.length} projects in date range
            </span>
          </div>
        )}
      </div>

      <div className="favorites-grid">
        {/* PORTFOLIOS GRID */}
        {activeTab === 'portfolios' && filteredPortfolios.map(student => (
          <div key={student.id} className="favorite-card">
            <div className="favorite-top">
              <div className="favorite-avatar">{student.name.charAt(0)}</div>
              {canFavorite(userRole) && (
                <button className={`favorite-heart ${studentIsFavorite(student.id) ? 'active' : ''}`}
                  onClick={() => handleFavoriteToggle(student, 'student')}>
                  {studentIsFavorite(student.id) ? '❤️' : '🤍'}
                </button>
              )}
            </div>
            <h3>{student.name}</h3>
            <div className="favorite-meta">
              <span>🎓 {student.major}</span>
              <span>📧 {student.email}</span>
              <span>📁 {student.projects?.length || 0} projects</span>
            </div>
            <p>{student.description}</p>
            <div className="tag-row">
              {student.skills.slice(0, 4).map(skill => <span key={skill} className="tag">{skill}</span>)}
            </div>
            <button className="view-btn" onClick={() => setSelectedItem({ type: 'portfolio', item: student })}>
              View Portfolio
            </button>
          </div>
        ))}

        {/* PROJECTS GRID - FIXED: Flag button same size as View Details */}
        {activeTab === 'projects' && filteredProjects.map(project => (
          <div key={project.id} className="favorite-card" style={isProjectFlagged(project.id) ? { opacity: 0.7, border: '2px solid #ef4444' } : {}}>
            <div className="favorite-top">
              <div className="project-icon">📁</div>
              {canFavorite(userRole) && (
                <button className={`favorite-heart ${projectIsFavorite(project.id) ? 'active' : ''}`}
                  onClick={() => handleFavoriteToggle(project, 'project')}>
                  {projectIsFavorite(project.id) ? '❤️' : '🤍'}
                </button>
              )}
            </div>
            <h3>{project.title}</h3>
            {isProjectFlagged(project.id) && (
              <div style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                🚩 Flagged & Deactivated — Reason: {flaggedProjects[project.id].reason}
              </div>
            )}
            <div>{renderRating(project.rating || 0)}</div>
            <div className="favorite-meta">
              <span>📖 {project.course}</span>
              <span>👨‍🏫 {project.instructor || 'N/A'}</span>
              <span>👤 {project.student}</span>
              <span>📅 {project.date ? new Date(project.date).toLocaleDateString() : 'N/A'}</span>
            </div>
            <p>{project.description || 'No description'}</p>
            {project.technologies && (
              <div className="tag-row">
                {project.technologies.slice(0, 3).map(tech => <span key={tech} className="tag">{tech}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="view-btn" style={{ flex: 1 }} onClick={() => setSelectedItem({ type: 'project', item: project })}>
                View Details
              </button>
              {canFlag(userRole) && !isProjectFlagged(project.id) && (
                <button
                  onClick={() => handleOpenFlagModal(project)}
                  className="view-btn"
                  style={{ flex: 1, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}
                  title="Flag this project as inappropriate"
                >
                  🚩 Flag
                </button>
              )}
            </div>
          </div>
        ))}

        {/* INSTRUCTORS GRID */}
        {activeTab === 'instructors' && filteredInstructors.map(instructor => (
          <div key={instructor.id} className="favorite-card">
            <div className="favorite-top">
              <div className="favorite-avatar">{instructor.name.charAt(0)}</div>
              <div className="instructor-badge">👨‍🏫</div>
            </div>
            <h3>{instructor.name}</h3>
            <div className="favorite-meta">
              <span>📚 {instructor.projectCount} projects</span>
              <span>👥 {instructor.students.length} students</span>
              <span>⭐ {instructor.rating.toFixed(1)} avg</span>
            </div>
            <div className="courses-taught">
              <strong>Courses:</strong>
              <div className="tag-row">
                {instructor.courses.slice(0, 3).map(course => (
                  <span key={course} className="tag">{course}</span>
                ))}
                {instructor.courses.length > 3 && <span className="tag">+{instructor.courses.length - 3}</span>}
              </div>
            </div>
            <button className="view-btn" onClick={() => setSelectedItem({ type: 'instructor', item: instructor })}>
              View Details
            </button>
          </div>
        ))}

        {/* RECOMMENDED PROJECTS GRID - FIXED: Flag button same size as View Details */}
        {activeTab === 'recommended' && recommendedProjectsList
          .filter(project => canFlag(userRole) || !flaggedProjects[project.id])
          .map(project => (
          <div key={project.id} className="favorite-card" style={{ borderLeft: '4px solid #667eea', ...(isProjectFlagged(project.id) ? { opacity: 0.7, border: '2px solid #ef4444' } : {}) }}>
            <div className="favorite-top">
              <div className="project-icon">
                {userRole === 'student' && '🎓'}
                {userRole === 'employer' && '💼'}
                {userRole === 'courseInstructor' && '📚'}
              </div>
              {canFavorite(userRole) && (
                <button className={`favorite-heart ${projectIsFavorite(project.id) ? 'active' : ''}`}
                  onClick={() => handleFavoriteToggle(project, 'project')}>
                  {projectIsFavorite(project.id) ? '❤️' : '🤍'}
                </button>
              )}
            </div>
            <h3>{project.title}</h3>
            {isProjectFlagged(project.id) && (
              <div style={{ background: '#fef2f2', color: '#ef4444', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                🚩 Flagged & Deactivated — Reason: {flaggedProjects[project.id].reason}
              </div>
            )}
            <div>{renderRating(project.rating || 0)}</div>
            {project.score && (
              <div style={{ fontSize: '12px', color: '#667eea', marginTop: '4px' }}>
                Match Score: {Math.round(project.score)}%
              </div>
            )}
            <div className="favorite-meta">
              <span>📖 {project.course}</span>
              <span>👨‍🏫 {project.instructor || 'N/A'}</span>
              <span>👤 {project.student}</span>
              <span>📅 {project.date ? new Date(project.date).toLocaleDateString() : 'N/A'}</span>
            </div>
            <p>{project.description || 'No description'}</p>
            {project.technologies && (
              <div className="tag-row">
                {project.technologies.slice(0, 3).map(tech => <span key={tech} className="tag">{tech}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className="view-btn" style={{ flex: 1 }} onClick={() => setSelectedItem({ type: 'project', item: project })}>
                View Details
              </button>
              {canFlag(userRole) && !isProjectFlagged(project.id) && (
                <button
                  onClick={() => handleOpenFlagModal(project)}
                  className="view-btn"
                  style={{ flex: 1, background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}
                  title="Flag this project as inappropriate"
                >
                  🚩 Flag
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedItem.type === 'portfolio' ? 'Student Portfolio' :
                 selectedItem.type === 'project' ? 'Project Details' : 'Instructor Details'}
              </h2>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              {selectedItem.type === 'portfolio' && (
                <>
                  <h3>{selectedItem.item.name}</h3>
                  <p><strong>Major:</strong> {selectedItem.item.major}</p>
                  <p><strong>Email:</strong> {selectedItem.item.email}</p>
                  <p><strong>Bio:</strong> {selectedItem.item.description}</p>
                  <div className="tag-row"><strong>Skills:</strong> {selectedItem.item.skills.map(s => <span key={s} className="tag">{s}</span>)}</div>
                  <div className="projects-list"><strong>Projects ({selectedItem.item.projects?.length || 0}):</strong>
                    <ul>{selectedItem.item.projects?.map(p => <li key={p.id}><strong>{p.title}</strong> - {p.course}<br /><small>Instructor: {p.instructor} | Date: {new Date(p.date).toLocaleDateString()}</small></li>)}</ul>
                  </div>
                </>
              )}
              {selectedItem.type === 'project' && (
                <>
                  <h3>{selectedItem.item.title}</h3>
                  <div>{renderRating(selectedItem.item.rating || 0)}</div>
                  <p><strong>Course:</strong> {selectedItem.item.course}</p>
                  <p><strong>Instructor:</strong> {selectedItem.item.instructor || 'N/A'}</p>
                  <p><strong>Student:</strong> {selectedItem.item.student}</p>
                  <p><strong>Creation Date:</strong> {selectedItem.item.date ? new Date(selectedItem.item.date).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Description:</strong> {selectedItem.item.description}</p>
                  {selectedItem.item.technologies && <div className="tag-row"><strong>Technologies:</strong> {selectedItem.item.technologies.map(t => <span key={t} className="tag">{t}</span>)}</div>}
                </>
              )}
              {selectedItem.type === 'instructor' && (
                <>
                  <h3>{selectedItem.item.name}</h3>
                  <p><strong>Total Projects:</strong> {selectedItem.item.projectCount}</p>
                  <p><strong>Total Students:</strong> {selectedItem.item.students.length}</p>
                  <p><strong>Average Rating:</strong> {selectedItem.item.rating.toFixed(1)} ⭐</p>
                  <div className="tag-row"><strong>Courses Taught:</strong> {selectedItem.item.courses.map(c => <span key={c} className="tag">{c}</span>)}</div>
                  <div className="students-list"><strong>Students:</strong><ul>{selectedItem.item.students.map(s => <li key={s}>{s}</li>)}</ul></div>
                  <div className="projects-list"><strong>Projects Supervised:</strong><ul>{selectedItem.item.projects.map(p => <li key={p.id}><strong>{p.title}</strong> by {p.student} - {p.course} {p.rating && `(⭐${p.rating})`}<br /><small>Date: {new Date(p.date).toLocaleDateString()}</small></li>)}</ul></div>
                </>
              )}
            </div>
            <div className="modal-actions">
              <button className="view-btn" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* FLAG MODAL */}
      {flagModal && (
        <div className="modal-overlay" onClick={() => setFlagModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>🚩 Flag Project</h2>
              <button className="modal-close" onClick={() => setFlagModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '8px', fontWeight: '600', color: 'var(--c-text)' }}>
                Project: <span style={{ color: 'var(--c-primary)' }}>{flagModal.project.title}</span>
              </p>
              <p style={{ fontSize: '13px', color: 'var(--c-text-2)', marginBottom: '16px' }}>
                Flagging this project will <strong>automatically deactivate</strong> it. The student will be notified and may submit an appeal. Please provide a clear reason.
              </p>
              <label style={{ fontWeight: '600', fontSize: '14px', color: 'var(--c-text-2)', display: 'block', marginBottom: '8px' }}>
                Reason for flagging: <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="e.g., Suspected plagiarism — significant similarity to a published repository. Evidence: ..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              {!flagReason.trim() && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>A reason is required before flagging.</p>
              )}
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '10px' }}>
              <button
                className="view-btn"
                onClick={() => setFlagModal(null)}
                style={{ background: 'var(--c-surface-3)', color: 'var(--c-text-2)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFlag}
                disabled={!flagReason.trim()}
                className="view-btn"
                style={{
                  flex: 1,
                  marginTop: '23.5px',
                  padding: '0px 20px',
                  background: flagReason.trim() ? '#ef4444' : '#fca5a5',
                  color: 'var(--c-surface)',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: flagReason.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                🚩 Confirm Flag & Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLAG TOAST */}
      {flagToast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: flagToast.color,
          color: 'var(--c-surface)',
          padding: '14px 24px',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 99999,
        }}>
          {flagToast.message}
        </div>
      )}
    </div>
  );
};

export default StudentExplore;