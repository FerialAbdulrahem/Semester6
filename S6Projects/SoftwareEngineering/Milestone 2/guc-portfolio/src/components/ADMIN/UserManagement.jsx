import { useState, useEffect } from "react";
import { USERS, COURSES, PORTFOLIOS, APPLYINGEMPLOYERS, PROJECTS } from '../../data/DummyData.js';
import '../styles/UserManagement.css';

const ROLES = ["All", "Student", "Course Instructor", "Employer", "Administrator"];

// Pulse-highlight keyframe injected once
const HIGHLIGHT_STYLE_ID = "um-row-highlight-style";
if (!document.getElementById(HIGHLIGHT_STYLE_ID)) {
  const s = document.createElement("style");
  s.id = HIGHLIGHT_STYLE_ID;
  s.textContent = `
    @keyframes umRowPulse {
      0%   { background-color: rgba(59,130,246,0.15); }
      70%  { background-color: rgba(59,130,246,0.15); }
      100% { background-color: transparent; }
    }
    tr.um__row--highlight {
      animation: umRowPulse 2s ease-out forwards;
    }
  `;
  document.head.appendChild(s);
}

// ── Shared modal shell ────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--c-surface)', borderRadius: '20px', width: '90%', maxWidth: '640px',
          maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface-2)',
        }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--c-text)' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '20px',
            cursor: 'pointer', color: 'var(--c-text-2)', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>

        <div style={{
          padding: '14px 24px', borderTop: '1px solid var(--c-border)',
          display: 'flex', justifyContent: 'flex-end', background: 'var(--c-surface-2)',
        }}>
          <button onClick={onClose} style={{
            background: 'var(--c-primary)', color: 'var(--c-surface)', border: 'none',
            borderRadius: '8px', padding: '8px 22px', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer',
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Reusable bits ─────────────────────────────────────────────────────────────
const Field = ({ label, value }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--c-text-2)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '3px' }}>{label}</div>
    <div style={{ fontSize: '14px', color: 'var(--c-text)' }}>{value || <span style={{ color: 'var(--c-muted)' }}>—</span>}</div>
  </div>
);

const Tag = ({ label, color = 'var(--c-primary)' }) => (
  <span style={{
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
    background: color + '15', color, border: `1px solid ${color}30`,
    fontSize: '11px', fontWeight: '600', marginRight: '6px', marginBottom: '6px',
  }}>{label}</span>
);

const Stars = ({ value }) => {
  if (!value) return <span style={{ color: 'var(--c-muted)', fontSize: '12px' }}>No rating</span>;
  const full = Math.floor(value), half = value - full >= 0.5;
  return (
    <span style={{ fontSize: '13px', color: '#f59e0b' }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: 'var(--c-text-2)', marginLeft: '5px', fontSize: '11px' }}>{value.toFixed(1)}</span>
    </span>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: '13px', fontWeight: '700', color: 'var(--c-text)',
    borderBottom: '1px solid var(--c-border)', paddingBottom: '8px',
    marginBottom: '14px', marginTop: '20px',
  }}>{children}</div>
);

const UserHeader = ({ user, bg = 'var(--c-surface-2)', avatarBg = 'var(--c-violet-bg)', avatarColor = 'var(--c-primary)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: bg, borderRadius: '12px' }}>
    {user.pic
      ? <img src={user.pic} alt={user.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
      : <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: avatarBg, color: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700' }}>{user.name.charAt(0)}</div>
    }
    <div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--c-text)' }}>{user.name}</div>
      <div style={{ fontSize: '13px', color: 'var(--c-text-2)' }}>{user.email}</div>
      <span style={{
        fontSize: '11px', fontWeight: '600', color: user.active ? '#6ee7b7' : '#fca5a5',
        background: user.active ? 'var(--c-green-bg)' : 'var(--c-red-bg)',
        padding: '2px 8px', borderRadius: '20px', marginTop: '4px', display: 'inline-block',
      }}>
        {user.active ? 'Active' : 'Inactive'}
      </span>
    </div>
  </div>
);

// ── Student detail modal ──────────────────────────────────────────────────────
function StudentDetail({ user, onClose }) {
  const portfolio = PORTFOLIOS.find(p => p.id === user.id || p.email === user.email);
  return (
    <Modal title="👤 Student Details" onClose={onClose}>
      <UserHeader user={user} avatarBg="#ede9fe" avatarColor="#6366f1" />
      {portfolio ? (
        <>
          <Field label="Major" value={portfolio.major} />

          {portfolio.about && (
            <>
              <SectionTitle>📝 Bio</SectionTitle>
              <p style={{ fontSize: '13px', color: 'var(--c-text-2)', lineHeight: '1.65', margin: 0 }}>{portfolio.about}</p>
            </>
          )}

          {portfolio.skills?.length > 0 && (
            <>
              <SectionTitle>🛠 Skills</SectionTitle>
              <div>{portfolio.skills.map(s => <Tag key={s} label={s} color="#6366f1" />)}</div>
            </>
          )}

          <SectionTitle>📁 Projects ({portfolio.projects.length})</SectionTitle>
          {portfolio.projects.length === 0
            ? <p style={{ color: 'var(--c-muted)', fontSize: '13px' }}>No projects yet.</p>
            : portfolio.projects.map(p => (
              <div key={p.id} style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', borderRadius: '10px', padding: '12px 16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--c-text)' }}>{p.title}</span>
                  <Stars value={p.rating} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--c-text-2)', marginBottom: '8px' }}>
                  <span style={{ background: 'var(--c-blue-bg)', color: '#93c5fd', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', marginRight: '8px' }}>{p.course}</span>
                  {new Date(p.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })}
                </div>
                <div style={{ marginBottom: '8px' }}>{p.programmingLanguages.map(l => <Tag key={l} label={l} color="#0891b2" />)}</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={p.githubLink} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--c-primary)', textDecoration: 'none' }}>GitHub ↗</a>
                  <a href={p.demoVideo}  target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--c-primary)', textDecoration: 'none' }}>Demo ↗</a>
                </div>
              </div>
            ))
          }
        </>
      ) : (
        <p style={{ color: 'var(--c-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>No portfolio data found for this student.</p>
      )}
    </Modal>
  );
}

