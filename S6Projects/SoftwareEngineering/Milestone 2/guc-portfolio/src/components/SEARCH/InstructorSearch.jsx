import { useState, useMemo } from "react";

// CSS styles for the component - Updated for dark theme
const styles = `
  .cs__container {
    width: 100%;
    margin-bottom: 20px;
  }

  .cs__search-bar {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    flex-wrap: wrap;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--r-lg);
    padding: 14px 18px;
    margin-bottom: 14px;
    box-shadow: var(--sh-xs);
    transition: all var(--t-base);
  }

  .cs__search-bar:hover {
    border-color: var(--c-primary-mid);
  }

  .cs__search-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 250px;
  }

  .cs__search-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--c-muted);
    font-weight: 600;
  }

  .cs__search-input {
    padding: 7px 10px;
    font-size: 12px;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: var(--c-text);
    background: var(--c-surface-2);
    border: 1px solid var(--c-border);
    border-radius: var(--r-md);
    outline: none;
    transition: all var(--t-fast);
    height: 32px;
    box-sizing: border-box;
    width: 100%;
  }

  .cs__search-input:focus {
    border-color: var(--c-primary);
    background: var(--c-surface);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .cs__search-input::placeholder {
    color: var(--c-muted);
  }

  .cs__search-clear {
    align-self: flex-end;
    padding: 7px 14px;
    height: 32px;
    font-size: 12px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 500;
    border: 1px solid rgba(239, 68, 68, 0.2);
    background: var(--c-red-bg);
    color: #fca5a5;
    border-radius: var(--r-md);
    cursor: pointer;
    transition: all var(--t-fast);
    white-space: nowrap;
    box-sizing: border-box;
  }

  .cs__search-clear:hover {
    background: rgba(239, 68, 68, 0.2);
    color: white;
    transform: translateY(-1px);
  }

  .cs__results-summary {
    padding: 8px 16px;
    margin-bottom: 16px;
    background: var(--c-primary-light);
    border-left: 3px solid var(--c-primary);
    border-radius: var(--r-md);
    font-size: 12px;
    color: var(--c-text-2);
  }

  .cs__results-count {
    font-weight: 600;
    color: #93c5fd;
  }

  /* Instructor Results */
  .cs__instructor-results {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cs__instructor-card {
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--r-xl);
    overflow: hidden;
    transition: all var(--t-base);
  }

  .cs__instructor-card:hover {
    border-color: var(--c-primary-mid);
    box-shadow: var(--sh-md);
    transform: translateY(-2px);
  }

  .cs__instructor-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: var(--c-surface-2);
    border-bottom: 1px solid var(--c-border);
    cursor: pointer;
    transition: all var(--t-fast);
  }

  .cs__instructor-header:hover {
    background: var(--c-primary-light);
  }

  .cs__instructor-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--c-primary), var(--c-accent));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .cs__instructor-info {
    flex: 1;
  }

  .cs__instructor-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--c-text);
    margin: 0 0 6px 0;
  }

  .cs__instructor-email {
    font-size: 12px;
    color: var(--c-text-2);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cs__instructor-email::before {
    content: "📧";
    font-size: 12px;
  }

  .cs__course-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .cs__course-count {
    font-size: 13px;
    font-weight: 700;
    color: #93c5fd;
    background: var(--c-primary-light);
    padding: 6px 14px;
    border-radius: var(--r-full);
    border: 1px solid var(--c-primary-mid);
  }

  .cs__view-details {
    font-size: 11px;
    color: var(--c-muted);
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all var(--t-fast);
  }

  .cs__instructor-header:hover .cs__view-details {
    color: #93c5fd;
    gap: 8px;
  }

  .cs__courses-section {
    padding: 20px 24px;
    background: var(--c-surface);
    border-top: 1px solid var(--c-border);
  }

  .cs__courses-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--c-text);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cs__courses-title::before {
    content: "📚";
    font-size: 14px;
  }

  .cs__courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  .cs__course-item {
    background: var(--c-surface-2);
    border: 1px solid var(--c-border);
    border-radius: var(--r-lg);
    padding: 14px 16px;
    transition: all var(--t-fast);
  }

  .cs__course-item:hover {
    border-color: var(--c-primary-mid);
    transform: translateX(4px);
  }

  .cs__course-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--c-text);
    margin-bottom: 6px;
  }

  .cs__course-code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    background: var(--c-surface-3);
    padding: 4px 8px;
    border-radius: var(--r-sm);
    font-size: 11px;
    color: #93c5fd;
    border: 1px solid var(--c-border);
    display: inline-block;
  }

  .cs__no-courses {
    padding: 20px;
    text-align: center;
    color: var(--c-muted);
    font-size: 13px;
    background: var(--c-surface-2);
    border-radius: var(--r-lg);
  }

  /* Instructor expand/collapse animation */
  .cs__courses-section {
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .cs__search-bar {
      padding: 12px 14px;
    }
    
    .cs__search-group {
      min-width: 100%;
    }
    
    .cs__search-clear {
      width: 100%;
    }
    
    .cs__instructor-header {
      flex-wrap: wrap;
      padding: 16px;
    }
    
    .cs__course-stats {
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
      margin-top: 8px;
    }
    
    .cs__courses-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  if (!document.getElementById('course-search-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'course-search-styles';
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

export default function CourseSearch({ 
  courses = [], 
  users = [],
  onSearchResults 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedInstructor, setExpandedInstructor] = useState(null);

  // Get all instructors with their courses
  const instructorsWithCourses = useMemo(() => {
    const instructors = users.filter(user => 
      user.role === "Course Instructor" || user.role === "Instructor"
    );
    
    return instructors.map(instructor => {
      const instructorCourses = courses.filter(course => course.instructorId === instructor.id);
      return {
        id: instructor.id,
        name: instructor.name,
        email: instructor.email,
        courses: instructorCourses
      };
    });
  }, [users, courses]);

  // Search results based on search term
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.trim().toLowerCase();
    
    return instructorsWithCourses.filter(instructor => {
      if (instructor.name.toLowerCase().includes(term)) {
        return true;
      }
      if (instructor.email.toLowerCase().includes(term)) {
        return true;
      }
      const teachesMatchingCourse = instructor.courses.some(course => 
        course.name?.toLowerCase().includes(term) || 
        course.code?.toLowerCase().includes(term)
      );
      return teachesMatchingCourse;
    });
  }, [instructorsWithCourses, searchTerm]);

  const hasActiveSearch = searchTerm.trim().length > 0;
  
  const clearSearch = () => {
    setSearchTerm("");
    setExpandedInstructor(null);
    if (onSearchResults) {
      onSearchResults([], "");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setExpandedInstructor(null);
    if (onSearchResults) {
      if (!value.trim()) {
        onSearchResults([], "");
      } else {
        onSearchResults(searchResults, value);
      }
    }
  };

  const toggleInstructor = (id) => {
    setExpandedInstructor(expandedInstructor === id ? null : id);
  };

  return (
    <div className="cs__container">
      <div className="cs__search-bar">
        <div className="cs__search-group">
          <label className="cs__search-label">🔍 Search Instructor or Course</label>
          <input
            type="text"
            className="cs__search-input"
            placeholder="Search by instructor name, email, or course name/code..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {hasActiveSearch && (
          <button className="cs__search-clear" onClick={clearSearch}>
            ✕ Clear
          </button>
        )}
      </div>

      {hasActiveSearch && (
        <>
          <div className="cs__results-summary">
            📋 Found <span className="cs__results-count">{searchResults.length}</span> instructor
            {searchResults.length !== 1 ? "s" : ""} matching <strong>"{searchTerm}"</strong>
          </div>

          <div className="cs__instructor-results">
            {searchResults.map((instructor) => (
              <div key={instructor.id} className="cs__instructor-card">
                <div 
                  className="cs__instructor-header"
                  onClick={() => toggleInstructor(instructor.id)}
                >
                  <div className="cs__instructor-avatar">
                    {instructor.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="cs__instructor-info">
                    <h4 className="cs__instructor-name">{instructor.name}</h4>
                    <div className="cs__instructor-email">{instructor.email}</div>
                  </div>
                  <div className="cs__course-stats">
                    <div className="cs__course-count">
                      📚 {instructor.courses.length} course{instructor.courses.length !== 1 ? "s" : ""}
                    </div>
                    <div className="cs__view-details">
                      {expandedInstructor === instructor.id ? "▲ Hide courses" : "▼ View courses"}
                    </div>
                  </div>
                </div>
                
                {expandedInstructor === instructor.id && (
                  <div className="cs__courses-section">
                    <div className="cs__courses-title">
                      Courses Taught by {instructor.name.split(' ')[0]}
                    </div>
                    {instructor.courses.length > 0 ? (
                      <div className="cs__courses-grid">
                        {instructor.courses.map((course) => (
                          <div key={course.id} className="cs__course-item">
                            <div className="cs__course-name">{course.name}</div>
                            <code className="cs__course-code">{course.code}</code>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="cs__no-courses">
                        📖 No courses assigned yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {searchResults.length === 0 && (
              <div className="cs__no-courses">
                🔍 No instructors found matching "{searchTerm}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}