import { useState, useMemo, useEffect } from "react";

const SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "rating_desc", label: "Highest rated first" },
  { value: "rating_asc", label: "Lowest rated first" },
];

const styles = `
  .psfs__container {
    width: 100%;
    margin-bottom: 28px;
  }

  .pm__filterbar {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--r-xl);
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: var(--sh-sm);
    transition: all var(--t-base);
  }

  .pm__filterbar:hover {
    border-color: var(--c-primary-mid);
    box-shadow: var(--sh-md);
  }

  .pm__filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 170px;
    flex: 1 0 auto;
  }

  .pm__filter-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--c-muted);
    font-weight: 700;
  }

  .pm__filter-select,
  .pm__filter-input {
    padding: 10px 14px;
    font-size: 14px;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: var(--c-text);
    background: var(--c-surface-2);
    border: 1px solid var(--c-border-strong);
    border-radius: var(--r-md);
    outline: none;
    transition: all var(--t-fast);
    height: 44px;
    box-sizing: border-box;
    width: 100%;
  }

  .pm__filter-select:focus,
  .pm__filter-input:focus {
    border-color: var(--c-primary);
    background: var(--c-surface);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  }

  .pm__filter-select:hover,
  .pm__filter-input:hover {
    border-color: var(--c-primary-mid);
    background: var(--c-surface);
  }

  .pm__filter-input--date {
    min-width: 160px;
  }

  .pm__filter-input::placeholder {
    color: var(--c-muted);
  }

  .pm__filter-clear {
    align-self: flex-end;
    padding: 10px 20px;
    height: 44px;
    font-size: 13px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-weight: 600;
    border: 1px solid rgba(239, 68, 68, 0.3);
    background: var(--c-red-bg);
    color: #fca5a5;
    border-radius: var(--r-md);
    cursor: pointer;
    transition: all var(--t-fast);
    white-space: nowrap;
    box-sizing: border-box;
  }

  .pm__filter-clear:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #fff;
    transform: translateY(-1px);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .pm__active-filters-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    margin-bottom: 20px;
    background: var(--c-primary-light);
    border-radius: var(--r-lg);
    border-left: 4px solid var(--c-primary);
    font-size: 13px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .pm__active-filters-text {
    color: var(--c-text-2);
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .pm__active-filters-text span {
    background: var(--c-surface-2);
    padding: 5px 12px;
    border-radius: var(--r-full);
    border: 1px solid var(--c-border);
    font-size: 12px;
  }

  .pm__results-count {
    font-weight: 700;
    color: #93c5fd;
    background: rgba(59, 130, 246, 0.15);
    padding: 6px 14px;
    border-radius: var(--r-full);
    font-size: 12px;
    border: 1px solid var(--c-primary-mid);
  }

  /* Select dropdown options styling */
  .pm__filter-select option {
    background: var(--c-surface);
    color: var(--c-text);
    padding: 10px;
  }

  /* Date input specific styling */
  .pm__filter-input--date::-webkit-calendar-picker-indicator {
    filter: invert(0.7);
    cursor: pointer;
    padding: 4px;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .pm__filter-group {
      min-width: 200px;
    }
  }

  @media (max-width: 768px) {
    .pm__filterbar {
      padding: 18px;
      gap: 14px;
    }
    
    .pm__filter-group {
      min-width: calc(50% - 7px);
      flex: 1;
    }
    
    .pm__filter-clear {
      width: 100%;
      align-self: stretch;
      margin-top: 8px;
    }
    
    .pm__active-filters-summary {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .pm__active-filters-text span {
      font-size: 11px;
      padding: 4px 10px;
    }
  }

  @media (max-width: 480px) {
    .pm__filter-group {
      min-width: 100%;
    }
    
    .pm__filterbar {
      padding: 14px;
    }
    
    .pm__filter-select,
    .pm__filter-input {
      height: 40px;
      padding: 8px 12px;
    }
    
    .pm__filter-clear {
      height: 40px;
    }
  }
`;