// ── Instructor detail modal ───────────────────────────────────────────────────
function InstructorDetail({ user, onClose }) {
  const courses  = COURSES.filter(c => c.instructorId === user.id);
  const projects = PROJECTS.filter(p => p.instructorId === user.id);
  return (
    <Modal title="👨‍🏫 Instructor Details" onClose={onClose}>
      <UserHeader user={user} avatarBg="#dcfce7" avatarColor="#16a34a" />

      <SectionTitle>📚 Courses Teaching ({courses.length})</SectionTitle>
      {courses.length === 0
        ? <p style={{ color: 'var(--c-muted)', fontSize: '13px' }}>No courses assigned.</p>
        : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--c-surface-2)' }}>
                {['Course Name', 'Code'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--c-text-2)', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--c-border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--c-text)' }}>{c.name}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <code style={{ background: 'var(--c-surface-3)', color: 'var(--c-text-2)', padding: '2px 7px', borderRadius: '4px', fontSize: '12px' }}>{c.code}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }

      <SectionTitle>📁 Projects Supervised ({projects.length})</SectionTitle>
      {projects.length === 0
        ? <p style={{ color: 'var(--c-muted)', fontSize: '13px' }}>No projects supervised.</p>
        : projects.map(p => (
          <div key={p.id} style={{ background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', borderRadius: '10px', padding: '12px 16px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--c-text)' }}>{p.title}</span>
              <Stars value={p.rating} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>
              👤 {p.student} &nbsp;·&nbsp;
              <span style={{ background: 'var(--c-blue-bg)', color: '#93c5fd', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>{p.course}</span>
            </div>
          </div>
        ))
      }
    </Modal>
  );
}

// ── Employer detail modal ─────────────────────────────────────────────────────
function EmployerDetail({ user, onClose }) {
  const [viewingDoc, setViewingDoc] = useState(null);
  const employer = APPLYINGEMPLOYERS.find(e => e.companyEmail === user.email || e.company === user.name);
  const statusColor = { pending: '#fcd34d', accepted: '#6ee7b7', rejected: '#fca5a5' };
  const statusBg    = { pending: 'var(--c-yellow-bg)', accepted: 'var(--c-green-bg)', rejected: 'var(--c-red-bg)' };

  // Resolve a document entry to { name, url }
  const resolveDoc = (d) => {
    if (typeof d === 'object' && d !== null) {
      const name = d.name || d.fileName || 'Document';
      const url = d.url || d.fileUrl || (d.fileName ? `/${d.fileName}` : null);
      return { name, url };
    }

    const name = String(d);
    const url = name ? `/${name}` : null;
    return { name, url };
  };

  const handleView = (d) => {
    const doc = resolveDoc(d);
    if (doc.url) setViewingDoc(doc);
    else alert(`No preview URL available for: ${doc.name}`);
  };

  const handleDownload = (d) => {
    const { name, url } = resolveDoc(d);
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`No download URL available for: ${name}`);
    }
  };

  return (
    <Modal title="🏢 Employer Details" onClose={onClose}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: 'var(--c-surface-2)', borderRadius: '12px' }}>
        {user.pic
          ? <img src={user.pic} alt={user.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
          : <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--c-yellow-bg)', color: '#fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700' }}>{user.name.charAt(0)}</div>
        }
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--c-text)' }}>{employer?.company || user.name}</div>
          <div style={{ fontSize: '13px', color: 'var(--c-text-2)' }}>{employer?.companyEmail || user.email}</div>
          {employer && (
            <span style={{
              fontSize: '11px', fontWeight: '600', marginTop: '4px', display: 'inline-block',
              color: statusColor[employer.status] || 'var(--c-text-2)',
              background: statusBg[employer.status] || 'var(--c-surface-3)',
              padding: '2px 10px', borderRadius: '20px',
            }}>
              {employer.status.charAt(0).toUpperCase() + employer.status.slice(1)}
            </span>
          )}
        </div>
      </div>

      {employer ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Field label="Industry"         value={employer.industry} />
            <Field label="Website"          value={employer.website} />
            <Field label="Address"          value={employer.address} />
            <Field label="Application Date" value={employer.date} />
          </div>

          {employer.bio && (
            <>
              <SectionTitle>📄 Company Biography</SectionTitle>
              <p style={{ fontSize: '13px', color: 'var(--c-text-2)', lineHeight: '1.65', margin: 0 }}>{employer.bio}</p>
            </>
          )}

          {employer.docs?.length > 0 && (
            <>
              <SectionTitle>📎 Submitted Documents</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {employer.docs.map((d, idx) => {
                  const { name } = resolveDoc(d);
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'var(--c-surface-2)', border: '1px solid var(--c-border)',
                        borderRadius: '10px', padding: '10px 14px', gap: '12px',
                      }}
                    >
                      {/* File name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>📄</span>
                        <span style={{
                          fontSize: '13px', fontWeight: '500', color: 'var(--c-text)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {name}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          onClick={() => handleView(d)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: 'var(--c-surface)', border: '1px solid var(--c-border)',
                            borderRadius: '6px', padding: '5px 11px',
                            fontSize: '12px', fontWeight: '600', color: 'var(--c-primary)',
                            cursor: 'pointer', transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--c-surface-3)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--c-surface)'}
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => handleDownload(d)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: 'var(--c-primary)', border: '1px solid transparent',
                            borderRadius: '6px', padding: '5px 11px',
                            fontSize: '12px', fontWeight: '600', color: 'var(--c-surface)',
                            cursor: 'pointer', transition: 'opacity 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          ⬇ Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {viewingDoc && (
                <div style={{ marginTop: '20px' }}>
                  <SectionTitle>🔎 Preview: {viewingDoc.name}</SectionTitle>
                  <div style={{ border: '1px solid var(--c-border)', borderRadius: '14px', overflow: 'hidden', minHeight: '320px', background: 'var(--c-surface-3)' }}>
                    <iframe
                      title={viewingDoc.name}
                      src={viewingDoc.url}
                      style={{ width: '100%', height: '320px', border: 'none' }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--c-muted)', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>No detailed employer profile found.</p>
      )}
    </Modal>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UserManagement({
  highlightId = null,
  filter      = "All",
  searchQuery = "",
}) {
  const [users, setUsers]           = useState(USERS);
  const [roleFilter, setRoleFilter] = useState(filter || "All");
  const [search, setSearch]         = useState(searchQuery || "");
  const [showModal, setShowModal]   = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [form, setForm]   = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState("");

  useEffect(() => {
    if (filter)      setRoleFilter(filter);
    if (searchQuery) setSearch(searchQuery);
  }, [filter, searchQuery]);

  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`um-row-${highlightId}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("um__row--highlight");
      void el.offsetWidth;
      el.classList.add("um__row--highlight");
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightId, roleFilter]);

  const visible = users
    .filter(u => roleFilter === "All" || u.role === roleFilter)
    .filter(u => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

  const toggleActive = (id) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));

  const validate = () => {
    const e = {};
    if (!form.username.trim())           e.username = "Username is required";
    if (!form.email.trim())              e.email    = "Email is required";
    else if (!form.email.includes("@")) e.email    = "Enter a valid email";
    if (!form.password)                  e.password = "Password is required";
    else if (form.password.length < 6)  e.password = "Minimum 6 characters";
    if (form.password !== form.confirm)  e.confirm  = "Passwords do not match";
    return e;
  };

  const createAdmin = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const name = form.username;
    setUsers(prev => [...prev, { id: Date.now(), name, email: form.email, role: "Administrator", active: true, pic: null }]);
    setForm({ username: "", email: "", password: "", confirm: "" });
    setErrors({});
    setShowModal(false);
    setToast(`Admin account "${name}" created successfully.`);
    setTimeout(() => setToast(""), 4000);
  };

  const hasActiveSearch = search.trim().length > 0;
  const canViewDetails  = (role) => ["Student", "Course Instructor", "Employer"].includes(role);

  return (
    <div className="um">
      <div className="um__page">
        <h1 className="um__heading">User Management</h1>

        {toast && <div className="um__toast">✓ {toast}</div>}

        {/* Search bar */}
        <div style={{
          background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '12px',
          padding: '12px 16px', marginBottom: '16px',
          boxShadow: 'var(--sh-xs)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ color: 'var(--c-muted)', fontSize: '16px' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: 'var(--c-text)', background: 'transparent' }}
          />
          {hasActiveSearch && (
            <button onClick={() => setSearch("")} style={{
              background: 'var(--c-surface-3)', border: '1px solid var(--c-border)', borderRadius: '50%',
              width: '24px', height: '24px', cursor: 'pointer', fontSize: '11px', color: 'var(--c-text-2)',
            }}>✕</button>
          )}
        </div>

        <div className="um__topbar">
          <div className="um__filters">
            {ROLES.map((r) => {
              const count = r === "All" ? users.length : users.filter(u => u.role === r).length;
              return (
                <button
                  key={r}
                  className={"um__filter" + (roleFilter === r ? " um__filter--active" : "")}
                  onClick={() => setRoleFilter(r)}
                >
                  {r} ({count})
                </button>
              );
            })}
          </div>
          <button className="um__btn um__btn--primary" onClick={() => { setErrors({}); setShowModal(true); }}>
            + Create Admin
          </button>
        </div>

        <div className="um__card">
          <p className="um__card-title">
            {visible.length} {roleFilter !== "All" ? roleFilter : "Total"} User{visible.length !== 1 ? "s" : ""}
            {hasActiveSearch && ` matching "${search}"`}
          </p>
          <table className="um__table">
            <thead>
              <tr>
                <th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr
                  key={u.id}
                  id={`um-row-${u.id}`}
                  className={highlightId && u.id === Number(highlightId) ? "um__row--highlight" : ""}
                >
                  <td>
                    <div className="um__name-cell">
                      {u.pic
                        ? <img className="um__avatar um__avatar--img" src={u.pic} alt={u.name} />
                        : <div className="um__avatar">{u.name.charAt(0)}</div>
                      }
                      {u.name}
                    </div>
                  </td>
                  <td className="um__muted">{u.email}</td>
                  <td><span className={"um__badge um__badge--" + u.role.replace(/ /g, "-").toLowerCase()}>{u.role}</span></td>
                  <td><span className={"um__badge um__badge--" + (u.active ? "active" : "inactive")}>{u.active ? "Active" : "Inactive"}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {canViewDetails(u.role) && (
                        <button className="um__btn um__btn--ghost" onClick={() => setDetailUser(u)}>
                          View Details
                        </button>
                      )}
                      <button
                        className={"um__btn " + (u.active ? "um__btn--danger" : "um__btn--success")}
                        onClick={() => toggleActive(u.id)}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--c-muted)' }}>
                    No users found{hasActiveSearch ? ` matching "${search}"` : ""}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modals */}
      {detailUser?.role === "Student"           && <StudentDetail    user={detailUser} onClose={() => setDetailUser(null)} />}
      {detailUser?.role === "Course Instructor" && <InstructorDetail user={detailUser} onClose={() => setDetailUser(null)} />}
      {detailUser?.role === "Employer"          && <EmployerDetail   user={detailUser} onClose={() => setDetailUser(null)} />}

      {/* Create Admin modal */}
      {showModal && (
        <div className="um__overlay" onClick={() => setShowModal(false)}>
          <div className="um__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="um__modal-title">Create Administrator Account</h2>
            <p className="um__modal-note">Only existing admins can create new administrator accounts.</p>

            {[
              { key: "username", label: "Username",         type: "text",     ph: "e.g. admin_sara"   },
              { key: "email",    label: "Email",            type: "email",    ph: "admin@guc.edu.eg"  },
              { key: "password", label: "Password",         type: "password", ph: "Min. 6 characters" },
              { key: "confirm",  label: "Confirm Password", type: "password", ph: "Re-enter password" },
            ].map((f) => (
              <div className="um__form-row" key={f.key}>
                <label className="um__label">{f.label}</label>
                <input
                  type={f.type} placeholder={f.ph} value={form[f.key]}
                  className={"um__input" + (errors[f.key] ? " um__input--error" : "")}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
                {errors[f.key] && <p className="um__error">{errors[f.key]}</p>}
              </div>
            ))}

            <div className="um__modal-actions">
              <button className="um__btn um__btn--primary um__btn--lg" onClick={createAdmin}>Create Account</button>
              <button className="um__btn um__btn--ghost   um__btn--lg" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}