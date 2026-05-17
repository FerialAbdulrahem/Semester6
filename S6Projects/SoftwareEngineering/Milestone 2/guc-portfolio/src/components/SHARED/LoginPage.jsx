import React, { useState, useEffect, useRef } from 'react';
import { USERS } from '../../data/Data';
import '../styles/register.css';

/* ── Falling Stars Canvas ────────────────────────────────── */
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
      phase: 'fadein', // fadein | fall | fadeout
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
        ctx.fillStyle = 'var(--c-surface)';
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

/* ── LoginPage ───────────────────────────────────────────── */
const LoginPage = ({ onLoginSuccess, onGoToRegister }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  const [view, setView]                     = useState('login');
  const [fpEmail, setFpEmail]               = useState('');
  const [generatedOtp, setGeneratedOtp]     = useState('');
  const [enteredOtp, setEnteredOtp]         = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fpError, setFpError]               = useState('');
  const [fpSuccess, setFpSuccess]           = useState('');

  const getRoleFromEmail = (email) => {
    if (email.endsWith('@student.guc.edu.eg'))  return 'Student';
    if (email.endsWith('@guc.edu.eg'))           return 'Course Instructor';
    if (email.endsWith('@admin.guc.edu.eg'))     return 'Administrator';
    return 'Employer';
  };

  const getRoleConfig = (email) => {
    const role = getRoleFromEmail(email);
    const configs = {
      'Student':           { name: 'Student',      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap-icon lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>,
        gradient: 'linear-gradient(135deg, #12112b, #232e61)', key: 'student' },
      'Course Instructor': { name: 'Instructor',   icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>,
      gradient: 'linear-gradient(135deg, #12112b, #232e61)',key: 'instructor' },
      'Administrator':     { name: 'Admin',        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-ellipsis-icon lucide-shield-ellipsis"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>,
      gradient: 'linear-gradient(135deg, #12112b, #232e61)',key: 'admin'      },
      'Employer':          { name: 'Employer',     icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase-icon lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>,
      gradient: 'linear-gradient(135deg, #12112b, #232e61)', key: 'employer'   },
    };
    return configs[role];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const role       = getRoleFromEmail(email);
    const roleConfig = getRoleConfig(email);
    const user = USERS.find(u => u.email === email && u.role === role && u.password === password);
    if (user) {
      onLoginSuccess({ email: user.email, role: roleConfig.key, name: user.name, avatar: roleConfig.icon, id: user.id });
    } else {
      alert('Invalid email or password. Please check your credentials.');
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setFpError('');
    if (!fpEmail) return setFpError('Please enter your email.');
    const exists = USERS.find(u => u.email === fpEmail);
    if (!exists) return setFpError('No account found with this email.');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setView('otp');
    alert(`[Demo] Your OTP is: ${otp}`);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setFpError('');
    if (enteredOtp !== generatedOtp) return setFpError('Incorrect OTP. Please try again.');
    setView('reset');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setFpError('');
    if (!newPassword || !confirmPassword) return setFpError('Please fill in all fields.');
    if (newPassword !== confirmPassword)  return setFpError('Passwords do not match.');
    if (newPassword.length < 6)           return setFpError('Password must be at least 6 characters.');
    const user = USERS.find(u => u.email === fpEmail);
    if (user) user.password = newPassword;
    setFpSuccess('Password reset successfully!');
    setTimeout(() => {
      setView('login');
      setFpEmail(''); setEnteredOtp(''); setNewPassword(''); setConfirmPassword('');
      setFpSuccess(''); setFpError('');
    }, 1800);
  };

  const resetFpFlow = () => {
    setView('login');
    setFpEmail(''); setGeneratedOtp(''); setEnteredOtp('');
    setNewPassword(''); setConfirmPassword('');
    setFpError(''); setFpSuccess('');
  };

  const currentConfig = email ? getRoleConfig(email) : null;

  const steps      = ['Email', 'OTP', 'New Password'];
  const stepIndex  = { forgot: 0, otp: 1, reset: 2 };
  const currentStep = stepIndex[view] ?? -1;

  return (
    <>
      {/* Navbar is rendered by App.js */}

      <div className="login-wrapper" style={{ background: 'linear-gradient(135deg, #0b0f1a 0%, #0f172a 50%, #0b0f1a 100%)' }}>
        <StarsBackground />

        <div className="login-container-modern" style={{ alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

          {/* ── LOGIN CARD ── */}
          {view === 'login' && (
            <div className="login" style={{ animation: 'fadeSlideIn 0.4s ease both' }}>
              <div className="role-login-header">
                {currentConfig && (
                  <div className="role-login-icon" style={{ background: currentConfig.gradient }}>
                    {currentConfig.icon}
                  </div>
                )}
                {!currentConfig && (
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✦</div>
                )}
                <h1>Welcome back</h1>
                {currentConfig
                  ? <p className="role-indicator">Signing in as <strong>{currentConfig.name}</strong></p>
                  : <p className="role-indicator">Sign in to your account</p>
                }
              </div>

              <form className="login-form-modern" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required
                  />
                </div>

                <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                  <button type="button" className="link-btn" onClick={() => { setFpEmail(email); setView('forgot'); }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="login-submit" style={{ marginTop: '4px', width: '100%' }}>
                  Sign in →
                </button>
              </form>

              <div className="login-footer">
                <p>Don't have an account? <button onClick={onGoToRegister} className="link-btn">Create one</button></p>
              </div>
            </div>
          )}

          {/* ── FORGOT PASSWORD CARD ── */}
          {view !== 'login' && (
            <div className="login" style={{ animation: 'fadeSlideIn 0.4s ease both' }}>
              <div className="fp-steps">
                {steps.map((s, i) => (
                  <div key={s} className="fp-step-item">
                    <div className={`fp-step-circle ${i < currentStep ? 'fp-step-done' : i === currentStep ? 'fp-step-active' : ''}`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span className={`fp-step-label ${i === currentStep ? 'fp-step-label--active' : ''}`}>{s}</span>
                  </div>
                ))}
              </div>

              {fpError   && <div className="fp-error">{fpError}</div>}
              {fpSuccess && <div className="fp-success">{fpSuccess}</div>}

              {view === 'forgot' && (
                <form className="login-form-modern" onSubmit={handleSendOtp}>
                  <div className="role-login-header" style={{ marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '20px' }}>Reset password</h1>
                    <p className="role-indicator">Enter your email to receive an OTP</p>
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="your@email.com" required />
                  </div>
                  <button type="submit" className="login-submit" style={{ width: '100%' }}>Send OTP</button>
                  <div className="login-footer" style={{ marginTop: '8px' }}>
                    <p><button type="button" className="link-btn" onClick={resetFpFlow}>← Back to login</button></p>
                  </div>
                </form>
              )}

              {view === 'otp' && (
                <form className="login-form-modern" onSubmit={handleVerifyOtp}>
                  <div className="role-login-header" style={{ marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '20px' }}>Enter OTP</h1>
                    <p className="role-indicator">Sent to <strong>{fpEmail}</strong></p>
                  </div>
                  <div className="form-group">
                    <label>6-digit OTP</label>
                    <input
                      type="text" maxLength={6} value={enteredOtp}
                      onChange={e => setEnteredOtp(e.target.value)}
                      placeholder="••••••"
                      style={{ letterSpacing: '0.35em', textAlign: 'center', fontSize: '18px' }}
                      required
                    />
                  </div>
                  <button type="submit" className="login-submit" style={{ width: '100%' }}>Verify OTP</button>
                  <div className="login-footer" style={{ marginTop: '8px' }}>
                    <p><button type="button" className="link-btn" onClick={() => setView('forgot')}>← Change email</button></p>
                  </div>
                </form>
              )}

              {view === 'reset' && (
                <form className="login-form-modern" onSubmit={handleResetPassword}>
                  <div className="role-login-header" style={{ marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '20px' }}>New password</h1>
                    <p className="role-indicator">Choose a strong password</p>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 6 characters" required />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required />
                  </div>
                  <button type="submit" className="login-submit" style={{ width: '100%' }}>Reset Password</button>
                </form>
              )}
            </div>
          )}

          

        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default LoginPage;
