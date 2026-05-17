import { useState, useEffect, useRef } from "react";
import { PROJECTS, APPEALS, COURSES, USERS } from '../../data/DummyData.js';
import ProjectSearchFilterSort from '../SEARCH/ProjectSearch';
import "../styles/ProjectManagement.css";

const FLAG_REASONS = [
  "Plagiarism: code copied without attribution",
  "Academic dishonesty: work submitted by another student",
  "AI-generated content without disclosure",
  "Copyright violation: unlicensed third-party content",
  "Data fabrication or manipulation",
  "Other (specify below)",
];

// Pulse-highlight keyframe injected once
const HIGHLIGHT_STYLE_ID = "pm-row-highlight-style";
if (!document.getElementById(HIGHLIGHT_STYLE_ID)) {
  const s = document.createElement("style");
  s.id = HIGHLIGHT_STYLE_ID;
  s.textContent = `
    @keyframes pmRowPulse {
      0%   { background-color: rgba(59, 130, 246, 0.3); }
      70%  { background-color: rgba(59, 130, 246, 0.3); }
      100% { background-color: transparent; }
    }
    tr.pm__row--highlight td {
      animation: pmRowPulse 2s ease-out forwards;
    }
  `;
  document.head.appendChild(s);
}

export default function ProjectManagement({
  initialTab = "all",
  highlightId = null,
  initialSearchQuery = "",
}) {
  const [projects, setProjects]               = useState(PROJECTS);
  const [appeals, setAppeals]                 = useState(APPEALS);
  const [tab, setTab]                         = useState(initialTab);
  const [appealDetail, setAppealDetail]       = useState(null);
  const [flagModal, setFlagModal]             = useState(null);
  const [confirmUnflag, setConfirmUnflag]     = useState(null);
  const [toast, setToast]                     = useState("");
  const [filteredProjects, setFilteredProjects] = useState(PROJECTS);
  const [projectDetails, setProjectDetails]   = useState(null);

  const highlightedRowRef = useRef(null);

  // ── Scroll-to + highlight the target row ────────────────────────────────
  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`pm-row-${highlightId}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("pm__row--highlight");
      void el.offsetWidth;
      el.classList.add("pm__row--highlight");
      highlightedRowRef.current = el;
    }, 150);
    return () => clearTimeout(timer);
  }, [highlightId, tab]);

  // ── Course → Instructor helpers ─────────────────────────────────────────
  const courseToInstructorMap = new Map();
  COURSES.forEach(course => {
    if (course.name && course.instructorName) {
      courseToInstructorMap.set(course.name, course.instructorName);
    }
  });

  const getInstructorForProject = (courseName, studentName = null) => {
    if (courseName === "Bachelor Project") {
      if (studentName === "Omar Fares")  return "Dr. Aya Salama";
      if (studentName === "Kamal Nabil") return "Dr. Omar";
    }
    return courseToInstructorMap.get(courseName) || "Not assigned";
  };

  const flaggedProjects = filteredProjects.filter((p) => p.flagged);
  const pendingCount    = appeals.filter((a) => a.status === "pending").length;

  const TABS = [
    { key: "flagged", label: "Flagged Projects",  count: flaggedProjects.length },
    { key: "appeals", label: "Student Appeals",    count: pendingCount },
    { key: "all",     label: "All Projects",       count: filteredProjects.length },
  ];

  // ── Toast ────────────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // ── Project actions ──────────────────────────────────────────────────────
  const toggleProject = (id) => {
    const p = projects.find((x) => x.id === id);
    if (!p.active && p.flagged) {
      showToast(`"${p.title}" cannot be activated while flagged. Unflag it first.`);
      return;
    }
    setProjects((prev) =>
      prev.map((x) => (x.id === id ? { ...x, active: !x.active } : x))
    );
    showToast(`"${p.title}" ${p.active ? "deactivated" : "activated"}.`);
  };

  const openFlagModal = (project) => setFlagModal({ project, reason: "", custom: "" });

  const submitFlag = () => {
    if (!flagModal) return;
    const { project, reason, custom } = flagModal;
    const finalReason = reason === FLAG_REASONS[5] ? custom.trim() || "Other" : reason;
    if (!finalReason) return;

    const hasPendingAppeal = appeals.some(
      (a) => a.project === project.title && a.status === "pending"
    );

    setProjects((prev) =>
      prev.map((x) =>
        x.id === project.id
          ? { ...x, flagged: true, flagReason: finalReason, active: hasPendingAppeal ? x.active : false }
          : x
      )
    );
    setFlagModal(null);
    showToast(
      hasPendingAppeal
        ? `"${project.title}" flagged. Kept active — pending appeal exists.`
        : `"${project.title}" flagged and deactivated.`
    );
  };

  const unflagProject = (id) => {
    const p = projects.find((x) => x.id === id);
    const hasPendingAppeal = appeals.some(
      (a) => a.project === p.title && a.status === "pending"
    );
    if (!hasPendingAppeal) { setConfirmUnflag(p); return; }
    doUnflag(id);
  };

  const doUnflag = (id) => {
    const p = projects.find((x) => x.id === id);
    setProjects((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, flagged: false, flagReason: null, active: true } : x
      )
    );
    setConfirmUnflag(null);
    showToast(`"${p.title}" unflagged and reactivated.`);
  };

  const markReviewed = (id) => {
    setAppeals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "reviewed" } : a))
    );
    setAppealDetail(null);
    showToast("Appeal marked as reviewed.");
  };

  const unflagFromAppeal = (appeal) => {
    setAppeals((prev) =>
      prev.map((a) => (a.id === appeal.id ? { ...a, status: "reviewed" } : a))
    );
    setProjects((prev) =>
      prev.map((x) =>
        x.title === appeal.project
          ? { ...x, flagged: false, flagReason: null, active: true }
          : x
      )
    );
    setAppealDetail(null);
    showToast(`Appeal accepted — "${appeal.project}" unflagged and reactivated.`);
  };

  const flagModalHasPendingAppeal =
    flagModal &&
    appeals.some((a) => a.project === flagModal.project.title && a.status === "pending");

  const flagReasonIsOther  = flagModal?.reason === FLAG_REASONS[5];
  const flagSubmitDisabled =
    !flagModal?.reason || (flagReasonIsOther && !flagModal?.custom?.trim());

  // ── Formatters ───────────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const renderStars = (rating) => {
if (!rating || rating === 0) return <span className="pm__btn- pm_btn--ghost">No rating</span>;    const fullStars  = Math.floor(rating);
    const halfStar   = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <span style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {[...Array(fullStars)].map((_, i)  => <span key={`f${i}`} style={{ color: "#fbbf24", fontSize: "14px" }}>★</span>)}
        {halfStar && <span style={{ color: "#fbbf24", fontSize: "14px" }}>½</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={`e${i}`} style={{ color: "#d1d5db", fontSize: "14px" }}>★</span>)}
        <span style={{ marginLeft: "4px", fontSize: "11px", color: "#64748b" }}>({rating})</span>
      </span>
    );
  };

  const getStudentDetails = (studentName) =>
    USERS.find(u => u.name === studentName && u.role === "Student") ||
    { name: studentName, email: "N/A", active: false };

  const getAppealForProject = (projectTitle) =>
    appeals.find(a => a.project === projectTitle);

  // ── Row class helper ─────────────────────────────────────────────────────
  const rowClass = (id) =>
    highlightId && id === Number(highlightId) ? "pm__row--highlight" : "";

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="pm">
      <div className="pm__page">
        <h1 className="pm__heading">Project Management</h1>

        {toast && <div className="pm__toast">✓ {toast}</div>}

        <div className="pm__tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={"pm__tab" + (tab === t.key ? " pm__tab--active" : "")}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count > 0 && <span className="pm__tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* ── Search / Filter bar — hidden on Appeals tab ── */}
        {tab !== "appeals" && (
          <ProjectSearchFilterSort
            projects={projects}
            courses={COURSES}
            users={USERS}
            onFilteredProjectsChange={setFilteredProjects}
            showActiveFilters={true}
            initialSearchQuery={initialSearchQuery}
          />
        )}

        {/* ── Flagged Projects Tab ── */}
        {tab === "flagged" && (
          <div className="pm__card">
            <p className="pm__card-title">Flagged Projects</p>
            {flaggedProjects.length === 0 && (
              <p className="pm__empty">No flagged projects at the moment.</p>
            )}
            {flaggedProjects.length > 0 && (
              <table className="pm__table">
                <thead>
                  <tr>
                    <th>Title</th><th>Student</th><th>Course</th><th>Instructor</th>
                    <th>Created Date</th><th>Rating</th><th>Flag Reason</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedProjects.map((p) => (
                    <tr key={p.id} id={`pm-row-${p.id}`} className={rowClass(p.id)}>
                      <td><strong>{p.title}</strong></td>
                      <td>{p.student}</td>
                      <td>{p.course}</td>
                      <td>{getInstructorForProject(p.course, p.student)}</td>
                      <td className="pm__muted">{formatDate(p.createdAt)}</td>
                      <td>{renderStars(p.rating)}</td>
                      <td className="pm__reason">{p.flagReason}</td>
                      <td>
                        <span className={"pm__badge pm__badge--" + (p.active ? "active" : "inactive")}>
                          {p.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="pm__actions">
                        <button className="pm__btn pm__btn--ghost" onClick={() => setProjectDetails(p)}>
                          View Details
                        </button>
                        {appeals.some((a) => a.project === p.title && a.status === "pending") ? (
                          <button className="pm__btn pm__btn--appeal"
                            onClick={() => setAppealDetail(appeals.find((a) => a.project === p.title && a.status === "pending"))}>
                            View Appeal
                          </button>
                        ) : (
                          <button className="pm__btn pm__btn--ghost" onClick={() => unflagProject(p.id)}>
                            Unflag
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Student Appeals Tab ── */}
        {tab === "appeals" && (
          <div className="pm__card">
            <p className="pm__card-title">Student Appeals</p>
            <table className="pm__table">
              <thead>
                <tr>
                  <th>Student</th><th>Project</th><th>Course</th><th>Instructor</th>
                  <th>Date</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appeals.map((a) => {
                  const project = projects.find(p => p.title === a.project);
                  return (
                    <tr key={a.id}>
                      <td><strong>{a.student}</strong></td>
                      <td>{a.project}</td>
                      <td>{project?.course || "N/A"}</td>
                      <td>{project ? getInstructorForProject(project.course, project.student) : "N/A"}</td>
                      <td className="pm__muted">{a.date}</td>
                      <td>
                        <span className={"pm__badge pm__badge--" + a.status}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button className="pm__btn pm__btn--ghost" onClick={() => setAppealDetail(a)}>
                          View Message
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── All Projects Tab ── */}
        {tab === "all" && (
          <div className="pm__card">
            <p className="pm__card-title">All Projects</p>
            {filteredProjects.length === 0 && (
              <p className="pm__empty">No projects match the current filters.</p>
            )}
            {filteredProjects.length > 0 && (
              <table className="pm__table">
                <thead>
                  <tr>
                    <th>Title</th><th>Student</th><th>Course</th><th>Instructor</th>
                    <th>Created Date</th><th>Rating</th><th>Flagged</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr key={p.id} id={`pm-row-${p.id}`} className={rowClass(p.id)}>
                      <td><strong>{p.title}</strong></td>
                      <td>{p.student}</td>
                      <td>{p.course}</td>
                      <td>{getInstructorForProject(p.course, p.student)}</td>
                      <td className="pm__muted">{formatDate(p.createdAt)}</td>
                      <td>{renderStars(p.rating)}</td>
                      <td>
                        {p.flagged
                          ? <span className="pm__badge pm__badge--flagged">⚑ Flagged</span>
                          : <span className="pm__muted">—</span>}
                      </td>
                      <td>
                        <span className={"pm__badge pm__badge--" + (p.active ? "active" : "inactive")}>
                          {p.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="pm__actions">
                        <button className="pm__btn pm__btn--primary" onClick={() => setProjectDetails(p)}>
                          View Details
                        </button>
                        {!p.flagged ? (
                          <button className="pm__btn pm__btn--warning" onClick={() => openFlagModal(p)}>Flag</button>
                        ) : appeals.some((a) => a.project === p.title && a.status === "pending") ? (
                          <button className="pm__btn pm__btn--appeal"
                            onClick={() => setAppealDetail(appeals.find((a) => a.project === p.title && a.status === "pending"))}>
                            View Appeal
                          </button>
                        ) : (
                          <button className="pm__btn pm__btn--ghost" onClick={() => unflagProject(p.id)}>Unflag</button>
                        )}
                        {!p.flagged && (
                          <button
                            className={"pm__btn " + (p.active ? "pm__btn--danger" : "pm__btn--success")}
                            onClick={() => toggleProject(p.id)}
                          >
                            {p.active ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ── Project Details Modal ── */}
      {projectDetails && (
        <div className="pm__overlay" onClick={() => setProjectDetails(null)}>
          <div className="pm__modal pm__modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="pm__modal-header">
              <h2 className="pm__modal-title">📋 Project Details</h2>
              <button className="pm__modal-close" onClick={() => setProjectDetails(null)}>✕</button>
            </div>
            <div className="pm__details-grid">
              <div className="pm__details-section">
                <h3 className="pm__details-section-title">📌 Basic Information</h3>
                <div className="pm__details-row"><span className="pm__details-label">Project Title:</span><span className="pm__details-value">{projectDetails.title}</span></div>
                <div className="pm__details-row"><span className="pm__details-label">Course:</span><span className="pm__details-value">{projectDetails.course}</span></div>
                <div className="pm__details-row"><span className="pm__details-label">Instructor:</span><span className="pm__details-value">{getInstructorForProject(projectDetails.course, projectDetails.student)}</span></div>
                <div className="pm__details-row"><span className="pm__details-label">Created Date:</span><span className="pm__details-value">{formatDate(projectDetails.createdAt)}</span></div>
                <div className="pm__details-row">
                  <span className="pm__details-label">Visibility:</span>
                  <span className={`pm__badge pm__badge--${projectDetails.visibility === "public" ? "active" : "warning"}`}>{projectDetails.visibility || "public"}</span>
                </div>
                <div className="pm__details-row"><span className="pm__details-label">Portfolio Visible:</span><span className="pm__details-value">{projectDetails.isVisibleOnPortfolio ? "✅ Yes" : "❌ No"}</span></div>
                <div className="pm__details-row">
                  <span className="pm__details-label">Status:</span>
                  <span className={`pm__badge pm__badge--${projectDetails.active ? "active" : "inactive"}`}>{projectDetails.active ? "Active" : "Inactive"}</span>
                </div>
              </div>
              <div className="pm__details-section">
                <h3 className="pm__details-section-title">👨‍🎓 Student Information</h3>
                <div className="pm__details-row"><span className="pm__details-label">Student Name:</span><span className="pm__details-value">{projectDetails.student}</span></div>
                <div className="pm__details-row"><span className="pm__details-label">Student Email:</span><span className="pm__details-value">{getStudentDetails(projectDetails.student).email}</span></div>
                <div className="pm__details-row">
                  <span className="pm__details-label">Student Status:</span>
                  <span className={`pm__badge pm__badge--${getStudentDetails(projectDetails.student).active ? "active" : "inactive"}`}>
                    {getStudentDetails(projectDetails.student).active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="pm__details-section">
                <h3 className="pm__details-section-title">⭐ Rating & Flag Information</h3>
                <div className="pm__details-row"><span className="pm__details-label">Rating:</span><span className="pm__details-value">{renderStars(projectDetails.rating)}</span></div>
                <div className="pm__details-row"><span className="pm__details-label">Score:</span><span className="pm__details-value">{projectDetails.rating || 0}/5</span></div>
                <div className="pm__details-row">
                  <span className="pm__details-label">Flagged:</span>
                  <span className="pm__details-value">
                    {projectDetails.flagged ? <span className="pm__badge pm__badge--flagged">Yes</span> : <span className="pm__muted">No</span>}
                  </span>
                </div>
                {projectDetails.flagged && (
                  <>
                    <div className="pm__details-row"><span className="pm__details-label">Flag Reason:</span><span className="pm__details-value pm__reason">{projectDetails.flagReason}</span></div>
                    <div className="pm__details-row">
                      <span className="pm__details-label">Appeal Status:</span>
                      <span className="pm__details-value">
                        {getAppealForProject(projectDetails.title)
                          ? <span className={`pm__badge pm__badge--${getAppealForProject(projectDetails.title).status}`}>{getAppealForProject(projectDetails.title).status}</span>
                          : <span className="pm__muted">No appeal filed</span>}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="pm__details-section">
                <h3 className="pm__details-section-title">💻 Programming Languages</h3>
                <div className="pm__details-row">
                  <span className="pm__details-label">Languages Used:</span>
                  <span className="pm__details-value">
                    <div className="pm__tech-stack">
                      {projectDetails.programmingLanguages?.map((lang, idx) => (
                        <span key={idx} className="pm__tech-badge">{lang}</span>
                      ))}
                    </div>
                  </span>
                </div>
              </div>
            </div>
            <div className="pm__modal-actions">
              {projectDetails.githubLink && (
                <button className="pm__btn pm__btn--primary" onClick={() => window.open(projectDetails.githubLink, "_blank")}>📂 View on GitHub</button>
              )}
              {projectDetails.demoVideo && (
                <button className="pm__btn pm__btn--primary" onClick={() => window.open(projectDetails.demoVideo, "_blank")}>🎥 Watch Demo</button>
              )}
              {projectDetails.flagged ? (
                <>
                  {getAppealForProject(projectDetails.title)?.status === "pending" && (
                    <button className="pm__btn pm__btn--appeal" onClick={() => { setProjectDetails(null); setAppealDetail(getAppealForProject(projectDetails.title)); }}>View Appeal</button>
                  )}
                  <button className="pm__btn pm__btn--success" onClick={() => { unflagProject(projectDetails.id); setProjectDetails(null); }}>Unflag Project</button>
                </>
              ) : (
                <button className="pm__btn pm__btn--warning" onClick={() => { setProjectDetails(null); openFlagModal(projectDetails); }}>Flag Project</button>
              )}
              <button className="pm__btn pm__btn--ghost" onClick={() => setProjectDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Appeal Detail Modal (Fixed) ── */}
      {appealDetail && (
        <div className="pm__overlay" onClick={() => setAppealDetail(null)}>
          <div className="pm__modal pm__modal--appeal" onClick={(e) => e.stopPropagation()}>
            <div className="pm__modal-header">
              <h2 className="pm__modal-title">Appeal — {appealDetail.project}</h2>
              <button className="pm__modal-close" onClick={() => setAppealDetail(null)}>✕</button>
            </div>
            
            <div className="pm__modal-body">
              <div className="pm__appeal-detail">
                <div className="pm__appeal-field">
                  <span className="pm__appeal-label">STUDENT</span>
                  <div className="pm__appeal-value">{appealDetail.student}</div>
                </div>
                
                <div className="pm__appeal-field">
                  <span className="pm__appeal-label">DATE</span>
                  <div className="pm__appeal-value">{appealDetail.date}</div>
                </div>
                
                <div className="pm__appeal-field">
                  <span className="pm__appeal-label">STUDENT'S MESSAGE</span>
                  <div className="pm__appeal-message">
                    <p>{appealDetail.message}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pm__modal-actions">
              {appealDetail.status === "pending" && (() => {
                const relatedProject = projects.find((p) => p.title === appealDetail.project);
                return relatedProject?.flagged ? (
                  <>
                    <button className="pm__btn pm__btn--success pm__btn--lg" onClick={() => unflagFromAppeal(appealDetail)}>
                      ✓ Accept &amp; Unflag
                    </button>
                    <button className="pm__btn pm__btn--danger pm__btn--lg" onClick={() => markReviewed(appealDetail.id)}>
                      ✗ Reject &amp; Keep Flagged
                    </button>
                  </>
                ) : (
                  <button className="pm__btn pm__btn--primary pm__btn--lg" onClick={() => markReviewed(appealDetail.id)}>
                    Mark as Reviewed
                  </button>
                );
              })()}
              <button className="pm__btn pm__btn--ghost pm__btn--lg" onClick={() => setAppealDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Unflag Modal ── */}
      {confirmUnflag && (
        <div className="pm__overlay" onClick={() => setConfirmUnflag(null)}>
          <div className="pm__modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm__modal-header">
              <h2 className="pm__modal-title">No Appeal on Record</h2>
              <button className="pm__modal-close" onClick={() => setConfirmUnflag(null)}>✕</button>
            </div>
            <div className="pm__modal-body">
              <p className="pm__modal-subtitle"><strong>{confirmUnflag.title}</strong> — {confirmUnflag.student}</p>
              <div className="pm__message">
                This project has no student appeal submitted. Are you sure you want to unflag and reactivate it without reviewing an appeal?
              </div>
            </div>
            <div className="pm__modal-actions">
              <button className="pm__btn pm__btn--success pm__btn--lg" onClick={() => doUnflag(confirmUnflag.id)}>Yes, Unflag Anyway</button>
              <button className="pm__btn pm__btn--ghost pm__btn--lg" onClick={() => setConfirmUnflag(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Flag Project Modal ── */}
      {flagModal && (
        <div className="pm__overlay" onClick={() => setFlagModal(null)}>
          <div className="pm__modal" onClick={(e) => e.stopPropagation()}>
            <div className="pm__modal-header">
              <h2 className="pm__modal-title">Flag Project</h2>
              <button className="pm__modal-close" onClick={() => setFlagModal(null)}>✕</button>
            </div>
            <div className="pm__modal-body">
              <p className="pm__modal-subtitle"><strong>{flagModal.project.title}</strong> — {flagModal.project.student}</p>
              {flagModalHasPendingAppeal && (
                <div className="pm__info-bar">
                  ℹ A pending appeal exists for this project. It will remain active after flagging.
                </div>
              )}
              <div className="pm__field">
                <label className="pm__modal-label">Flag Reason</label>
                <select className="pm__select" value={flagModal.reason}
                  onChange={(e) => setFlagModal((prev) => ({ ...prev, reason: e.target.value, custom: "" }))}>
                  <option value="">Select a reason…</option>
                  {FLAG_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {flagReasonIsOther && (
                <div className="pm__field">
                  <label className="pm__modal-label">Custom Reason</label>
                  <textarea className="pm__textarea" placeholder="Describe the violation…"
                    value={flagModal.custom}
                    onChange={(e) => setFlagModal((prev) => ({ ...prev, custom: e.target.value }))} />
                </div>
              )}
            </div>
            <div className="pm__modal-actions">
              <button className="pm__btn pm__btn--danger pm__btn--lg" onClick={submitFlag} disabled={flagSubmitDisabled}>
                {flagModalHasPendingAppeal ? "Flag (keep active)" : "Flag and Deactivate"}
              </button>
              <button className="pm__btn pm__btn--ghost pm__btn--lg" onClick={() => setFlagModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}