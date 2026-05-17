import { useState } from "react";
import '../styles/EmployerApproval.css';
import { APPLYINGEMPLOYERS } from '../../data/DummyData.js';

const DOC_URLS = {
  "tax_certificate.pdf": "/tax_certificate.pdf",
  "trade_register.pdf":  "/trade_register.pdf",
  "company_reg.pdf":     "/company_reg.pdf",
  "company_profile.pdf": "/company_profile.pdf",
};

function getDocUrl(filename) {
  return DOC_URLS[filename] ?? `/${filename}`;
}

function handleDownload(filename) {
  const a = document.createElement("a");
  a.href = getDocUrl(filename);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function EmployerApprovals() {
  const [employers, setEmployers] = useState(APPLYINGEMPLOYERS);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("all");
  const [viewingDoc, setViewingDoc] = useState(null);

  const filtered =
    filter === "pending"  ? employers.filter((e) => e.status === "pending")  :
    filter === "accepted" ? employers.filter((e) => e.status === "accepted") :
    filter === "rejected" ? employers.filter((e) => e.status === "rejected") :
                            employers;

  const decide = (id, decision) => {
    setEmployers((prev) => prev.map((e) => e.id === id ? { ...e, status: decision } : e));
    setSelected((prev) => prev?.id === id ? { ...prev, status: decision } : prev);
  };

  const pendingCount = employers.filter((e) => e.status === "pending").length;

  return (
    <div className="ea">
      <div className="ea__page">
        <h1 className="ea__heading">Employer Applications</h1>

        {pendingCount > 0 && (
          <div className="ea__alert">
            ⚠ {pendingCount} application{pendingCount > 1 ? "s" : ""} awaiting review
          </div>
        )}

        <div className="ea__filters">
          {["all", "pending", "accepted", "rejected"].map((f) => {
            const count = f === "all" ? employers.length : employers.filter((e) => e.status === f).length;
            return (
              <button
                key={f}
                className={"ea__filter" + (filter === f ? " ea__filter--active" : "")}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        <div className="ea__card">
          <p className="ea__card-title">Employers Applying to Use the Platform</p>
          <table className="ea__table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Industry</th>
                <th>Email</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="ea__name-cell">
                      {e.pic ? (
                        <img
                          src={e.pic}
                          alt={e.company}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div className="ea__avatar">{e.company.charAt(0)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{e.company}</div>
                        <div className="ea__muted">{e.companyEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ea__muted">{e.industry}</td>
                  <td className="ea__muted">{e.companyEmail}</td>
                  <td className="ea__muted">{e.date}</td>
                  <td>
                    <span className={"ea__badge ea__badge--" + e.status}>
                      {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="ea__actions">
                      <button
                        className="ea__btn ea__btn--ghost"
                        onClick={() => { setSelected(e); setViewingDoc(null); }}
                      >
                        View Details
                      </button>
                      {e.status === "pending" && (
                        <>
                          <button className="ea__btn ea__btn--success" onClick={() => decide(e.id, "accepted")}>Accept</button>
                          <button className="ea__btn ea__btn--danger"  onClick={() => decide(e.id, "rejected")}>Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="ea__empty">No applications in this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="ea__overlay" onClick={() => { setSelected(null); setViewingDoc(null); }}>
          <div className="ea__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="ea__modal-title">Application Details</h2>

            <p className="ea__modal-section">🏢 Company Details</p>
            <div className="ea__modal-grid">
              <div className="ea__modal-highlight" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {selected.pic ? (
                  <img
                    src={selected.pic}
                    alt={selected.company}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div className="ea__avatar" style={{ width: 52, height: 52, fontSize: 22 }}>
                    {selected.company.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="ea__modal-label">Company Name</span>
                  <p className="ea__company-name">{selected.company}</p>
                </div>
              </div>
              <div className="ea__modal-highlight">
                <span className="ea__modal-label">Company Email</span>
                <p className="ea__company-email">{selected.companyEmail}</p>
              </div>
              <div><span className="ea__modal-label">Industry</span><p>{selected.industry}</p></div>
              <div><span className="ea__modal-label">Website</span><p>{selected.website}</p></div>
              <div><span className="ea__modal-label">Address</span><p>{selected.address}</p></div>
              <div><span className="ea__modal-label">Application Date</span><p>{selected.date}</p></div>
              <div>
                <span className="ea__modal-label">Status</span>
                <span className={"ea__badge ea__badge--" + selected.status}>
                  {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                </span>
              </div>
            </div>

            <p className="ea__modal-section">📝 Company Biography</p>
            <div className="ea__bio">
              <p className="ea__bio-text">
                {selected.bio || "No biography provided."}
              </p>
            </div>

            <p className="ea__modal-section">📄 Uploaded Documents</p>
            <div className="ea__docs">
              {selected.docs.map((doc) => (
                <div key={doc} className="ea__doc-row">
                  <span>📄 {doc}</span>
                  <div className="ea__actions">
                    <button
                      className={"ea__btn " + (viewingDoc?.filename === doc ? "ea__btn--primary" : "ea__btn--ghost")}
                      onClick={() =>
                        setViewingDoc(viewingDoc?.filename === doc
                          ? null
                          : { filename: doc, url: getDocUrl(doc) }
                        )
                      }
                    >
                      {viewingDoc?.filename === doc ? "Hide" : "View"}
                    </button>
                    <button
                      className="ea__btn ea__btn--primary"
                      onClick={() => handleDownload(doc)}
                    >
                      ⬇ Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {viewingDoc && (
              <div style={{ marginTop: 16 }}>
                <p className="ea__modal-section" style={{ marginBottom: 8 }}>
                  👁 Viewing: {viewingDoc.filename}
                </p>
                <iframe
                  src={viewingDoc.url}
                  title={viewingDoc.filename}
                  width="100%"
                  height="500px"
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    display: "block",
                  }}
                />
              </div>
            )}

            {selected.status === "pending" && (
              <div className="ea__modal-actions">
                <button className="ea__btn ea__btn--success ea__btn--lg" onClick={() => decide(selected.id, "accepted")}>
                  ✓ Accept
                </button>
                <button className="ea__btn ea__btn--danger ea__btn--lg" onClick={() => decide(selected.id, "rejected")}>
                  ✗ Reject
                </button>
              </div>
            )}
            {selected.status !== "pending" && (
              <p className="ea__muted" style={{ marginTop: 12 }}>This application has already been resolved.</p>
            )}

            <button
              className="ea__btn ea__btn--ghost"
              style={{ marginTop: 16 }}
              onClick={() => { setSelected(null); setViewingDoc(null); }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}