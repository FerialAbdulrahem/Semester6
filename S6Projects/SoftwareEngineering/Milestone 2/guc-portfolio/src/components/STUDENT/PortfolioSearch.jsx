import { useState, useMemo } from "react";
import { PORTFOLIOS, ALL_MAJORS, ALL_SKILLS } from "../../data/DummyData.js";


// ─── Helpers ─────────────────────────────────────────────────────────────────
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
    <span className="sp-stars" aria-label={`Rating ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? "#f5a623" : "none"}
          stroke="#f5a623" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="sp-stars__val">{value.toFixed(1)}</span>
    </span>
  );
}

// ─── Portfolio Detail ─────────────────────────────────────────────────────────
function PortfolioDetail({ portfolio, onBack }) {
  return (
    <div className="sp-detail">
      <button className="sp-back-btn" onClick={onBack}>← Back to Portfolios</button>

      <div className="sp-detail__header">
        <div className="sp-detail__avatar">{initials(portfolio.name)}</div>
        <div>
          <h1 className="sp-detail__name">{portfolio.name}</h1>
          <p className="sp-detail__meta">
            <span>{portfolio.email}</span>
            <span className="sp-detail__sep">·</span>
            <span>{portfolio.major}</span>
          </p>
        </div>
      </div>

      <section className="sp-section">
        <h2 className="sp-section__title">About</h2>
        <p className="sp-section__body">{portfolio.about}</p>
      </section>

      <section className="sp-section">
        <h2 className="sp-section__title">Skills</h2>
        {portfolio.skills.length > 0 ? (
          <div className="sp-skills">
            {portfolio.skills.map(s => (
              <span key={s} className="sp-skill-tag">{s}</span>
            ))}
          </div>
        ) : (
          <p className="sp-section__empty">No skills listed yet.</p>
        )}
      </section>

      <section className="sp-section">
        <h2 className="sp-section__title">
          Projects
          <span className="sp-section__count">{portfolio.projects.length}</span>
        </h2>
        {portfolio.projects.length === 0 ? (
          <p className="sp-section__empty">No projects to display.</p>
        ) : (
          <div className="sp-projects">
            {portfolio.projects.map(p => (
              <div key={p.id} className="sp-project-card">
                <div className="sp-project-card__top">
                  <p className="sp-project-card__title">{p.title}</p>
                  <StarRating value={p.rating} />
                </div>
                <div className="sp-project-card__meta">
                  <span className="sp-project-card__course">{p.course}</span>
                  <span className="sp-project-card__date">{formatDate(p.date)}</span>
                </div>
                <div className="sp-project-card__langs">
                  {p.programmingLanguages.map(l => (
                    <span key={l} className="sp-skill-tag sp-skill-tag--sm">{l}</span>
                  ))}
                </div>
                <div className="sp-project-card__links">
                  <a href={p.githubLink} target="_blank" rel="noreferrer" className="sp-link">GitHub ↗</a>
                  <a href={p.demoVideo}  target="_blank" rel="noreferrer" className="sp-link">Demo ↗</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Portfolio Card ───────────────────────────────────────────────────────────
function PortfolioCard({ portfolio, onSelect }) {
  return (
    <div
      className="sp-card"
      onClick={() => onSelect(portfolio)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onSelect(portfolio)}
    >
      <div className="sp-card__left">
        <div className="sp-card__avatar">{initials(portfolio.name)}</div>
        <div className="sp-card__info">
          <p className="sp-card__name">{portfolio.name}</p>
          <p className="sp-card__sub">{portfolio.email}</p>
          <p className="sp-card__major">{portfolio.major}</p>
        </div>
      </div>

      <div className="sp-card__right">
        <div className="sp-card__skills">
          {portfolio.skills.slice(0, 3).map(s => (
            <span key={s} className="sp-skill-tag sp-skill-tag--sm">{s}</span>
          ))}
          {portfolio.skills.length > 3 && (
            <span className="sp-skill-tag sp-skill-tag--sm sp-skill-tag--more">
              +{portfolio.skills.length - 3}
            </span>
          )}
        </div>
        <div className="sp-card__proj-count">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          {portfolio.projects.length} project{portfolio.projects.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SearchPortfolio() {
  const [query,       setQuery]       = useState("");
  const [majorFilter, setMajorFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [sortBy,      setSortBy]      = useState("name");
  const [selected,    setSelected]    = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    let list = [...PORTFOLIOS];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }
    if (majorFilter !== "All") list = list.filter(p => p.major === majorFilter);
    if (skillFilter !== "All") list = list.filter(p => p.skills.includes(skillFilter));
    if      (sortBy === "projects-desc") list.sort((a, b) => b.projects.length - a.projects.length);
    else if (sortBy === "projects-asc")  list.sort((a, b) => a.projects.length - b.projects.length);
    else                                 list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [query, majorFilter, skillFilter, sortBy]);

  const hasActiveFilters = query || majorFilter !== "All" || skillFilter !== "All" || sortBy !== "name";

  const resetFilters = () => {
    setQuery(""); setMajorFilter("All"); setSkillFilter("All"); setSortBy("name");
  };

  if (selected) {
    return <PortfolioDetail portfolio={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="sp">
      <div className="sp__page">
        <h1 className="sp__heading">Student Portfolios</h1>

        {/* Search bar */}
        <div className="sp__search-wrap">
          <div className="sp__search-box">
            <svg className="sp__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="sp__search-input"
              placeholder="Search by student name or email…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button className="sp__search-clear" onClick={() => setQuery("")} aria-label="Clear">✕</button>
            )}
          </div>

          <button
            className={"sp__filter-toggle" + (filtersOpen ? " sp__filter-toggle--active" : "")}
            onClick={() => setFiltersOpen(v => !v)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters &amp; Sort
            {hasActiveFilters && <span className="sp__filter-dot" />}
          </button>
        </div>

        {/* Filter / Sort panel */}
        {filtersOpen && (
          <div className="sp__filter-panel">
            <div className="sp__filter-group">
              <label className="sp__filter-label">Major</label>
              <select className="sp__select" value={majorFilter} onChange={e => setMajorFilter(e.target.value)}>
                <option value="All">All majors</option>
                {ALL_MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="sp__filter-group">
              <label className="sp__filter-label">Skill</label>
              <select className="sp__select" value={skillFilter} onChange={e => setSkillFilter(e.target.value)}>
                <option value="All">All skills</option>
                {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="sp__filter-group">
              <label className="sp__filter-label">Sort by</label>
              <select className="sp__select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="name">Name (A – Z)</option>
                <option value="projects-desc">Most projects first</option>
                <option value="projects-asc">Fewest projects first</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button className="sp__reset-btn" onClick={resetFilters}>Reset all</button>
            )}
          </div>
        )}

        {/* Results label */}
        <p className="sp__results-label">
          {results.length} portfolio{results.length !== 1 ? "s" : ""} found
          {hasActiveFilters && <span className="sp__results-hint"> — filtered</span>}
        </p>

        {/* Results list */}
        {results.length === 0 ? (
          <div className="sp__empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>No portfolios match your search.</p>
            <button className="sp__reset-btn" onClick={resetFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="sp__list">
            {results.map(p => (
              <PortfolioCard key={p.id} portfolio={p} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* CSS Styles */}
      <style>{`
        .sp { 
          min-height: 100vh;
          background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #dcfce7 100%);
          padding: 1.5rem; 
        }
        .sp__page { 
          max-width: 860px; 
          margin: 0 auto;
        }
        .sp__heading { 
          font-size: 28px; 
          font-weight: 700; 
          color: #1e293b; 
          margin-bottom: 1.25rem; 
        }

        /* Search bar */
        .sp__search-wrap { 
          display: flex; 
          gap: .5rem; 
          align-items: center; 
          margin-bottom: .75rem; 
        }
        .sp__search-box { 
          position: relative; 
          flex: 1; 
        }
        .sp__search-icon { 
          position: absolute; 
          left: 12px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: #94a3b8; 
          pointer-events: none; 
        }
        .sp__search-input { 
          width: 100%; 
          padding: 10px 34px 10px 38px; 
          border: 1px solid #e2e8f0; 
          border-radius: 12px; 
          font-size: 14px; 
          background: #ffffff; 
          color: #1e293b; 
          outline: none; 
          transition: all 0.2s; 
        }
        .sp__search-input:focus { 
          border-color: #6366f1; 
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); 
        }
        .sp__search-clear { 
          position: absolute; 
          right: 12px; 
          top: 50%; 
          transform: translateY(-50%); 
          background: none; 
          border: none; 
          font-size: 14px; 
          color: #94a3b8; 
          cursor: pointer; 
          padding: 4px; 
          line-height: 1; 
        }
        .sp__search-clear:hover { 
          color: #ef4444; 
        }

        /* Filter toggle */
        .sp__filter-toggle { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          position: relative; 
          background: #ffffff; 
          border: 1px solid #e2e8f0; 
          border-radius: 12px; 
          padding: 10px 16px; 
          font-size: 13px; 
          font-weight: 500;
          color: #64748b; 
          cursor: pointer; 
          white-space: nowrap; 
          transition: all 0.2s; 
        }
        .sp__filter-toggle:hover, 
        .sp__filter-toggle--active { 
          border-color: #6366f1; 
          color: #4f46e5; 
          background: #f8fafc;
        }
        .sp__filter-dot { 
          position: absolute; 
          top: 6px; 
          right: 6px; 
          width: 8px; 
          height: 8px; 
          border-radius: 50%; 
          background: #ef4444; 
        }

        /* Filter panel */
        .sp__filter-panel { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 1rem; 
          align-items: flex-end; 
          background: #ffffff; 
          border: 1px solid #e2e8f0; 
          border-radius: 12px; 
          padding: 1.25rem; 
          margin-bottom: 1rem; 
        }
        .sp__filter-group { 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
          flex: 1;
          min-width: 150px;
        }
        .sp__filter-label { 
          font-size: 11px; 
          font-weight: 600; 
          color: #64748b; 
          text-transform: uppercase; 
          letter-spacing: 0.5px; 
        }
        .sp__select { 
          border: 1px solid #e2e8f0; 
          border-radius: 8px; 
          padding: 8px 28px 8px 12px; 
          font-size: 13px; 
          background: #ffffff; 
          color: #1e293b; 
          cursor: pointer; 
          outline: none; 
          appearance: none; 
          background-repeat: no-repeat; 
          background-position: right 12px center; 
          transition: all 0.2s; 
        }
        .sp__select:hover { 
          border-color: #cbd5e1; 
        }
        .sp__select:focus { 
          border-color: #6366f1; 
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); 
        }
        .sp__reset-btn { 
          background: #fee2e2; 
          border: 1px solid #fca5a5; 
          border-radius: 8px; 
          padding: 8px 16px; 
          font-size: 12px; 
          font-weight: 500;
          color: #991b1b; 
          cursor: pointer; 
          transition: all 0.2s; 
          align-self: flex-end; 
        }
        .sp__reset-btn:hover { 
          background: #fecaca; 
        }

        /* Results */
        .sp__results-label { 
          font-size: 12px; 
          font-weight: 600; 
          color: #64748b; 
          text-transform: uppercase; 
          letter-spacing: 0.5px; 
          margin-bottom: 1rem; 
        }
        .sp__results-hint { 
          font-weight: 400; 
          color: #6366f1; 
        }
        .sp__list { 
          display: flex; 
          flex-direction: column; 
          gap: 12px; 
        }

        /* Portfolio card */
        .sp-card { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: 1rem; 
          background: #ffffff; 
          border: 1px solid #e2e8f0; 
          border-radius: 12px; 
          padding: 16px 20px; 
          cursor: pointer; 
          transition: all 0.2s; 
        }
        .sp-card:hover { 
          border-color: #6366f1; 
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
          transform: translateY(-2px);
        }
        .sp-card__left { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
        }
        .sp-card__avatar { 
          width: 48px; 
          height: 48px; 
          border-radius: 50%; 
          background: #ede9fe; 
          color: #4f46e5; 
          font-weight: 700; 
          font-size: 16px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0; 
        }
        .sp-card__name { 
          font-size: 15px; 
          font-weight: 600; 
          color: #1e293b; 
        }
        .sp-card__sub { 
          font-size: 12px; 
          color: #64748b; 
          margin-top: 2px; 
        }
        .sp-card__major { 
          font-size: 12px; 
          color: #4f46e5; 
          margin-top: 4px; 
          font-weight: 500; 
        }
        .sp-card__right { 
          display: flex; 
          flex-direction: column; 
          align-items: flex-end; 
          gap: 8px; 
        }
        .sp-card__skills { 
          display: flex; 
          gap: 6px; 
          flex-wrap: wrap; 
          justify-content: flex-end; 
        }
        .sp-card__proj-count { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 12px; 
          color: #64748b; 
        }

        /* Skill tags */
        .sp-skill-tag { 
          display: inline-block; 
          padding: 4px 10px; 
          border-radius: 20px; 
          background: #f1f5f9; 
          color: #1e293b; 
          font-size: 12px; 
          font-weight: 500; 
          border: 1px solid #e2e8f0; 
        }
        .sp-skill-tag--sm { 
          padding: 2px 8px; 
          font-size: 11px; 
        }
        .sp-skill-tag--more { 
          background: #f8fafc; 
          color: #64748b; 
          border-color: #e2e8f0; 
        }

        /* Empty state */
        .sp__empty { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 1rem; 
          padding: 3rem 1rem; 
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          color: #64748b; 
          font-size: 14px; 
          text-align: center; 
        }

        /* Detail view */
        .sp-detail { 
          max-width: 860px; 
          margin: 0 auto;
        }
        .sp-back-btn { 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
          background: #ffffff; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px; 
          padding: 8px 16px; 
          font-size: 13px; 
          font-weight: 500;
          color: #64748b; 
          cursor: pointer; 
          margin-bottom: 1.5rem; 
          transition: all 0.2s; 
        }
        .sp-back-btn:hover { 
          border-color: #6366f1; 
          color: #4f46e5; 
          background: #f8fafc;
        }
        .sp-detail__header { 
          display: flex; 
          align-items: center; 
          gap: 20px; 
          margin-bottom: 2rem; 
          background: #ffffff;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        .sp-detail__avatar { 
          width: 80px; 
          height: 80px; 
          border-radius: 50%; 
          background: #ede9fe; 
          color: #4f46e5; 
          font-weight: 700; 
          font-size: 28px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0; 
        }
        .sp-detail__name { 
          font-size: 28px; 
          font-weight: 700; 
          color: #1e293b; 
          margin-bottom: 8px;
        }
        .sp-detail__meta { 
          font-size: 14px; 
          color: #64748b; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
        }
        .sp-detail__sep { 
          color: #cbd5e1; 
        }
        .sp-section { 
          margin-bottom: 2rem; 
          background: #ffffff;
          padding: 20px 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .sp-section__title { 
          font-size: 18px; 
          font-weight: 600; 
          color: #1e293b; 
          margin-bottom: 1rem; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
        }
        .sp-section__count { 
          display: inline-flex; 
          align-items: center; 
          justify-content: center; 
          background: #ede9fe; 
          color: #4f46e5; 
          font-size: 12px; 
          font-weight: 600; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
        }
        .sp-section__body { 
          font-size: 14px; 
          color: #475569; 
          line-height: 1.6; 
        }
        .sp-section__empty { 
          font-size: 13px; 
          color: #94a3b8; 
          font-style: italic; 
        }
        .sp-skills { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 8px; 
        }
        .sp-projects { 
          display: flex; 
          flex-direction: column; 
          gap: 12px; 
        }
        .sp-project-card { 
          background: #f8fafc; 
          border: 1px solid #e2e8f0; 
          border-radius: 10px; 
          padding: 16px; 
        }
        .sp-project-card__top { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          margin-bottom: 8px; 
        }
        .sp-project-card__title { 
          font-size: 15px; 
          font-weight: 600; 
          color: #1e293b; 
        }
        .sp-project-card__meta { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          font-size: 12px; 
          color: #64748b; 
        }
        .sp-project-card__course { 
          background: #dbeafe; 
          color: #1e40af; 
          padding: 2px 8px; 
          border-radius: 20px; 
          font-size: 11px; 
          font-weight: 500; 
        }
        .sp-project-card__langs { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 6px; 
          margin-top: 10px; 
        }
        .sp-project-card__links { 
          display: flex; 
          gap: 16px; 
          margin-top: 12px; 
        }
        .sp-link { 
          font-size: 12px; 
          color: #4f46e5; 
          text-decoration: none; 
          font-weight: 500; 
        }
        .sp-link:hover { 
          text-decoration: underline; 
        }

        /* Stars */
        .sp-stars { 
          display: inline-flex; 
          align-items: center; 
          gap: 3px; 
        }
        .sp-stars__val { 
          font-size: 11px; 
          color: #f59e0b; 
          margin-left: 6px; 
          font-weight: 600; 
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sp { padding: 1rem; }
          .sp-card { flex-direction: column; align-items: flex-start; }
          .sp-card__right { align-items: flex-start; width: 100%; }
          .sp__filter-panel { flex-direction: column; align-items: stretch; }
          .sp__reset-btn { align-self: stretch; }
          .sp-detail__header { flex-direction: column; text-align: center; }
          .sp-detail__meta { justify-content: center; }
        }
      `}</style>
    </div>
  );
}