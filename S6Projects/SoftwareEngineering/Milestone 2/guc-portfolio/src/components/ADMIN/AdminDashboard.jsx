import React, { useState, useEffect, useRef } from 'react';
import { EMPLOYERS, USERS, COURSES, PROJECTS, INTERNSHIPS, PORTFOLIOS, ALL_MAJORS, ALL_SKILLS } from '../../data/DummyData.js';
import GlobalSearchBar from '../SEARCH/GlobalSearchBar';

const safeArr = (a) => (Array.isArray(a) ? a : []);
const fmt = (n) => Number(n || 0).toLocaleString();

// ── Helper Functions for Portfolio ──────────────────────────────────────────
function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric", month: "short", day: "2-digit",
  });
}

function StarRating({ value }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? "#f5a623" : "none"}
          stroke="#f5a623" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ fontSize: '10px', color: '#f59e0b', marginLeft: '4px', fontWeight: 600 }}>{value.toFixed(1)}</span>
    </span>
  );
}

// ── Portfolio Detail Modal ──────────────────────────────────────────────────
function PortfolioDetailModal({ portfolio, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--c-surface)', borderRadius: '20px',
        width: '90%', maxWidth: '700px', maxHeight: '85vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: 'var(--c-surface-2)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--c-text)', margin: 0 }}>📋 Portfolio Details</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer',
            color: 'var(--c-muted)', padding: '4px 8px', borderRadius: '6px',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--c-border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px',
            padding: '16px', background: 'var(--c-surface-2)', borderRadius: '12px',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--c-violet-bg)', color: 'var(--c-primary)', fontWeight: '700',
              fontSize: '28px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>{initials(portfolio.name)}</div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--c-text)', marginBottom: '6px' }}>{portfolio.name}</h1>
              <p style={{ fontSize: '13px', color: 'var(--c-text-2)', margin: 0 }}>
                {portfolio.email} · {portfolio.major}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--c-text)', marginBottom: '12px' }}>About</h3>
            <p style={{ fontSize: '14px', color: 'var(--c-text-2)', lineHeight: '1.6' }}>{portfolio.about}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--c-text)', marginBottom: '12px' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {portfolio.skills.map(s => (
                <span key={s} style={{
                  display: 'inline-block', padding: '4px 10px', borderRadius: '20px',
                  background: 'var(--c-surface-3)', color: 'var(--c-text)', fontSize: '12px',
                  fontWeight: '500', border: '1px solid #e2e8f0',
                }}>{s}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--c-text)', marginBottom: '12px' }}>
              Projects
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--c-violet-bg)', color: 'var(--c-primary)', fontSize: '11px', fontWeight: '600',
                width: '22px', height: '22px', borderRadius: '50%', marginLeft: '8px',
              }}>{portfolio.projects.length}</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {portfolio.projects.map(p => (
                <div key={p.id} style={{
                  background: 'var(--c-surface-2)', border: '1px solid #e2e8f0',
                  borderRadius: '10px', padding: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--c-text)', margin: 0 }}>{p.title}</p>
                    <StarRating value={p.rating} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--c-text-2)', marginBottom: '8px' }}>
                    <span style={{ background: 'var(--c-blue-bg)', color: '#93c5fd', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '500' }}>{p.course}</span>
                    <span>{formatDate(p.date)}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {p.programmingLanguages.map(l => (
                      <span key={l} style={{
                        padding: '2px 8px', borderRadius: '20px',
                        background: 'var(--c-surface-3)', color: 'var(--c-text)',
                        fontSize: '11px', border: '1px solid #e2e8f0',
                      }}>{l}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <a href={p.githubLink} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--c-primary)', textDecoration: 'none' }}>GitHub ↗</a>
                    <a href={p.demoVideo}  target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--c-primary)', textDecoration: 'none' }}>Demo ↗</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: 'var(--c-surface-2)' }}>
          <button onClick={onClose} style={{
            background: 'var(--c-primary)', color: 'var(--c-surface)', border: 'none', borderRadius: '8px',
            padding: '8px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--c-primary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--c-primary)'}
          >Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Portfolio Search Component ──────────────────────────────────────────────
const PortfolioSearch = () => {
  const [isOpen, setIsOpen]                   = useState(false);
  const [searchQuery, setSearchQuery]         = useState("");
  const [majorFilter, setMajorFilter]         = useState("All");
  const [skillFilter, setSkillFilter]         = useState("All");
  const [sortBy, setSortBy]                   = useState("name");
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [filtersOpen, setFiltersOpen]         = useState(false);
  const dropdownRef = useRef(null);

  const results = React.useMemo(() => {
    let list = [...PORTFOLIOS];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    }
    if (majorFilter !== "All") list = list.filter(p => p.major === majorFilter);
    if (skillFilter !== "All") list = list.filter(p => p.skills.includes(skillFilter));
    if (sortBy === "projects-desc") list.sort((a, b) => b.projects.length - a.projects.length);
    else if (sortBy === "projects-asc") list.sort((a, b) => a.projects.length - b.projects.length);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [searchQuery, majorFilter, skillFilter, sortBy]);

  const hasActiveFilters = searchQuery || majorFilter !== "All" || skillFilter !== "All" || sortBy !== "name";

  const resetFilters = () => {
    setSearchQuery(""); setMajorFilter("All"); setSkillFilter("All"); setSortBy("name");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); setFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--c-surface)', border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '8px 16px',
          fontSize: '13px', fontWeight: '500', color: 'var(--c-text-2)',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.color = 'var(--c-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.color = 'var(--c-text-2)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search Portfolios
        {results.length > 0 && (
          <span style={{ background: 'var(--c-primary)', color: 'var(--c-surface)', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', fontWeight: '600' }}>
            {results.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '8px',
          width: '500px', maxWidth: '90vw', background: 'var(--c-surface)',
          border: '1px solid #e2e8f0', borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 1000, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', background: 'var(--c-surface-2)', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={{ fontWeight: '600', color: 'var(--c-text)' }}>Search Portfolios</span>
            </div>
            <input
              type="text" placeholder="Search by student name or email..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
                borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--c-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--c-border)'}
            />
          </div>

          <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <button onClick={() => setFiltersOpen(!filtersOpen)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', fontSize: '12px', color: 'var(--c-text-2)', cursor: 'pointer',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Filters & Sort {hasActiveFilters && `(${results.length} results)`}
            </button>

            {filtersOpen && (
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <select value={majorFilter} onChange={e => setMajorFilter(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', background: 'var(--c-surface)' }}>
                  <option value="All">All Majors</option>
                  {ALL_MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', background: 'var(--c-surface)' }}>
                  <option value="All">All Skills</option>
                  {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', background: 'var(--c-surface)' }}>
                  <option value="name">Name (A-Z)</option>
                  <option value="projects-desc">Most Projects First</option>
                  <option value="projects-asc">Fewest Projects First</option>
                </select>
                {hasActiveFilters && (
                  <button onClick={resetFilters} style={{ padding: '6px 12px', background: 'var(--c-red-bg)', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '12px', color: '#fca5a5', cursor: 'pointer' }}>
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {results.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--c-muted)' }}><p>No portfolios found</p></div>
            ) : (
              results.map(portfolio => (
                <div key={portfolio.id} onClick={() => { setSelectedPortfolio(portfolio); setIsOpen(false); }}
                  style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--c-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--c-surface)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'var(--c-violet-bg)', color: 'var(--c-primary)', fontWeight: '600',
                      fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{initials(portfolio.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--c-text)' }}>{portfolio.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--c-text-2)' }}>{portfolio.major} • {portfolio.projects.length} projects</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedPortfolio && (
        <PortfolioDetailModal portfolio={selectedPortfolio} onClose={() => setSelectedPortfolio(null)} />
      )}
    </div>
  );
};

// ── Pie / Donut Chart ────────────────────────────────────────────────────────
const SimplePieChart = ({ data, total, colors }) => {
  const size = 130, radius = 50, center = size / 2;
  let startAngle = -90;
  const segments = data.map((item, index) => {
    const percentage = total > 0 ? (item.value / total) * 360 : 0;
    const endAngle = startAngle + percentage;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad   = (endAngle   * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArcFlag = percentage > 180 ? 1 : 0;
    const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    const result = { path: pathData, color: colors[index], label: item.label, value: item.value };
    startAngle = endAngle;
    return result;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, idx) => (
        <path key={idx} d={seg.path} fill={seg.color} stroke="white" strokeWidth="2" />
      ))}
      <circle cx={center} cy={center} r="30" fill="white" />
      <text x={center} y={center - 3}  textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b">{fmt(total)}</text>
      <text x={center} y={center + 10} textAnchor="middle" fontSize="9" fill="#94a3b8">total</text>
    </svg>
  );
};

// ── Horizontal Bar Chart for User Distribution ───────────────────────────────
const UserDistributionChart = ({ data, totalUsers }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {data.map((item, idx) => {
      const pct = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
      return (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', width: '22px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
          <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--c-text-2)', width: '70px', flexShrink: 0 }}>{item.label}</span>
          <div style={{ flex: 1, height: '20px', background: 'var(--c-surface-3)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%', background: item.color, borderRadius: '5px',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '7px',
              minWidth: item.value > 0 ? '28px' : '0', transition: 'width .5s ease',
            }}>
              {item.value > 0 && (
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--c-surface)', textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>
                  {fmt(item.value)}
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '600', color: item.color, width: '30px', textAlign: 'right', flexShrink: 0 }}>
            {pct}%
          </span>
        </div>
      );
    })}
  </div>
);

// ── Progress Ring ────────────────────────────────────────────────────────────
const SimpleProgressRing = ({ percentage, color, size = 90 }) => {
  const radius = 35, circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`} />
      <text x={center} y={center + 4} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ffffff">
        {percentage}%
      </text>
    </svg>
  );
};

// ── Chart.js Students Bar Chart ──────────────────────────────────────────────
const StudentsBarChart = ({ internshipsByCompany }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: internshipsByCompany.map(c => c.company),
        datasets: [{
          label: 'Students placed',
          data:  internshipsByCompany.map(c => c.students),
          backgroundColor: internshipsByCompany.map(c => c.color),
          borderRadius: 6, borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} student${ctx.parsed.y !== 1 ? 's' : ''}` } } },
       scales: {
  x: {
    grid: { color: 'rgba(255,255,255,0.1)' },
    ticks: { 
      color: '#ffffff',
      font: { size: 11 },
      autoSkip: false 
    },
    border: { color: 'rgba(255,255,255,0.2)' }
  },
  y: {
    beginAtZero: true,
    ticks: { 
      color: '#ffffff',
      font: { size: 11 },
      stepSize: 1,
      callback: v => Math.round(v) 
    },
    grid: { color: 'rgba(255,255,255,0.1)' },
    border: { color: 'rgba(255,255,255,0.2)' }
  }
},
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [internshipsByCompany]);
  return <div style={{ position: 'relative', width: '100%', height: '200px' }}><canvas ref={canvasRef} /></div>;
};

// ── Chart.js Internships Over Time Line Chart ────────────────────────────────
const InternshipsLineChart = ({ years, internshipsByCompany, allInternships, employers }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) chartRef.current.destroy();
    const datasets = internshipsByCompany.map(c => {
      const emp  = safeArr(employers).find(e => e.company === c.company);
      const data = years.map(y => emp ? allInternships.filter(i => i.year === y && i.companyId === emp.id).length : 0);
      return { label: c.company, data, borderColor: c.color, backgroundColor: c.color + '15', pointBackgroundColor: c.color, pointRadius: 5, borderWidth: 2, tension: 0.35, fill: false };
    });
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'line',
      data: { labels: years.map(String), datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} internship${ctx.parsed.y !== 1 ? 's' : ''}` } } },
        scales: {
  x: {
    grid: { color: 'rgba(255,255,255,0.1)' },
    ticks: { 
      color: '#ffffff',
      font: { size: 11 },
      autoSkip: false 
    },
    border: { color: 'rgba(255,255,255,0.2)' }
  },
  y: {
    beginAtZero: true,
    ticks: { 
      color: '#ffffff',
      font: { size: 11 },
      stepSize: 1,
      callback: v => Math.round(v) 
    },
    grid: { color: 'rgba(255,255,255,0.1)' },
    border: { color: 'rgba(255,255,255,0.2)' }
  }
},
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [years, internshipsByCompany, allInternships, employers]);
  return <div style={{ position: 'relative', width: '100%', height: '200px' }}><canvas ref={canvasRef} /></div>;
};

// ── Chart Legend ─────────────────────────────────────────────────────────────
const ChartLegend = ({ items }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
    {items.map((item, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
        <span style={{ fontSize: '11px', color: 'var(--c-text-2)' }}>{item.company}</span>
      </div>
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard({ goTo }) {
  const [chartJsLoaded, setChartJsLoaded] = useState(!!window.Chart);

  useEffect(() => {
    if (window.Chart) { setChartJsLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => setChartJsLoaded(true);
    document.head.appendChild(script);
  }, []);

  const countByRole = (role) => safeArr(USERS).filter(u => u.role === role).length;

  const students    = countByRole('Student');
  const instructors = countByRole('Course Instructor');
  const employers   = countByRole('Employer');
  const admins      = countByRole('Administrator');
  const totalUsers  = safeArr(USERS).length;

  const totalProjects     = safeArr(PROJECTS).length;
  const totalCourses      = safeArr(COURSES).length;
  const activeProjects    = safeArr(PROJECTS).filter(p => p.active).length;
  const flaggedProjects   = safeArr(PROJECTS).filter(p => p.flagged).length;
  const inactiveProjects  = totalProjects - activeProjects;
  const pendingEmployers  = safeArr(EMPLOYERS).filter(e => e.status === 'pending').length;
  const approvedEmployers = safeArr(EMPLOYERS).filter(e => e.status === 'approved').length;
  const totalEmployers    = safeArr(EMPLOYERS).length;

  const activeProjectsPercent    = totalProjects  > 0 ? Math.round((activeProjects    / totalProjects)  * 100) : 0;
  const approvedEmployersPercent = totalEmployers > 0 ? Math.round((approvedEmployers / totalEmployers) * 100) : 0;

  const allInternships       = safeArr(INTERNSHIPS);
  const totalInternships     = allInternships.length;
  const completedInternships = allInternships.filter(i => i.status === 'completed').length;
  const ongoingInternships   = allInternships.filter(i => i.status === 'ongoing').length;
  const uniqueStudents       = new Set(allInternships.map(i => i.studentId)).size;

  const companyColors = { 1: 'var(--c-primary)', 2: '#1D9E75', 3: '#EF9F27', 4: '#7F77DD' };

  const internshipsByCompany = safeArr(EMPLOYERS).map(e => ({
    company:  e.company,
    color:    companyColors[e.id] || 'var(--c-text-2)',
    empId:    e.id,
    count:    allInternships.filter(i => i.companyId === e.id).length,
    students: new Set(allInternships.filter(i => i.companyId === e.id).map(i => i.studentId)).size,
  })).filter(e => e.count > 0).sort((a, b) => b.count - a.count);

  const years = [...new Set(allInternships.map(i => i.year))].sort();

  const userDistData = [
    { label: 'Students',    value: students,    color: 'var(--c-primary)', icon: '🎓' },
    { label: 'Instructors', value: instructors, color: '#1D9E75', icon: '📖' },
    { label: 'Employers',   value: employers,   color: '#EF9F27', icon: '🏢' },
    { label: 'Admins',      value: admins,      color: '#7F77DD', icon: '🛡️' },
  ];

  const userRolesData = [
    { label: 'Students',    value: students,    color: 'var(--c-primary)' },
    { label: 'Instructors', value: instructors, color: '#1D9E75' },
    { label: 'Employers',   value: employers,   color: '#EF9F27' },
    { label: 'Admins',      value: admins,      color: '#7F77DD' },
  ].filter(d => d.value > 0);

  const projectsData = [
    { label: 'Active',   value: activeProjects,   color: '#1D9E75' },
    { label: 'Inactive', value: inactiveProjects, color: '#fca5a5' },
    { label: 'Flagged',  value: flaggedProjects,  color: '#EF9F27' },
  ].filter(d => d.value > 0);

  const userColors    = ['var(--c-primary)', '#1D9E75', '#EF9F27', '#7F77DD'];
  const projectColors = ['#1D9E75', '#fca5a5', '#EF9F27'];

  const quickActions = [
    { icon: '👤', label: 'Manage Users',          desc: 'View, edit or remove users',       color: 'var(--c-primary)', onClick: () => goTo('apage4', { filter: 'All' }) },
    { icon: '🏢', label: 'Employer Applications', desc: 'Approve or reject pending apps',    color: '#EF9F27', onClick: () => goTo('apage2', { filter: 'pending' }) },
    { icon: '📁', label: 'Browse Projects',        desc: 'Review all project submissions',    color: '#1D9E75', onClick: () => goTo('apage3', { tab: 'all' }) },
    { icon: '⚑',  label: 'Flagged Projects',       desc: 'Handle content awaiting review',    color: '#fca5a5', onClick: () => goTo('apage3', { tab: 'flagged' }) },
    { icon: '📚', label: 'Course Management',      desc: 'Oversee all platform courses',      color: '#06b6d4', onClick: () => goTo('apage1', {}) },
    { icon: '🛡️', label: 'Admin Accounts',         desc: 'Manage administrator accounts',     color: '#7F77DD', onClick: () => goTo('apage4', { filter: 'Administrator' }) },
  ];

  // ── KEY FIX: Search result click → navigate with searchQuery so the target
  //    page filters down to just the selected item AND highlights it. ─────────
  const handleSearchResult = (type, item) => {
    switch (type) {
      case 'project':
        goTo('apage3', {
          tab:         item.flagged ? 'flagged' : 'all',
          highlightId: item.id,
          searchQuery: item.title,
        });
        break;
      case 'instructor':
        goTo('apage4', {
          filter:      'Course Instructor',
          highlightId: item.id,
          searchQuery: item.name,
        });
        break;
      case 'course':
        goTo('apage1', {
          highlightId: item.id,
          searchQuery: item.name,
        });
        break;
      case 'user':
        goTo('apage4', {
          highlightId: item.id,
          searchQuery: item.name,
        });
        break;
      case 'employer':
        goTo('apage2', {
          highlightId: item.id,
        });
        break;
      default:
        break;
    }
  };

  const card = {
    background: 'var(--c-surface)', borderRadius: '16px',
    padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  };

  const sectionTitle = {
    fontSize: '14px', fontWeight: '700', color: 'var(--c-text)', margin: '0 0 16px 0',
  };

  return (
    <div style={{
      width: '100%', padding: '28px',
      background: 'var(--c-bg)',
      fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box',
    }}>

      {/* Header with Portfolio Search */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            margin: 0,
            letterSpacing: '-0.4px',
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 60%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
          }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--c-muted)', margin: '4px 0 0 0' }}>
            Platform statistics overview
          </p>
        </div>
        <PortfolioSearch />
      </div>

      {/* Global Search Bar */}
      <GlobalSearchBar
        placeholder="Search projects, instructors"
        onResultClick={handleSearchResult}
      />

      {/* ── Row 1: User Distribution + Projects + User Roles ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <p style={{ ...sectionTitle, margin: 0 }}>Total Users Distribution</p>
            <div style={{ background: 'var(--c-surface-3)', padding: '5px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--c-primary)' }}>{fmt(totalUsers)}</span>
              <span style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>total</span>
            </div>
          </div>
          <UserDistributionChart data={userDistData} totalUsers={totalUsers} />
        </div>

        <div style={card}>
          <p style={sectionTitle}>Projects</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SimplePieChart data={projectsData} total={totalProjects} colors={projectColors} />
            <div style={{ flex: 1 }}>
              {projectsData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '11px', color: 'var(--c-text-2)' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: item.color }}>{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={card}>
          <p style={sectionTitle}>User Roles</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SimplePieChart data={userRolesData} total={totalUsers} colors={userColors} />
            <div style={{ flex: 1 }}>
              {userRolesData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '11px', color: 'var(--c-text-2)' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: item.color }}>{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Courses + Active Projects Ring + Employer Approvals Ring ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#06b6d415', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '8px' }}>📚</div>
          <div style={{ fontSize: '12px', color: 'var(--c-muted)', fontWeight: '500', marginBottom: '2px' }}>Total Courses</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--c-text)', lineHeight: 1 }}>{fmt(totalCourses)}</div>
          <div style={{ fontSize: '10px', color: '#0891b2', fontWeight: '600', marginTop: '4px' }}>Platform courses</div>
        </div>

        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px 0' }}>Active Projects</p>
          <p style={{ fontSize: '11px', color: 'var(--c-muted)', margin: '0 0 12px 0' }}>{activeProjectsPercent}% of total</p>
          <SimpleProgressRing percentage={activeProjectsPercent} color="#1D9E75" size={100} />
          <p style={{ fontSize: '13px', color: '#ffffff', marginTop: '12px' }}>
            <span style={{ fontWeight: '700', color: 'var(--c-text)' }}>{fmt(activeProjects)}</span> active
            &nbsp;·&nbsp;
            <span style={{ color: '#fca5a5', fontWeight: '600' }}>{fmt(inactiveProjects)}</span> inactive
          </p>
        </div>

        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--c-text)', margin: '0 0 4px 0' }}>Employer Approvals</p>
          <p style={{ fontSize: '11px', color: 'var(--c-muted)', margin: '0 0 12px 0' }}>{approvedEmployersPercent}% approved</p>
          <SimpleProgressRing percentage={approvedEmployersPercent} color="#378ADD" size={100} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>Pending: <strong style={{ color: '#EF9F27' }}>{fmt(pendingEmployers)}</strong></span>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>Approved: <strong style={{ color: '#1D9E75' }}>{fmt(approvedEmployers)}</strong></span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--c-border)', borderRadius: '99px', overflow: 'hidden', marginTop: '10px' }}>
            <div style={{ width: `${approvedEmployersPercent}%`, height: '100%', background: 'var(--c-primary)', borderRadius: '99px' }} />
          </div>
        </div>
      </div>

      {/* ── Row 3: Internship Statistics ──────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={card}>
          <p style={{ ...sectionTitle, marginBottom: '20px' }}>Internship Statistics</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'Total Internships', value: totalInternships,     color: 'var(--c-primary)', icon: '💼' },
              { label: 'Completed',         value: completedInternships, color: '#1D9E75', icon: '✅' },
              { label: 'Ongoing',           value: ongoingInternships,   color: '#EF9F27', icon: '⏳' },
              { label: 'Students Placed',   value: uniqueStudents,       color: '#7F77DD', icon: '🎓' },
            ].map((s, i) => (
              <div key={i} style={{
                background: `${s.color}08`, border: `1.5px solid ${s.color}20`,
                borderRadius: '12px', padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--c-text)', lineHeight: 1 }}>{fmt(s.value)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--c-muted)', marginTop: '3px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'var(--c-surface-2)', borderRadius: '12px', border: '1px solid var(--c-border)', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>🎓</span>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-text)', margin: 0 }}>Students placed</p>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--c-muted)', margin: '0 0 12px 0' }}>Unique students per company</p>
              <ChartLegend items={internshipsByCompany} />
              {chartJsLoaded
                ? <StudentsBarChart internshipsByCompany={internshipsByCompany} />
                : <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-muted)', fontSize: '13px' }}>Loading chart…</div>
              }
            </div>

            <div style={{ background: 'var(--c-surface-2)', borderRadius: '12px', border: '1px solid var(--c-border)', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>📅</span>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-text)', margin: 0 }}>Internships over time</p>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--c-muted)', margin: '0 0 12px 0' }}>Per company, broken down by year</p>
              <ChartLegend items={internshipsByCompany} />
              {chartJsLoaded
                ? <InternshipsLineChart years={years} internshipsByCompany={internshipsByCompany} allInternships={allInternships} employers={safeArr(EMPLOYERS)} />
                : <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-muted)', fontSize: '13px' }}>Loading chart…</div>
              }
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '14px 16px', background: 'var(--c-surface-2)', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--c-text-2)', fontWeight: '600', flexShrink: 0 }}>Completion rate</span>
            <div style={{ flex: 1, height: '8px', background: 'var(--c-border)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${totalInternships > 0 ? Math.round((completedInternships / totalInternships) * 100) : 0}%`, height: '100%', background: '#1D9E75', borderRadius: '99px' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#1D9E75', flexShrink: 0 }}>
              {totalInternships > 0 ? Math.round((completedInternships / totalInternships) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Row 4: Quick Actions ──────────────────────────────────────────── */}
      <div style={card}>
        <p style={sectionTitle}>Quick Actions</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {quickActions.map((action, idx) => (
            <button key={idx} onClick={action.onClick} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: 'var(--c-surface-2)', border: '1.5px solid var(--c-border)',
              borderRadius: '14px', padding: '16px 18px',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = action.color;
                e.currentTarget.style.background = 'var(--c-surface)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}25`;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--c-border)';
                e.currentTarget.style.background = 'var(--c-surface-2)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${action.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {action.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-text)', marginBottom: '2px' }}>{action.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--c-muted)' }}>{action.desc}</div>
              </div>
              <span style={{ fontSize: '16px', color: action.color, flexShrink: 0 }}>→</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}