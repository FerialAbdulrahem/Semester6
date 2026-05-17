import { useState, useRef, useEffect } from "react";
import '../styles/register.css';

/* ── Falling Stars Canvas (same as LoginPage) ────────────────────────────────── */
const StarsBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const NUM_STARS   = 120;
    const NUM_FALLING = 6;

    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));

    const createFalling = () => ({
      x: Math.random() * canvas.width * 1.4 - canvas.width * 0.2,
      y: -20,
      len: Math.random() * 100 + 60,
      speed: Math.random() * 5 + 4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      alpha: 0,
      phase: 'fadein',
      opacity: 0,
      trail: [],
    });

    let falling = Array.from({ length: NUM_FALLING }, () => {
      const f = createFalling();
      f.y = Math.random() * canvas.height * 0.5;
      f.x = Math.random() * canvas.width;
      return f;
    });

    let animId;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.016;

      stars.forEach(s => {
        s.alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
        ctx.save();
        ctx.globalAlpha = s.alpha * 0.8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#f1f5f9';
        ctx.fill();
        ctx.restore();
      });

      falling.forEach((f, i) => {
        f.x += Math.cos(f.angle) * f.speed;
        f.y += Math.sin(f.angle) * f.speed;

        if (f.phase === 'fadein') {
          f.opacity = Math.min(1, f.opacity + 0.06);
          if (f.opacity >= 1) f.phase = 'fall';
        } else if (f.phase === 'fall') {
          if (f.y > canvas.height * 0.7 || f.x > canvas.width * 1.1) {
            f.phase = 'fadeout';
          }
        } else {
          f.opacity = Math.max(0, f.opacity - 0.04);
          if (f.opacity <= 0) {
            falling[i] = createFalling();
            return;
          }
        }

        const tailX = f.x - Math.cos(f.angle) * f.len;
        const tailY = f.y - Math.sin(f.angle) * f.len;

        const grad = ctx.createLinearGradient(tailX, tailY, f.x, f.y);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.7, `rgba(147,197,253,${f.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(255,255,255,${f.opacity})`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.globalAlpha = f.opacity;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(f.x, f.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default function Register({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    companyEmail: "",
    password: "",
    confirmPassword: ""
  });

  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (e.target.name === "confirmPassword" || e.target.name === "password") {
      setPasswordError("");
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const pdfFiles = files.filter(file => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      alert("Please upload PDF files only");
      return;
    }

    const newDocuments = pdfFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      file: file,
      uploadDate: new Date().toISOString().split("T")[0]
    }));

    setDocuments([...documents, ...newDocuments]);
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setUploading(true);

    console.log("Company Registered:", formData);
    console.log("Documents uploaded:", documents);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setUploading(false);
    alert("Company registered successfully!");

    onSuccess?.();
    onBack?.();
  };

  return (
    <div className="register-wrapper" style={{ background: 'linear-gradient(135deg, #0b0f1a 0%, #0f172a 50%, #0b0f1a 100%)' }}>
      <StarsBackground />

      <div className="register-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="register-header">
          <h2>Create Company Account</h2>
          <p>Register your company to start posting internships</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Personal and Company Info */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Email *</label>
              <input
                type="email"
                name="companyEmail"
                placeholder="contact@company.com"
                value={formData.companyEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Security */}
          <div className="form-section">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {passwordError && (
              <div className="error-message">{passwordError}</div>
            )}
          </div>

          {/* Documents */}
          <div className="form-section">
            <label>Company Documents</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                id="pdf-upload"
                className="file-input"
              />
              <label htmlFor="pdf-upload" className="file-upload-label">
                📄 Choose PDF Files
              </label>
            </div>

            {documents.length > 0 && (
              <div className="uploaded-docs">
                {documents.map(doc => (
                  <div key={doc.id} className="doc-item">
                    <span className="doc-name">📄 {doc.name}</span>
                    <span className="doc-size">{doc.size}</span>
                    <button
                      type="button"
                      className="remove-doc"
                      onClick={() => removeDocument(doc.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onBack}>
              ← Back
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? "Creating..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}