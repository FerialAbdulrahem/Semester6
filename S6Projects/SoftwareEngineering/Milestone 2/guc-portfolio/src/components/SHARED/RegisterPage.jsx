import React, { useState, useEffect, useRef } from 'react';
import { USERS } from '../../data/Data';
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

    // Static twinkling stars
    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.003,
      phase: Math.random() * Math.PI * 2,
    }));

    // Falling shooting stars
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

      // Draw static stars
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

      // Draw falling stars
      falling.forEach((f, i) => {
        // Update position
        f.x += Math.cos(f.angle) * f.speed;
        f.y += Math.sin(f.angle) * f.speed;

        // Fade in/out
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

        // Draw trail
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

        // Bright head dot
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

const Registerpage = ({ onBack, onRegisterSuccess, onCompanyRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const getRoleFromEmail = (email) => {
    if (email.endsWith('@student.guc.edu.eg')) return 'Student';
    if (email.endsWith('@guc.edu.eg')) return 'Course Instructor';
    return null;
  };

  const getRoleConfig = (email) => {
    const role = getRoleFromEmail(email);
    const configs = {
      'Student': { name: 'Student', icon: '🎓', key: 'student' },
      'Course Instructor': { name: 'Instructor', icon: '👨‍🏫', key: 'instructor' }
    };
    return configs[role];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password' || name === 'confirmPassword') setPasswordError('');
  };

  const validate = () => {
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName.trim()) { alert('First name is required'); return false; }
    if (firstName.trim().length < 2) { alert('First name must be at least 2 characters'); return false; }
    if (!lastName.trim()) { alert('Last name is required'); return false; }
    if (lastName.trim().length < 2) { alert('Last name must be at least 2 characters'); return false; }
    if (!email.trim()) { alert('Email is required'); return false; }

    const role = getRoleFromEmail(email);
    if (!role) { alert('Please use a valid GUC email (@student.guc.edu.eg or @guc.edu.eg)'); return false; }

    const validDomains = { 'Student': '@student.guc.edu.eg', 'Course Instructor': '@guc.edu.eg' };
    if (!email.endsWith(validDomains[role])) { alert(`Please use a valid ${role.toLowerCase()} email address`); return false; }

    if (USERS.find(u => u.email === email)) { alert('An account with this email already exists'); return false; }
    if (!password) { alert('Password is required'); return false; }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return false; }
    if (password !== confirmPassword) { setPasswordError('Passwords do not match'); return false; }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { firstName, lastName, email, password } = formData;
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const role = getRoleFromEmail(email);
      const roleConfig = getRoleConfig(email);

      const newUser = { id: USERS.length + 1, name: fullName, email, password, role, active: true };
      Array.isArray(USERS) ? USERS.push(newUser) : USERS[newUser.id] = newUser;
      console.log('Registering new user:', newUser);

      onRegisterSuccess({ email: newUser.email, role: roleConfig.key, name: newUser.name, avatar: roleConfig.icon, id: newUser.id });
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConfig = formData.email ? getRoleConfig(formData.email) : null;

  return (
    <div className="register-wrapper" style={{ background: 'linear-gradient(135deg, #0b0f1a 0%, #0f172a 50%, #0b0f1a 100%)' }}>
      <StarsBackground />

      <div className="register-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="register-header">
          <h2>Create Account</h2>
          <p>
            {currentConfig
              ? `Registering as: ${currentConfig.icon} ${currentConfig.name}`
              : 'Use your GUC email to register as a student or instructor'}
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Name */}
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
              <label>GUC Email *</label>
              <input
                type="email"
                name="email"
                placeholder="your.name@student.guc.edu.eg"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formData.email && !currentConfig && (
                <div className="error-message">Please use a valid GUC email address</div>
              )}
            </div>
          </div>

          {/* Password */}
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
            {passwordError && <div className="error-message">{passwordError}</div>}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onBack}>
              ← Back
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>
            Are you an employer?{' '}
            <button type="button" className="link-btn" onClick={onCompanyRegister}>
              Register as a company
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registerpage;