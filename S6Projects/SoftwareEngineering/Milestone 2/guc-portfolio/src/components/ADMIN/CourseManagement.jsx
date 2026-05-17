import { useState, useEffect } from "react";
import { COURSES, LINK_REQUESTS, USERS } from '../../data/DummyData.js';
import CourseSearch from '../SEARCH/InstructorSearch';
import '../styles/CourseManagement.css';

// Pulse-highlight keyframe injected once
const HIGHLIGHT_STYLE_ID = "cm-row-highlight-style";
if (!document.getElementById(HIGHLIGHT_STYLE_ID)) {
  const s = document.createElement("style");
  s.id = HIGHLIGHT_STYLE_ID;
  s.textContent = `
    @keyframes cmRowPulse {
      0%   { background-color: #fef08a; }
      70%  { background-color: #fef08a; }
      100% { background-color: transparent; }
    }
    tr.cm__row--highlight {
      animation: cmRowPulse 2s ease-out forwards;
    }
  `;
  document.head.appendChild(s);
}

export default function CourseManagement({ highlightId = null }) {
  const [courses, setCourses]           = useState(COURSES);
  const [requests, setRequests]         = useState(LINK_REQUESTS);
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState({ name: "", code: "" });
  const [errors, setErrors]             = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast]               = useState("");
  const [hasActiveSearch, setHasActiveSearch] = useState(false);
  const [searchTerm, setSearchTerm]     = useState("");

  // ── Scroll-to + highlight the target row ──────────────────────────────
  useEffect(() => {
    if (!highlightId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`cm-row-${highlightId}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("cm__row--highlight");
      void el.offsetWidth; // reflow
      el.classList.add("cm__row--highlight");
    }, 100);
    return () => clearTimeout(timer);
  }, [highlightId]);

  // ── Helpers ────────────────────────────────────────────────────────────
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const openCreate = () => { setEditTarget(null); setForm({ name: "", code: "" }); setErrors({}); setShowModal(true); };
  const openEdit   = (c) => { setEditTarget(c);   setForm({ name: c.name, code: c.code }); setErrors({}); setShowModal(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Course name is required";
    if (!form.code.trim()) e.code = "Course code is required";
    return e;
  };

  const saveCourse = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (editTarget) {
      setCourses((prev) => prev.map((c) => c.id === editTarget.id ? { ...c, name: form.name, code: form.code } : c));
      showToast(`"${form.name}" updated.`);
    } else {
      setCourses((prev) => [...prev, { id: Date.now(), name: form.name, code: form.code, instructorId: null }]);
      showToast(`Course "${form.name}" created.`);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const deleteCourse = (id) => {
    const c = courses.find((x) => x.id === id);
    setCourses((prev) => prev.filter((x) => x.id !== id));
    setDeleteConfirm(null);
    showToast(`"${c.name}" deleted.`);
  };

  const resolveRequest = (id, decision) => {
    const request = requests.find(r => r.id === id);

    if (decision === "accepted") {
      const courseToUpdate = courses.find(c => c.name === request.course);

      if (courseToUpdate) {
        const instructor = USERS.find(u =>
          u.name === request.instructor &&
          (u.role === "Course Instructor" || u.role === "Instructor")
        );

        if (instructor) {
          if (request.type === "link") {
            if (courseToUpdate.instructorId && courseToUpdate.instructorId !== instructor.id) {
              const currentInstructor = USERS.find(u => u.id === courseToUpdate.instructorId);
              showToast(`⚠️ ${request.course} is already assigned to ${currentInstructor?.name}. Unlink first to change instructor.`);
              setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
              return;
            }
            setCourses(prev => prev.map(c =>
              c.id === courseToUpdate.id ? { ...c, instructorId: instructor.id } : c
            ));
            showToast(`✅ ${request.instructor} has been linked to ${request.course}`);
          } else if (request.type === "unlink") {
            if (courseToUpdate.instructorId !== instructor.id) {
              showToast(`⚠️ ${request.instructor} is not the assigned instructor for ${request.course}`);
              setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
              return;
            }
            setCourses(prev => prev.map(c =>
              c.id === courseToUpdate.id ? { ...c, instructorId: null } : c
            ));
            showToast(`🔓 ${request.instructor} has been unlinked from ${request.course}`);
          }
        } else {
          showToast(`❌ Instructor ${request.instructor} not found`);
          setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
          return;
        }
      } else {
        showToast(`❌ Course ${request.course} not found`);
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" } : r));
        return;
      }
    }

    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: decision } : r));
    if (decision === "rejected") showToast(`❌ Request ${decision}.`);
  };

  const handleSearchResults = (results, term) => {
    setSearchTerm(term);
    setHasActiveSearch(results.length > 0 && term !== "");
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const getInstructorName = (instructorId) => {
    if (!instructorId) return "Not assigned";
    const instructor = USERS.find(u => u.id === instructorId);
    return instructor ? instructor.name : "Not assigned";
  };

  const displayedCourses = hasActiveSearch
    ? courses.filter(course => {
        const q = searchTerm.toLowerCase();
        if (course.name.toLowerCase().includes(q))               return true;
        if (course.code.toLowerCase().includes(q))               return true;
        if (getInstructorName(course.instructorId).toLowerCase().includes(q)) return true;
        return false;
      })
    : courses;

  // Row class helper
  const rowClass = (id) =>
    highlightId && id === Number(highlightId) ? "cm__row--highlight" : "";

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="cm">
      <div className="cm__page">
        <h1 className="cm__heading">Course Management</h1>

        {toast && <div className="cm__toast" >✓ {toast}</div>}

        <CourseSearch
          courses={courses}
          users={USERS}
          onSearchResults={handleSearchResults}
        />

        {pendingCount > 0 && (
          <div className="cm__notif">
            🔔 {pendingCount} pending link/unlink request{pendingCount > 1 ? "s" : ""} from course instructors.
          </div>
        )}

        {/* ── Courses Table ── */}
        <div className="cm__card">
          <div className="cm__card-header">
            <h3 className="cm__subheading">Courses</h3>
            <button className="cm__btn cm__btn--primary" onClick={openCreate}>+ Add Course</button>
          </div>

          {hasActiveSearch && (
            <div className="cm__search-info">
              Showing {displayedCourses.length} of {courses.length} courses
            </div>
          )}

          <table className="cm__table">
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Course Code</th>
                <th>Instructor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedCourses.map((course) => (
                <tr
                  key={course.id}
                  id={`cm-row-${course.id}`}
                  className={rowClass(course.id)}
                >
                  <td><strong>{course.name}</strong></td>
                  <td><code className="cm__code">{course.code}</code></td>
                  <td>{getInstructorName(course.instructorId)}</td>
                  <td>
                    <div className="cm__actions">
                      <button className="cm__btn cm__btn--ghost"  onClick={() => openEdit(course)}>Edit</button>
                      <button className="cm__btn cm__btn--danger" onClick={() => setDeleteConfirm(course)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedCourses.length === 0 && (
                <tr>
                  <td colSpan="4" className="cm__empty">
                    {hasActiveSearch ? "No courses match your search." : "No courses yet. Click 'Add Course' to create one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Link/Unlink Requests Table ── */}
        <div className="cm__card">
          <h3 className="cm__subheading">Link/Unlink Requests</h3>
          <table className="cm__table">
            <thead>
              <tr>
                <th>Instructor</th><th>Course</th><th>Request</th>
                <th>Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.instructor}</strong></td>
                  <td>{r.course}</td>
                  <td>
                    <span className={"cm__badge cm__badge--" + r.type}>
                      {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                    </span>
                  </td>
                  <td className="cm__muted">{r.date}</td>
                  <td>
                    <span className={"cm__badge cm__badge--" + r.status}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {r.status === "pending" ? (
                      <div className="cm__actions">
                        <button className="cm__btn cm__btn--success" onClick={() => resolveRequest(r.id, "accepted")}>Accept</button>
                        <button className="cm__btn cm__btn--danger"  onClick={() => resolveRequest(r.id, "rejected")}>Reject</button>
                      </div>
                    ) : (
                      <span className="cm__muted">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="cm__overlay" onClick={() => setShowModal(false)}>
          <div className="cm__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="cm__modal-title">{editTarget ? "Edit Course" : "Create New Course"}</h2>
            <div className="cm__form-row">
              <label className="cm__label">Course Name</label>
              <input
                className={"cm__input" + (errors.name ? " cm__input--error" : "")}
                placeholder="e.g. Software Engineering"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="cm__error">{errors.name}</p>}
            </div>
            <div className="cm__form-row">
              <label className="cm__label">Course Code</label>
              <input
                className={"cm__input" + (errors.code ? " cm__input--error" : "")}
                placeholder="e.g. CSEN701"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              {errors.code && <p className="cm__error">{errors.code}</p>}
            </div>
            <div className="cm__modal-actions">
              <button className="cm__btn cm__btn--primary cm__btn--lg" onClick={saveCourse}>
                {editTarget ? "Save Changes" : "Create Course"}
              </button>
              <button className="cm__btn cm__btn--ghost cm__btn--lg" onClick={() => { setShowModal(false); setEditTarget(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="cm__overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="cm__modal cm__modal--sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="cm__modal-title">Delete Course</h2>
            <p className="cm__modal-body">
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This cannot be undone.
            </p>
            <div className="cm__modal-actions">
              <button className="cm__btn cm__btn--danger cm__btn--lg" onClick={() => deleteCourse(deleteConfirm.id)}>Yes, Delete</button>
              <button className="cm__btn cm__btn--ghost  cm__btn--lg" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}