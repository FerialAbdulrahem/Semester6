import React, { useState } from 'react';
import '../styles/register.css';

export default function ForgotPasswordPage() {
  const { resetPassword } = useApp();
  const navigate = useNavigate();

  const [step, setStep]             = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail]           = useState('');
  const [otp, setOtp]               = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email.');
    

    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generated);
    setStep(2);
    alert(` Your OTP is: ${generated}`); 
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (enteredOtp !== otp) return setError('Incorrect OTP. Please try again.');
    setStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) return setError('Please fill in all fields.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    const result = resetPassword(email, newPassword);
    if (!result.success) return setError(result.error);
    setSuccess('Password reset successfully! Redirecting to login...');
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>GUC Portfolio</span>
        </div>

        {/* Steps indicator */}
        <div style={styles.steps}>
          {['Email', 'OTP', 'New Password'].map((s, i) => (
            <div key={s} style={styles.stepItem}>
              <div style={{ ...styles.stepCircle, ...(step > i ? styles.stepDone : step === i + 1 ? styles.stepActive : {}) }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ ...styles.stepLabel, ...(step === i + 1 ? { color: '#4f8ef7' } : {}) }}>{s}</span>
            </div>
          ))}
        </div>

        {error   && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <h2 style={styles.title}>Forgot your password?</h2>
            <p style={styles.subtitle}>Enter your email and we'll send you an OTP.</p>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input style={styles.input} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" style={styles.btn}>Send OTP</button>
            <Link to="/login" style={styles.backLink}>← Back to login</Link>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <h2 style={styles.title}>Enter OTP</h2>
            <p style={styles.subtitle}>A 6-digit OTP was sent to <strong style={{ color: '#e8ecf4' }}>{email}</strong></p>
            <div style={styles.field}>
              <label style={styles.label}>OTP Code</label>
              <input style={{ ...styles.input, letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.2rem' }} maxLength={6} placeholder="••••••" value={enteredOtp} onChange={e => setEnteredOtp(e.target.value)} />
            </div>
            <button type="submit" style={styles.btn}>Verify OTP</button>
            <button type="button" style={styles.secondaryBtn} onClick={() => setStep(1)}>← Change email</button>
          </form>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <h2 style={styles.title}>Set new password</h2>
            <p style={styles.subtitle}>Choose a strong new password for your account.</p>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input style={styles.input} type="password" placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm New Password</label>
              <input style={styles.input} type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" style={styles.btn}>Reset Password</button>
          </form>
        )}

      </div>
    </div>
  );
}