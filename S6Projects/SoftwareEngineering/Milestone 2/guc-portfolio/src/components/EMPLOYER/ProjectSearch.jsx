import { useState, useMemo } from "react";

const SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "rating_desc", label: "Highest rated first" },
  { value: "rating_asc", label: "Lowest rated first" },
];

// CSS styles for the component
const styles = `
  .psfs__container {
    width: 100%;
    margin-bottom: 20px;
  }

  .pm__filterbar {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-wrap: wrap;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 14px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  }

  .pm__filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 140px;
  }

  .pm__filter-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #94a3b8;
    font-weight: 600;
  }

  .pm__filter-select,
  .pm__filter-input {
    padding: 7px 10px;
    font-size: 12px;
    font-family: inherit;
    color: #1e293b;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
    height: 32px;
    box-sizing: border-box;
  }

  .pm__filter-select:focus,
  .pm__filter-input:focus {
    border-color: #a5b4fc;
    background: #ffffff;
  }

  .pm__filter-input--date {
    min-width: 130px;
    color-scheme: light;
  }

  .pm__filter-clear {
    align-self: flex-end;
    padding: 7px 14px;
    height: 32px;
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    border: 1px solid #fca5a5;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 7px;
    cursor: pointer;
    transition: opacity 0.15s;
    white-space: nowrap;
    box-sizing: border-box;
  }

  .pm__filter-clear:hover {
    opacity: 0.75;
  }

  .pm__active-filters-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    margin-bottom: 16px;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 3px solid #6366f1;
    font-size: 12px;
  }

  .pm__active-filters-text {
    color: #475569;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pm__results-count {
    font-weight: 600;
    color: #6366f1;
    background: #ede9fe;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}

export default function ProjectSearchFilterSort({ 
  projects, 
  courses = [],
  users = [],
  onFilteredProjectsChange,
  showActiveFilters = true 
}) {
  // Search, Filter & Sort States
  const [searchTitle, setSearchTitle] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortKey, setSortKey] = useState("");

  // Get unique courses from projects data
  const uniqueCourses = useMemo(() => {
    const courseSet = new Set();
    projects.forEach(project => {
      if (project.course) {
        courseSet.add(project.course);
      }
    });
    return ["", ...Array.from(courseSet).sort()];
  }, [projects]);

  // Get unique instructors from USERS data (where role is "Course Instructor")
  const uniqueInstructors = useMemo(() => {
    const instructorSet = new Set();
    
    // First try to get instructors from users data
    if (users && users.length > 0) {
      users.forEach(user => {
        if (user.role === "Course Instructor" || user.role === "Instructor") {
          instructorSet.add(user.name);
        }
      });
    }
    
    // Also get instructors from courses data
    if (courses && courses.length > 0) {
      courses.forEach(course => {
        if (course.instructorName) {
          instructorSet.add(course.instructorName);
        }
      });
    }
    
    return ["", ...Array.from(instructorSet).sort()];
  }, [users, courses]);

  // Create a mapping of course -> instructor
  const courseToInstructorMap = useMemo(() => {
    const map = new Map();
    if (courses && courses.length > 0) {
      courses.forEach(course => {
        if (course.name && course.instructorName) {
          map.set(course.name, course.instructorName);
        }
      });
    }
    return map;
  }, [courses]);

  // Check if any filters are active
  const hasActiveFilters = searchTitle || filterCourse || filterInstructor || filterDateFrom || filterDateTo || sortKey;

  // Clear all filters and search
  const clearFilters = () => {
    setSearchTitle("");
    setFilterCourse("");
    setFilterInstructor("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortKey("");
  };

  // Apply search, filters, and sort to projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // 1. SEARCH: by project title
    if (searchTitle.trim()) {
      const searchTerm = searchTitle.trim().toLowerCase();
      result = result.filter((p) => 
        p.title && p.title.toLowerCase().includes(searchTerm)
      );
    }

    // 2. FILTER: by course
    if (filterCourse) {
      result = result.filter((p) => p.course === filterCourse);
    }

    // 3. FILTER: by instructor
    if (filterInstructor) {
      // Get all courses taught by this instructor
      const instructorCourses = [];
      courseToInstructorMap.forEach((instructor, course) => {
        if (instructor === filterInstructor) {
          instructorCourses.push(course);
        }
      });
      
      // Also check if any project directly has instructor field
      result = result.filter((p) => {
        return instructorCourses.includes(p.course);
      });
    }

    // 4. FILTER: by date range
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      result = result.filter((p) => p.createdAt && new Date(p.createdAt) >= from);
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((p) => p.createdAt && new Date(p.createdAt) <= to);
    }

    // 5. SORT: by selected option
    if (sortKey) {
      result.sort((a, b) => {
        if (sortKey === "date_asc") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortKey === "date_desc") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortKey === "rating_asc") {
          return (a.rating ?? 0) - (b.rating ?? 0);
        }
        if (sortKey === "rating_desc") {
          return (b.rating ?? 0) - (a.rating ?? 0);
        }
        return 0;
      });
    }

    return result;
  }, [projects, searchTitle, filterCourse, filterInstructor, filterDateFrom, filterDateTo, sortKey, courseToInstructorMap]);

  // Notify parent component of filtered projects
  useMemo(() => {
    if (onFilteredProjectsChange) {
      onFilteredProjectsChange(filteredAndSortedProjects);
    }
  }, [filteredAndSortedProjects, onFilteredProjectsChange]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="psfs__container">
      {/* Filter Bar */}
      <div className="pm__filterbar">
        {/* Search by Title */}
        <div className="pm__filter-group">
          <label className="pm__filter-label">Search by Title</label>
          <input
            type="text"
            className="pm__filter-input"
            placeholder="Enter project title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>

        {/* Course Filter */}
        <div className="pm__filter-group">
          <label className="pm__filter-label">Course</label>
          <select
            className="pm__filter-select"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            {uniqueCourses.map((c) => (
              <option key={c || "all"} value={c}>
                {c || "All courses"}
              </option>
            ))}
          </select>
        </div>

        {/* Instructor Filter */}
        <div className="pm__filter-group">
          <label className="pm__filter-label">Instructor</label>
          <select
            className="pm__filter-select"
            value={filterInstructor}
            onChange={(e) => setFilterInstructor(e.target.value)}
          >
            {uniqueInstructors.map((i) => (
              <option key={i || "all"} value={i}>
                {i || "All instructors"}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filters */}
        <div className="pm__filter-group">
          <label className="pm__filter-label">Created from</label>
          <input
            type="date"
            className="pm__filter-input pm__filter-input--date"
            value={filterDateFrom}
            max={filterDateTo || undefined}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
        </div>

        <div className="pm__filter-group">
          <label className="pm__filter-label">Created to</label>
          <input
            type="date"
            className="pm__filter-input pm__filter-input--date"
            value={filterDateTo}
            min={filterDateFrom || undefined}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
        </div>

        {/* Sort Options */}
        <div className="pm__filter-group">
          <label className="pm__filter-label">Sort by</label>
          <select
            className="pm__filter-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button className="pm__filter-clear" onClick={clearFilters}>
            ✕ Clear All
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {showActiveFilters && hasActiveFilters && (
        <div className="pm__active-filters-summary">
          <span className="pm__active-filters-text">
            {searchTitle && `🔍 "${searchTitle}" `}
            {filterCourse && `📚 ${filterCourse} `}
            {filterInstructor && `👨‍🏫 ${filterInstructor} `}
            {filterDateFrom && `📅 From ${formatDate(filterDateFrom)} `}
            {filterDateTo && `📅 To ${formatDate(filterDateTo)} `}
            {sortKey && `↳ ${SORT_OPTIONS.find(o => o.value === sortKey)?.label}`}
          </span>
          <span className="pm__results-count">
            {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? "s" : ""} found
          </span>
        </div>
      )}
    </div>
  );
}