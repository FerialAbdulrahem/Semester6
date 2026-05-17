import { useState } from "react";
import "./styles/favorite.css";

export default function FavoritesPage() {

  // ================= HARD CODED DATA =================
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Mariam Boulos",
      email: "mariam@guc.edu.eg",
      major: "Computer Engineering",
      description: "Frontend developer interested in UI/UX and embedded systems."
    },
    {
      id: 2,
      name: "Omar Khaled",
      email: "omar@guc.edu.eg",
      major: "Computer Science",
      description: "Machine learning enthusiast with backend experience."
    }
  ]);

  const [projects, setProjects] = useState([
    {
      id: 101,
      title: "Smart Parking System",
      course: "Digital System Design",
      date: "2026-03-15",
      description: "FPGA-based smart parking system using sensors and VHDL."
    },
    {
      id: 102,
      title: "AI Chatbot",
      course: "Artificial Intelligence",
      date: "2026-04-02",
      description: "NLP chatbot trained using machine learning models."
    }
  ]);

  // ================= REMOVE FUNCTIONS =================
  const removeStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const removeProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="favorites-page">

      {/* ================= HEADER ================= */}
      <div className="favorites-hero">
        <div>
          <h1>Favorites</h1>
          <p>Saved portfolios and projects</p>
        </div>

        <div className="favorites-stats">
          <div className="stat-card">
            <span className="stat-number">{students.length}</span>
            <span className="stat-label">Portfolios</span>
          </div>

          <div className="stat-card">
            <span className="stat-number">{projects.length}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>
      </div>

      {/* ================= PORTFOLIOS ================= */}
      <section className="favorites-section">
        <div className="section-header">
          <h2>Portfolios</h2>
        </div>

        <div className="favorites-grid">
          {students.map((s) => (
            <div key={s.id} className="favorite-card">

              <div className="favorite-top">
                <div className="favorite-avatar">
                  {s.name.charAt(0)}
                </div>

                {/* ALWAYS REMOVE BUTTON */}
                <button
                  className="favorite-heart active"
                  onClick={() => removeStudent(s.id)}
                >
                  ✕
                </button>
              </div>

              <h3>{s.name}</h3>

              <div className="favorite-meta">
                <span>{s.email}</span>
                <span>{s.major}</span>
              </div>

              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PROJECTS ================= */}
      <section className="favorites-section">
        <div className="section-header">
          <h2>Projects</h2>
        </div>

        <div className="favorites-grid">
          {projects.map((p) => (
            <div key={p.id} className="favorite-card">

              <div className="favorite-top">
                <div className="project-icon">📁</div>

                {/* ALWAYS REMOVE BUTTON */}
                <button
                  className="favorite-heart active"
                  onClick={() => removeProject(p.id)}
                >
                  ✕
                </button>
              </div>

              <h3>{p.title}</h3>

              <div className="favorite-meta">
                <span>{p.course}</span>
                <span>{p.date}</span>
              </div>

              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}