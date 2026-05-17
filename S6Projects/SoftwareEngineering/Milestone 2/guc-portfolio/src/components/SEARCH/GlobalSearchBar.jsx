import { useState, useRef, useEffect } from 'react';
import { USERS, PROJECTS } from '../../data/DummyData.js';

const safeArr = (a) => (Array.isArray(a) ? a : []);

// Supplementary data
const INSTRUCTOR_COURSES = {
  'Dr. Mervat':     ['Software Engineering', 'Database Systems'],
  'Dr. Aya Salama': ['Computer Networks', 'Bachelor Project'],
};

const PROJECT_META = {
  1: { createdAt: '2026-01-15', instructor: 'Dr. Mervat',     rating: 4.8 },
  2: { createdAt: '2026-02-03', instructor: 'Dr. Aya Salama', rating: 3.5 },
  3: { createdAt: '2025-11-20', instructor: 'Dr. Aya Salama', rating: 4.2 },
  4: { createdAt: '2025-09-10', instructor: 'Dr. Mervat',     rating: 2.9 },
};

const ALL_COURSES      = ['All Courses', ...new Set(safeArr(PROJECTS).map(p => p.course))];
const ALL_INSTRUCTORS  = ['All Instructors', ...new Set(Object.keys(INSTRUCTOR_COURSES))];

const Tag = ({ label, color = 'var(--c-text-2)' }) => (
  <span style={{
    fontSize: '10px',
    fontWeight: '600',
    background: color + '15',
    color: color,
    border: `1px solid ${color}30`,
    borderRadius: '4px',
    padding: '2px 8px',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
  }}>{label}</span>
);

const StarRating = ({ value }) => {
  if (!value) return null;
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span style={{
      fontSize: '11px',
      color: 'var(--c-yellow)',
      letterSpacing: '-1px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
    }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{
        color: 'var(--c-muted)',
        marginLeft: '4px',
        letterSpacing: '0',
      }}>{value.toFixed(1)}</span>
    </span>
  );
};

