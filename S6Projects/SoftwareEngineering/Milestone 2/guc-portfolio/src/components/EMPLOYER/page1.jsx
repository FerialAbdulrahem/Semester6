import { useState, useEffect } from "react";
import "./styles/portfolio.css";

export default function PortfolioPage({
  user,
  favoriteStudents = [],
  favoriteProjects = [],
  setFavoriteStudents = () => {},
  setFavoriteProjects = () => {},
}) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [search, setSearch] = useState("");
  const [majorFilter, setMajorFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [sortBy, setSortBy] = useState("sortBy");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Favorites state - loaded from localStorage or parent favorites
  const [heartedStudents, setHeartedStudents] = useState(() => {
    if (favoriteStudents.length > 0) {
      return favoriteStudents.map(s => s.id);
    }
    return [];
  });
  const [heartedProjects, setHeartedProjects] = useState(() => {
    if (favoriteProjects.length > 0) {
      return favoriteProjects.map(p => p.id);
    }
    return [];
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (favoriteStudents.length > 0 || favoriteProjects.length > 0) {
      setHeartedStudents(favoriteStudents.map(s => s.id));
      setHeartedProjects(favoriteProjects.map(p => p.id));
      return;
    }

    if (user && user.id) {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          setHeartedStudents(parsed.portfolios?.map(s => s.id) || []);
          setHeartedProjects(parsed.projects?.map(p => p.id) || []);
        } catch (error) {
          console.error("Failed to parse favorites:", error);
        }
      }
    }
  }, [user, favoriteStudents, favoriteProjects]);

  const students = [
    {
      id: 1,
      name: "Mariam Boulos",
      email: "mariam@guc.edu.eg",
      major: "Computer Engineering",
      skills: ["React", "Java", "UI/UX", "Python", "SQL"],
      description: "Computer Engineering student passionate about frontend development, embedded systems, and modern UI design.",
      projects: [
        {
          id: 101,
          title: "Smart Parking System",
          course: "Digital System Design",
          instructor: "Dr. Ahmed",
          date: "2026-03-15",
          technologies: ["VHDL", "FPGA", "ModelSim"],
          githubLink: "https://github.com/mariam/smart-parking",
          demoVideo: "https://youtube.com/watch?v=demo1",
          rating: 4.8,
          description: "FPGA-based smart parking system using sensors and VHDL."
        },
        {
          id: 102,
          title: "Portfolio Website",
          course: "Web Development",
          instructor: "Dr. Sara",
          date: "2026-04-20",
          technologies: ["React", "CSS", "JavaScript"],
          githubLink: "https://github.com/mariam/portfolio",
          demoVideo: "https://youtube.com/watch?v=demo2",
          rating: 4.5,
          description: "Responsive portfolio website for showcasing student work."
        }
      ]
    },
    {
      id: 2,
      name: "Omar Khaled",
      email: "omar@guc.edu.eg",
      major: "Computer Science",
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
      description: "Computer Science student interested in AI systems and backend engineering.",
      projects: [
        {
          id: 201,
          title: "AI Chatbot",
          course: "Artificial Intelligence",
          instructor: "Dr. Mona",
          date: "2026-02-10",
          technologies: ["Python", "NLP", "TensorFlow"],
          githubLink: "https://github.com/omar/ai-chatbot",
          demoVideo: "https://youtube.com/watch?v=demo3",
          rating: 4.9,
          description: "Chatbot using NLP and machine learning models."
        }
      ]
    }
  ];

  // Get unique majors and skills
  const allMajors = ["All", ...new Set(students.map(s => s.major))];
  const allSkills = ["All", ...new Set(students.flatMap(s => s.skills))];

  // Filter and sort students
  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.major.toLowerCase().includes(query) ||
      student.skills.join(" ").toLowerCase().includes(query) ||
      student.projects.some(p => p.title.toLowerCase().includes(query));
    
    const matchesMajor = majorFilter === "All" || student.major === majorFilter;
    const matchesSkill = skillFilter === "All" || student.skills.includes(skillFilter);
    
    return matchesSearch && matchesMajor && matchesSkill;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === "projects-desc") return b.projects.length - a.projects.length;
    if (sortBy === "projects-asc") return a.projects.length - b.projects.length;
    return a.name.localeCompare(b.name);
  });

  const hasActiveFilters = search || majorFilter !== "All" || skillFilter !== "All" || sortBy !== "sortBy";

  const resetFilters = () => {
    setSearch("");
    setMajorFilter("All");
    setSkillFilter("All");
    setSortBy("sortBy");
  };

  // Save favorites to localStorage
  const saveFavoritesToLocalStorage = (portfolios, projects) => {
    const favoritesData = {
      portfolios: portfolios,
      projects: projects
    };
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favoritesData));
  };

  const toggleStudentHeart = (student) => {
    let updatedPortfolios;
    let updatedHeartIds;
    
    if (heartedStudents.includes(student.id)) {
      // Remove from favorites
      updatedHeartIds = heartedStudents.filter(id => id !== student.id);
      updatedPortfolios = students.filter(s => updatedHeartIds.includes(s.id));
    } else {
      // Add to favorites
      updatedHeartIds = [...heartedStudents, student.id];
      updatedPortfolios = [...students.filter(s => heartedStudents.includes(s.id)), student];
    }
    
    setHeartedStudents(updatedHeartIds);
    setFavoriteStudents(updatedPortfolios);

    const allProjects = students.flatMap(s => s.projects);
    const savedProjects = allProjects.filter(p => heartedProjects.includes(p.id));
    saveFavoritesToLocalStorage(updatedPortfolios, savedProjects);
  };

  const toggleProjectHeart = (project) => {
    let updatedProjects;
    let updatedHeartIds;
    
    const allProjects = students.flatMap(s => s.projects);
    
    if (heartedProjects.includes(project.id)) {
      // Remove from favorites
      updatedHeartIds = heartedProjects.filter(id => id !== project.id);
      updatedProjects = allProjects.filter(p => updatedHeartIds.includes(p.id));
    } else {
      // Add to favorites
      updatedHeartIds = [...heartedProjects, project.id];
      updatedProjects = [...allProjects.filter(p => heartedProjects.includes(p.id)), project];
    }
    
    setHeartedProjects(updatedHeartIds);
    setFavoriteProjects(updatedProjects);
    saveFavoritesToLocalStorage(students.filter(s => heartedStudents.includes(s.id)), updatedProjects);
  };

  // Star Rating Component
  const StarRating = ({ value }) => (
    <span className="sp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? "#f5a623" : "none"}
          stroke="#f5a623" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="sp-stars__val">{value.toFixed(1)}</span>
    </span>
  );

  // Get initials
  const getInitials = (name) => {
    return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      year: "numeric", month: "short", day: "2-digit",
    });
  };

  // MAIN PORTFOLIOS PAGE
  if (!selectedStudent) {
    return (
      <div className="portfolio-container">
        <div className="portfolio-page">
          <h1 className="cm__heading">Student Portfolios</h1>

          {/* Search and Filter Bar */}
          <div className="search-filter-wrap" style={{ marginTop: 'var(--sp-5)' }}>
            <div className="search-box">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search by student name, email, skills, projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")}>✕</button>
              )}
            </div>

            <button
              className={`filter-toggle ${filtersOpen ? "active" : ""}`}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters & Sort
              {hasActiveFilters && <span className="filter-dot" />}
            </button>
          </div>

          {/* Filter Panel */}
          {filtersOpen && (
            <div className="filter-panel">
              <div className="filter-group">
                <label className="filter-label">Major</label>
                <select className="filter-select" value={majorFilter} onChange={e => setMajorFilter(e.target.value)}>
                  {allMajors.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Skill</label>
                <select className="filter-select" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
                  {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Sort by</label>
                <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="sortBy">Name (A – Z)</option>
                  <option value="projects-desc">Most projects first</option>
                  <option value="projects-asc">Fewest projects first</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button className="reset-btn" onClick={resetFilters}>Reset all</button>
              )}
            </div>
          )}

          {/* Results */}
          <p className="results-label">
            {sortedStudents.length} portfolio{sortedStudents.length !== 1 ? "s" : ""} found
            {hasActiveFilters && <span className="results-hint"> — filtered</span>}
          </p>

          {/* Portfolio List */}
          {sortedStudents.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p>No portfolios match your search.</p>
              <button className="reset-btn" onClick={resetFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="portfolio-list">
              {sortedStudents.map(student => (
                <div key={student.id} className="portfolio-card" onClick={() => setSelectedStudent(student)}>
                  <div className="card-left">
                    <div className="card-avatar">{getInitials(student.name)}</div>
                    <div className="card-info">
                      <p className="card-name">{student.name}</p>
                      <p className="card-email">{student.email}</p>
                      <p className="card-major">{student.major}</p>
                    </div>
                  </div>

                  <div className="card-right">
                    <div className="card-skills">
                      {student.skills.slice(0, 3).map(s => (
                        <span key={s} className="skill-tag small">{s}</span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="skill-tag small more">+{student.skills.length - 3}</span>
                      )}
                    </div>
                    <div className="card-proj-count">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      {student.projects.length} project{student.projects.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <button
                    className={`favorite-btn ${heartedStudents.includes(student.id) ? "favorited" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStudentHeart(student);
                    }}
                  >
                    ♥
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // STUDENT DETAILS PAGE
  return (
    <div className="student-detail">
      <button className="back-btn" onClick={() => setSelectedStudent(null)}>
        ← Back to Portfolios
      </button>

      <div className="detail-header">
        <div className="detail-avatar">{getInitials(selectedStudent.name)}</div>
        <div className="detail-info">
          <h1 className="detail-name">{selectedStudent.name}</h1>
          <div className="detail-meta">
            <span>{selectedStudent.email}</span>
            <span className="detail-sep">·</span>
            <span>{selectedStudent.major}</span>
          </div>
        </div>
        <button
          className={`favorite-btn large ${heartedStudents.includes(selectedStudent.id) ? "favorited" : ""}`}
          onClick={() => toggleStudentHeart(selectedStudent, false)}
        >
          ♥
        </button>
      </div>

      <div className="detail-section">
        <h2 className="section-title">About</h2>
        <p className="section-body">{selectedStudent.description}</p>
      </div>

      <div className="detail-section">
        <h2 className="section-title">Skills</h2>
        <div className="skills-list">
          {selectedStudent.skills.map(skill => (
            <span key={skill} className="skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      <div className="detail-section">
        <h2 className="section-title">
          Projects
          <span className="section-count">{selectedStudent.projects.length}</span>
        </h2>
        <div className="projects-list">
          {selectedStudent.projects.map(project => (
            <div key={project.id} className="project-card" onClick={() => setSelectedProject(project)}>
              <div className="project-card-top">
                <p className="project-title">{project.title}</p>
                <StarRating value={project.rating || 4.5} />
              </div>
              <div className="project-meta">
                <span className="project-course">{project.course}</span>
                <span className="project-date">{formatDate(project.date)}</span>
              </div>
              <div className="project-langs">
                {project.technologies.map(tech => (
                  <span key={tech} className="skill-tag small">{tech}</span>
                ))}
              </div>
              <div className="project-links">
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" rel="noreferrer" className="project-link">GitHub ↗</a>
                )}
                {project.demoVideo && (
                  <a href={project.demoVideo} target="_blank" rel="noreferrer" className="project-link">Demo ↗</a>
                )}
              </div>
              <button
                className={`favorite-btn ${heartedProjects.includes(project.id) ? "favorited" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProjectHeart(project, false);
                }}
              >
                ♥
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProject(null)}>✕</button>
            <h2 className="modal-title">{selectedProject.title}</h2>
            <div className="modal-section">
              <strong>Course:</strong>
              <p>{selectedProject.course}</p>
            </div>
            <div className="modal-section">
              <strong>Instructor:</strong>
              <p>{selectedProject.instructor}</p>
            </div>
            <div className="modal-section">
              <strong>Date:</strong>
              <p>{formatDate(selectedProject.date)}</p>
            </div>
            <div className="modal-section">
              <strong>Rating:</strong>
              <StarRating value={selectedProject.rating || 4.5} />
            </div>
            <div className="modal-section">
              <strong>Technologies:</strong>
              <div className="skills-list">
                {selectedProject.technologies.map(tech => (
                  <span key={tech} className="skill-tag">{tech}</span>
                ))}
              </div>
            </div>
            <div className="modal-section">
              <strong>Description:</strong>
              <p>{selectedProject.description}</p>
            </div>
            <div className="modal-links">
              {selectedProject.githubLink && (
                <a href={selectedProject.githubLink} target="_blank" rel="noreferrer" className="modal-link">GitHub ↗</a>
              )}
              {selectedProject.demoVideo && (
                <a href={selectedProject.demoVideo} target="_blank" rel="noreferrer" className="modal-link">Demo Video ↗</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}