if (typeof document !== 'undefined') {
  const existing = document.getElementById('psfs-styles');
  if (!existing) {
    const styleTag = document.createElement('style');
    styleTag.id = 'psfs-styles';
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

export default function ProjectSearchFilterSort({
  projects,
  courses = [],
  users = [],
  onFilteredProjectsChange,
  showActiveFilters = true,
  initialSearchQuery = "",
}) {
  const [searchTitle, setSearchTitle]           = useState(initialSearchQuery);
  const [filterCourse, setFilterCourse]         = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterDateFrom, setFilterDateFrom]     = useState("");
  const [filterDateTo, setFilterDateTo]         = useState("");
  const [sortKey, setSortKey]                   = useState("");

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchTitle(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const uniqueCourses = useMemo(() => {
    const s = new Set();
    projects.forEach(p => { if (p.course) s.add(p.course); });
    return ["", ...Array.from(s).sort()];
  }, [projects]);

  const uniqueInstructors = useMemo(() => {
    const s = new Set();
    users?.forEach(u => {
      if (u.role === "Course Instructor" || u.role === "Instructor") s.add(u.name);
    });
    courses?.forEach(c => { if (c.instructorName) s.add(c.instructorName); });
    return ["", ...Array.from(s).sort()];
  }, [users, courses]);

  const courseToInstructorMap = useMemo(() => {
    const map = new Map();
    courses?.forEach(c => { if (c.name && c.instructorName) map.set(c.name, c.instructorName); });
    return map;
  }, [courses]);

  const hasActiveFilters = searchTitle || filterCourse || filterInstructor ||
                           filterDateFrom || filterDateTo || sortKey;

  const clearFilters = () => {
    setSearchTitle("");
    setFilterCourse("");
    setFilterInstructor("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortKey("");
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (searchTitle.trim()) {
      const term = searchTitle.trim().toLowerCase();
      result = result.filter(p => p.title?.toLowerCase().includes(term));
    }

    if (filterCourse) {
      result = result.filter(p => p.course === filterCourse);
    }

    if (filterInstructor) {
      const instructorCourses = [];
      courseToInstructorMap.forEach((inst, course) => {
        if (inst === filterInstructor) instructorCourses.push(course);
      });
      result = result.filter(p => instructorCourses.includes(p.course));
    }

    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(p => p.createdAt && new Date(p.createdAt) >= from);
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(p => p.createdAt && new Date(p.createdAt) <= to);
    }

    if (sortKey) {
      result.sort((a, b) => {
        if (sortKey === "date_asc")    return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortKey === "date_desc")   return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortKey === "rating_asc")  return (a.rating ?? 0) - (b.rating ?? 0);
        if (sortKey === "rating_desc") return (b.rating ?? 0) - (a.rating ?? 0);
        return 0;
      });
    }

    return result;
  }, [projects, searchTitle, filterCourse, filterInstructor,
      filterDateFrom, filterDateTo, sortKey, courseToInstructorMap]);

  useEffect(() => {
    onFilteredProjectsChange?.(filteredAndSortedProjects);
  }, [filteredAndSortedProjects, onFilteredProjectsChange]);

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getSortLabel = (value) => {
    const option = SORT_OPTIONS.find(o => o.value === value);
    return option ? option.label : "";
  };

  return (
    <div className="psfs__container">
      <div className="pm__filterbar">
        <div className="pm__filter-group">
          <label className="pm__filter-label">🔍 Search by Title</label>
          <input
            type="text"
            className="pm__filter-input"
            placeholder="Enter project title..."
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
          />
        </div>

        <div className="pm__filter-group">
          <label className="pm__filter-label">📚 Course</label>
          <select className="pm__filter-select" value={filterCourse}
            onChange={e => setFilterCourse(e.target.value)}>
            {uniqueCourses.map(c => (
              <option key={c || "all"} value={c}>{c || "All courses"}</option>
            ))}
          </select>
        </div>

        <div className="pm__filter-group">
          <label className="pm__filter-label">👨‍🏫 Instructor</label>
          <select className="pm__filter-select" value={filterInstructor}
            onChange={e => setFilterInstructor(e.target.value)}>
            {uniqueInstructors.map(i => (
              <option key={i || "all"} value={i}>{i || "All instructors"}</option>
            ))}
          </select>
        </div>

        <div className="pm__filter-group">
          <label className="pm__filter-label">📅 Created from</label>
          <input 
            type="date" 
            className="pm__filter-input pm__filter-input--date"
            value={filterDateFrom} 
            max={filterDateTo || ""}
            onChange={e => setFilterDateFrom(e.target.value)} 
          />
        </div>

        <div className="pm__filter-group">
          <label className="pm__filter-label">📅 Created to</label>
          <input 
            type="date" 
            className="pm__filter-input pm__filter-input--date"
            value={filterDateTo} 
            min={filterDateFrom || ""}
            onChange={e => setFilterDateTo(e.target.value)} 
          />
        </div>

        <div className="pm__filter-group">
          <label className="pm__filter-label">↳ Sort by</label>
          <select className="pm__filter-select" value={sortKey}
            onChange={e => setSortKey(e.target.value)}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className="pm__filter-clear" onClick={clearFilters}>
            ✕ Clear All
          </button>
        )}
      </div>

      {showActiveFilters && hasActiveFilters && (
        <div className="pm__active-filters-summary">
          <span className="pm__active-filters-text">
            {searchTitle      && <span>🔍 "{searchTitle}"</span>}
            {filterCourse     && <span>📚 {filterCourse}</span>}
            {filterInstructor && <span>👨‍🏫 {filterInstructor}</span>}
            {filterDateFrom   && <span>📅 From {formatDate(filterDateFrom)}</span>}
            {filterDateTo     && <span>📅 To {formatDate(filterDateTo)}</span>}
            {sortKey          && <span>↳ {getSortLabel(sortKey)}</span>}
          </span>
          <span className="pm__results-count">
            📋 {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? "s" : ""} found
          </span>
        </div>
      )}
    </div>
  );
}