export default function GlobalSearchBar({ placeholder, onResultClick }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  // Projects Filters
  const [filterCourse, setFilterCourse] = useState('All Courses');
  const [filterInstructor, setFilterInstructor] = useState('All Instructors');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Projects Sort
  const [projectSort, setProjectSort] = useState('date-desc');

  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const lq = query.toLowerCase();

  // Raw data
  const rawProjects = safeArr(PROJECTS)
    .filter(p => !query.trim() || p.title?.toLowerCase().includes(lq))
    .map(p => ({ ...p, ...(PROJECT_META[p.id] || {}), type: 'project' }));

  const rawInstructors = safeArr(USERS).filter(u => {
    if (u.role !== 'Course Instructor') return false;
    if (!query.trim()) return true;
    const courses = INSTRUCTOR_COURSES[u.name] || [];
    return (
      u.name?.toLowerCase().includes(lq) ||
      u.email?.toLowerCase().includes(lq) ||
      courses.some(c => c.toLowerCase().includes(lq))
    );
  }).map(u => {
    const courses = INSTRUCTOR_COURSES[u.name] || [];
    return { ...u, courses, type: 'instructor' };
  });

  // Apply Projects Filters & Sort
  const filteredProjects = rawProjects.filter(p => {
    if (filterCourse !== 'All Courses' && p.course !== filterCourse) return false;
    if (filterInstructor !== 'All Instructors' && p.instructor !== filterInstructor) return false;
    if (filterDateFrom && p.createdAt && p.createdAt < filterDateFrom) return false;
    if (filterDateTo && p.createdAt && p.createdAt > filterDateTo) return false;
    return true;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (projectSort === 'date-desc') return (b.createdAt || '').localeCompare(a.createdAt || '');
    if (projectSort === 'date-asc') return (a.createdAt || '').localeCompare(b.createdAt || '');
    if (projectSort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
    if (projectSort === 'rating-asc') return (a.rating || 0) - (b.rating || 0);
    return 0;
  });

  const handleSelect = (type, item) => {
    onResultClick?.(type, item, query);
    setOpen(false);
    setQuery('');
    setFilterCourse('All Courses');
    setFilterInstructor('All Instructors');
    setFilterDateFrom('');
    setFilterDateTo('');
    setProjectSort('date-desc');
  };

  const clearAll = () => {
    setQuery('');
    setFilterCourse('All Courses');
    setFilterInstructor('All Instructors');
    setFilterDateFrom('');
    setFilterDateTo('');
    setProjectSort('date-desc');
  };

  const hasActiveFilter = query ||
    filterCourse !== 'All Courses' ||
    filterInstructor !== 'All Instructors' ||
    filterDateFrom ||
    filterDateTo;

  const SortButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      style={{
        fontSize: '11px',
        padding: '5px 14px',
        borderRadius: 'var(--r-full)',
        cursor: 'pointer',
        border: active ? '1.5px solid var(--c-primary)' : '1px solid var(--c-border)',
        background: active ? 'rgba(59, 130, 246, 0.15)' : 'var(--c-surface-2)',
        color: active ? 'var(--c-primary)' : 'var(--c-text-2)',
        fontWeight: active ? '600' : '500',
        fontFamily: 'inherit',
        transition: 'all var(--t-fast)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--c-primary-mid)';
          e.currentTarget.style.background = 'var(--c-primary-light)';
          e.currentTarget.style.color = '#93c5fd';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = 'var(--c-border)';
          e.currentTarget.style.background = 'var(--c-surface-2)';
          e.currentTarget.style.color = 'var(--c-text-2)';
        }
      }}
    >
      {children}
    </button>
  );

  const FilterSelect = ({ value, options, onChange, color = 'var(--c-primary)' }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        fontSize: '12px',
        padding: '6px 14px',
        borderRadius: 'var(--r-full)',
        border: value !== options[0] ? `1.5px solid ${color}` : '1px solid var(--c-border)',
        background: value !== options[0] ? `${color}15` : 'var(--c-surface-2)',
        color: value !== options[0] ? color : 'var(--c-text-2)',
        cursor: 'pointer',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'all var(--t-fast)',
      }}
      onMouseEnter={(e) => {
        if (value === options[0]) {
          e.currentTarget.style.borderColor = 'var(--c-primary-mid)';
          e.currentTarget.style.background = 'var(--c-primary-light)';
        }
      }}
      onMouseLeave={(e) => {
        if (value === options[0]) {
          e.currentTarget.style.borderColor = 'var(--c-border)';
          e.currentTarget.style.background = 'var(--c-surface-2)';
        }
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--c-surface)',
        borderRadius: 'var(--r-full)',
        padding: '8px 20px',
        boxShadow: open ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'var(--sh-xs)',
        border: open ? '1.5px solid var(--c-primary)' : '1.5px solid var(--c-border)',
        transition: 'all var(--t-base)',
      }}>
        <span style={{ fontSize: '16px', marginRight: '12px', color: 'var(--c-muted)' }}>🔍</span>
        <input
          type="text"
          placeholder={placeholder || 'Search projects or instructors...'}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            padding: '10px 0',
            background: 'transparent',
            color: 'var(--c-text)',
            fontFamily: 'inherit',
          }}
        />
        {hasActiveFilter && (
          <button
            onClick={clearAll}
            style={{
              background: 'var(--c-surface-3)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--c-text-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--t-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--c-red-bg)';
              e.currentTarget.style.color = '#fca5a5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--c-surface-3)';
              e.currentTarget.style.color = 'var(--c-text-2)';
            }}
          >✕</button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'var(--c-surface)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--sh-lg)',
          border: '1px solid var(--c-border-strong)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Tabs */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--c-border)',
            background: 'var(--c-surface-2)',
            display: 'flex',
            gap: '12px',
          }}>
            <button
              onClick={() => setActiveTab('projects')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--r-full)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                border: activeTab === 'projects' ? 'none' : '1px solid transparent',
                background: activeTab === 'projects' ? 'linear-gradient(135deg, var(--c-primary), var(--c-accent-dark))' : 'transparent',
                color: activeTab === 'projects' ? 'white' : 'var(--c-text-2)',
                transition: 'all var(--t-fast)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'projects') {
                  e.currentTarget.style.background = 'var(--c-primary-light)';
                  e.currentTarget.style.color = '#93c5fd';
                  e.currentTarget.style.borderColor = 'var(--c-primary-mid)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'projects') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--c-text-2)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              📁 Projects ({rawProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('instructors')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--r-full)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                border: activeTab === 'instructors' ? 'none' : '1px solid transparent',
                background: activeTab === 'instructors' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'transparent',
                color: activeTab === 'instructors' ? 'white' : 'var(--c-text-2)',
                transition: 'all var(--t-fast)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'instructors') {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                  e.currentTarget.style.color = '#22d3ee';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'instructors') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--c-text-2)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              👨‍🏫 Instructors ({rawInstructors.length})
            </button>
          </div>

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--c-border)',
                background: 'var(--c-surface)',
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'var(--c-muted)',
                  marginBottom: '12px',
                }}>Filters</div>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <FilterSelect value={filterCourse} options={ALL_COURSES} onChange={setFilterCourse} color="var(--c-green)" />
                  <FilterSelect value={filterInstructor} options={ALL_INSTRUCTORS} onChange={setFilterInstructor} color="var(--c-green)" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--c-muted)', fontWeight: '500' }}>From</span>
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={e => setFilterDateFrom(e.target.value)}
                      style={{
                        fontSize: '12px',
                        padding: '5px 12px',
                        borderRadius: 'var(--r-full)',
                        border: filterDateFrom ? '1.5px solid var(--c-green)' : '1px solid var(--c-border)',
                        background: filterDateFrom ? 'rgba(16, 185, 129, 0.1)' : 'var(--c-surface-2)',
                        color: 'var(--c-text)',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'all var(--t-fast)',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--c-muted)', fontWeight: '500' }}>To</span>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={e => setFilterDateTo(e.target.value)}
                      style={{
                        fontSize: '12px',
                        padding: '5px 12px',
                        borderRadius: 'var(--r-full)',
                        border: filterDateTo ? '1.5px solid var(--c-green)' : '1px solid var(--c-border)',
                        background: filterDateTo ? 'rgba(16, 185, 129, 0.1)' : 'var(--c-surface-2)',
                        color: 'var(--c-text)',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'all var(--t-fast)',
                      }}
                    />
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--c-border)',
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--c-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>Sort</span>
                  <SortButton active={projectSort === 'date-desc'} onClick={() => setProjectSort('date-desc')}>📅 Newest first</SortButton>
                  <SortButton active={projectSort === 'date-asc'} onClick={() => setProjectSort('date-asc')}>📅 Oldest first</SortButton>
                  <SortButton active={projectSort === 'rating-desc'} onClick={() => setProjectSort('rating-desc')}>⭐ Top rated</SortButton>
                  <SortButton active={projectSort === 'rating-asc'} onClick={() => setProjectSort('rating-asc')}>⭐ Lowest rated</SortButton>
                </div>
              </div>
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '8px 16px',
              }}>
                {sortedProjects.length > 0 ? (
                  sortedProjects.map(p => (
                    <div
                      key={`proj-${p.id}`}
                      onClick={() => handleSelect('project', p)}
                      style={{
                        padding: '14px 16px',
                        cursor: 'pointer',
                        borderRadius: 'var(--r-lg)',
                        transition: 'all var(--t-fast)',
                        borderBottom: '1px solid var(--c-border)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--c-surface-2)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '8px',
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--c-text)' }}>{p.title}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {p.rating && <StarRating value={p.rating} />}
                          {p.flagged && <Tag label="Flagged" color="var(--c-yellow)" />}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--c-muted)',
                        display: 'flex',
                        gap: '16px',
                        flexWrap: 'wrap',
                      }}>
                        <span>👤 {p.student}</span>
                        <span>📖 {p.course}</span>
                        {p.createdAt && <span>📅 {p.createdAt}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', opacity: 0.4, marginBottom: '12px' }}>📁</div>
                    <p style={{ fontSize: '13px', color: 'var(--c-muted)' }}>No projects found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructors Tab */}
          {activeTab === 'instructors' && (
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '8px 16px',
            }}>
              {rawInstructors.length > 0 ? (
                rawInstructors.map(inst => (
                  <div
                    key={`inst-${inst.id}`}
                    onClick={() => handleSelect('instructor', inst)}
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderRadius: 'var(--r-lg)',
                      transition: 'all var(--t-fast)',
                      borderBottom: '1px solid var(--c-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--c-surface-2)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'white',
                        flexShrink: 0,
                      }}>{inst.name?.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--c-text)', marginBottom: '2px' }}>{inst.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginBottom: '6px' }}>{inst.email}</div>
                        {inst.courses.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {inst.courses.map(c => <Tag key={c} label={c} color="#06b6d4" />)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', opacity: 0.4, marginBottom: '12px' }}>👨‍🏫</div>
                  <p style={{ fontSize: '13px', color: 'var(--c-muted)' }}>No instructors found</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add keyframe animation style */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}