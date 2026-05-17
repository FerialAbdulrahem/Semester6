import React, { useEffect, useRef } from 'react';


const LandingPage = ({ onNavigateToRegister, onNavigateToLogin }) => {
  const stats = [
    { value: '2.4k+', label: 'STUDENTS', color: '#4f8ef7' },
    { value: '180+', label: 'COMPANIES', color: '#34d399' },
    { value: '640+', label: 'INTERNSHIPS', color: '#f472b6' }
  ];

  const roleCards = [
    {
      title: 'Students',
      description: 'Showcase projects, apply to internships, message instructors.',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap-icon lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>,
      gradient: 'linear-gradient(135deg, #12112b, #232e61)',
      color: '#021a3f',
      showButton: true
    },
    {
      title: 'Employers',
      description: 'Post internships, review applicants, save favorite candidates.',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase-icon lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>,
      gradient: 'linear-gradient(135deg, #12112b, #232e61)',
      color: '#021a3f',
      showButton: true
    },
    {
      title: 'Instructors',
      description: 'Supervise projects, leave feedback, evaluate tasks.',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>,
      gradient: 'linear-gradient(135deg, #12112b, #232e61)',
      color: '#021a3f',
      showButton: true
    },
    {
      title: 'Admins',
      description: 'Approve employers, manage users, courses, and projects.',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-ellipsis-icon lucide-shield-ellipsis"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>,
      gradient: 'linear-gradient(135deg, #12112b, #232e61)',
      color: '#021a3f',
      showButton: false
    }
  ];

  // Stars Background Effect (same as login page)
  const StarsBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      const NUM_STARS = 120;
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
          ctx.fillStyle = '#ffffff';
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
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    );
  };

  return (
    <div className="modern-landing-page" style={{ background: 'linear-gradient(135deg, #0b0f1a 0%, #0f172a 50%, #0b0f1a 100%)' }}>
      <StarsBackground />
      <div className="hero-glow"></div>
      
      <div className="landing-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            The Future of Talent
          </div>
          
          <h1 className="hero-title">
            Where talent meets
            <span className="gradient-text"> opportunity.</span>
          </h1>
          
          <p className="hero-description">
            Build a stunning portfolio, ship real projects with classmates, and land internships 
            at the companies you love — all in one warm, modern home.
          </p>

          <div className="hero-buttons">
            <button 
              className="btn-primary-glow"
              onClick={onNavigateToRegister}
            >
              Start your portfolio →
            </button>
            <button 
              className="btn-outline-premium"
              onClick={onNavigateToLogin}
            >
              I already have an account
            </button>
          </div>
          
          <div className="stats-row">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-line" style={{ background: stat.color }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Cards Section */}
        <div className="roles-section">
          <div className="section-header">
            <h2 className="section-title">A home for every role</h2>
            <p className="section-subtitle">PortfolioHub adapts to your needs — whether you're learning, hiring, or teaching.</p>
          </div>
          <div className="roles-grid">
            {roleCards.map((card, idx) => (
              <div key={idx} className="role-card">
                <div className="role-icon" style={{ background: card.gradient }}>
                  {card.icon}
                </div>
                <h3 className="role-title">{card.title}</h3>
                <p className="role-description">{card.description}</p>
                {card.showButton && (
                  <button 
                    className="role-btn" 
                    onClick={onNavigateToRegister}
                    aria-label={`Get started as ${card.title}`}
                  >
                    Get started <span className="arrow">→</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Student Portfolio Showcase Section */}
        <div className="showcase-section">
          <div className="showcase-content">
            <div className="showcase-text">
              <div className="showcase-badge">✨ Beautiful portfolios</div>
              <h2 className="showcase-title">A warm, magazine-style profile that lets your projects shine.</h2>
              <p className="showcase-description">
                Invite classmates, assign tasks, track feedback in one place. Your work deserves to be seen.
              </p>
            </div>
            <div className="showcase-image">
              <div className="mockup-card">
                <div className="mockup-header">
                  <div className="mockup-dot"></div>
                  <div className="mockup-dot"></div>
                  <div className="mockup-dot"></div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-line"></div>
                  <div className="mockup-line short"></div>
                  <div className="mockup-grid">
                    <div className="mockup-grid-item"></div>
                    <div className="mockup-grid-item"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employer Section - NEW */}
        <div className="employer-section">
          <div className="employer-content">
            <div className="employer-image">
              <div className="employer-card">
                <div className="employer-card-header">
                  <div className="employer-dot"></div>
                  <div className="employer-dot"></div>
                  <div className="employer-dot"></div>
                </div>
                <div className="employer-card-body">
                  <div className="employer-line"></div>
                  <div className="employer-line short"></div>
                  <div className="employer-applicants">
                    <div className="applicant-item"></div>
                    <div className="applicant-item"></div>
                    <div className="applicant-item"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="employer-text">
              <div className="employer-badge">🏢 Find your next hire</div>
              <h2 className="employer-title">Post internships, review applicants, and save top talent.</h2>
              <p className="employer-description">
                Find the perfect candidates for your company. Review student portfolios, 
                track applications, and build your team with the next generation of talent.
              </p>
            </div>
          </div>
        </div>

        {/* Faculty Supervision Section */}
        <div className="showcase-section">
          <div className="showcase-content">
            <div className="showcase-text">
              <div className="showcase-badge">👩‍🏫 Faculty supervision</div>
              <h2 className="showcase-title">Instructors review projects, leave comments, and rate work.</h2>
              <p className="showcase-description">
                Approve companies, link courses, and keep the platform healthy — all from a single dashboard.
              </p>
            </div>
            <div className="showcase-image">
              <div className="mockup-card">
                <div className="mockup-header">
                  <div className="mockup-dot"></div>
                  <div className="mockup-dot"></div>
                  <div className="mockup-dot"></div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-line"></div>
                  <div className="mockup-line short"></div>
                  <div className="mockup-grid">
                    <div className="mockup-grid-item"></div>
                    <div className="mockup-grid-item"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-card">
            <h2 className="cta-title">Ready to build the portfolio you'll be proud of?</h2>
            <p className="cta-description">
              Join thousands of students and companies already shaping the next generation of talent.
            </p>
            <div className="cta-buttons">
              <button className="cta-primary" onClick={onNavigateToRegister}>
                Create student account →
              </button>
              <button className="cta-secondary" onClick={onNavigateToRegister}>
                Register a company →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">PortfolioHub</span>
              <p className="footer-tagline">Where talent meets opportunity.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <button className="footer-link-btn">Features</button>
                <button className="footer-link-btn">Pricing</button>
                <button className="footer-link-btn">For Students</button>
                <button className="footer-link-btn">For Employers</button>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <button className="footer-link-btn">Blog</button>
                <button className="footer-link-btn">Help Center</button>
                <button className="footer-link-btn">Community</button>
                <button className="footer-link-btn">Privacy</button>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <button className="footer-link-btn">About</button>
                <button className="footer-link-btn">Careers</button>
                <button className="footer-link-btn">Contact</button>
                <button className="footer-link-btn">Press</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 PortfolioHub. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <style jsx="true">{`
        .modern-landing-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .hero-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 600px;
          background: radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12), transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        .landing-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--sp-8);
          position: relative;
          z-index: 2;
        }

        .hero-section {
          text-align: center;
          padding: var(--sp-12) 0 var(--sp-10);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--sp-2);
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: var(--r-full);
          padding: 6px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #93c5fd;
          margin-bottom: var(--sp-6);
        }

        .badge-pulse {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .hero-title {
          font-family: 'Sora', sans-serif;
          font-size: 3.5rem;
          font-weight: 700;
          color: var(--c-text);
          margin-bottom: var(--sp-5);
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.1rem;
          color: var(--c-text-2);
          max-width: 600px;
          margin: 0 auto var(--sp-8);
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: var(--sp-4);
          justify-content: center;
          margin-bottom: var(--sp-10);
          flex-wrap: wrap;
        }

        .btn-primary-glow {
          background: linear-gradient(135deg, #3b82f6, #a78bfa);
          border: none;
          padding: 12px 28px;
          border-radius: var(--r-full);
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all var(--t-base);
          box-shadow: 0 0 20px rgba(59,130,246,0.3);
        }

        .btn-primary-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(59,130,246,0.5);
        }

        .btn-outline-premium {
          background: transparent;
          border: 1px solid rgba(148,163,184,0.14);
          padding: 12px 28px;
          border-radius: var(--r-full);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--c-text-2);
          cursor: pointer;
          transition: all var(--t-base);
        }

        .btn-outline-premium:hover {
          border-color: #3b82f6;
          color: #93c5fd;
          background: rgba(59,130,246,0.1);
        }

        .stats-row {
          display: flex;
          justify-content: center;
          gap: var(--sp-8);
          flex-wrap: wrap;
          padding: var(--sp-8) 0;
          border-top: 1px solid rgba(148,163,184,0.08);
          margin-top: var(--sp-4);
        }

        .stat-card {
          text-align: center;
        }

        .stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: var(--sp-1);
        }

        .stat-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--c-muted);
        }

        .stat-line {
          width: 30px;
          height: 2px;
          margin: 8px auto 0;
          border-radius: var(--r-full);
        }

        .roles-section {
          padding: var(--sp-12) 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--sp-10);
        }

        .section-title {
          font-family: 'Sora', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--c-text);
          margin-bottom: var(--sp-3);
        }

        .section-subtitle {
          color: var(--c-text-2);
          font-size: 1rem;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--sp-6);
        }

        @media (max-width: 1024px) {
          .roles-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .roles-grid { grid-template-columns: 1fr; }
        }

        .role-card {
          background: rgba(19,25,41,0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(148,163,184,0.08);
          border-radius: var(--r-xl);
          padding: var(--sp-6);
          text-align: center;
          transition: all var(--t-base);
        }

        .role-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59,130,246,0.25);
          box-shadow: var(--sh-md);
          background: rgba(26,34,53,0.9);
        }

        .role-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--r-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          margin: 0 auto var(--sp-4);
        }

        .role-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--c-text);
          margin-bottom: var(--sp-2);
        }

        .role-description {
          color: var(--c-text-2);
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: var(--sp-4);
        }

        .role-btn {
          background: transparent;
          border: none;
          color: #93c5fd;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: var(--sp-1);
          transition: gap var(--t-fast);
          font-family: inherit;
        }

        .role-btn:hover .arrow {
          transform: translateX(3px);
        }

        .role-btn .arrow {
          transition: transform var(--t-fast);
        }

        /* Showcase Section (Student) */
        .showcase-section,
        .employer-section,
        .faculty-section {
          padding: var(--sp-12) 0;
          border-top: 1px solid rgba(148,163,184,0.08);
        }

        .showcase-content,
        .employer-content,
        .faculty-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-10);
          align-items: center;
        }

        @media (max-width: 768px) {
          .showcase-content,
          .employer-content,
          .faculty-content {
            grid-template-columns: 1fr;
          }
        }

        .showcase-badge,
        .employer-badge,
        .faculty-badge {
          display: inline-block;
          padding: 5px 12px;
          background: rgba(59,130,246,0.1);
          border-radius: var(--r-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: #93c5fd;
          margin-bottom: var(--sp-4);
        }

        .showcase-title,
        .employer-title,
        .faculty-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--c-text);
          margin-bottom: var(--sp-4);
          line-height: 1.3;
        }

        .showcase-description,
        .employer-description,
        .faculty-description {
          color: var(--c-text-2);
          line-height: 1.6;
          margin-bottom: var(--sp-5);
        }

        /* Student Showcase Image */
        .showcase-image {
          background: linear-gradient(135deg, rgba(26,34,53,0.5), rgba(19,25,41,0.5));
          border-radius: var(--r-2xl);
          padding: var(--sp-6);
          border: 1px solid rgba(148,163,184,0.08);
        }

        .mockup-card {
          background: rgba(19,25,41,0.8);
          border-radius: var(--r-xl);
          overflow: hidden;
        }

        .mockup-header {
          background: rgba(26,34,53,0.6);
          padding: var(--sp-3);
          display: flex;
          gap: var(--sp-2);
          border-bottom: 1px solid rgba(148,163,184,0.08);
        }

        .mockup-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--c-muted);
        }

        .mockup-body {
          padding: var(--sp-5);
        }

        .mockup-line {
          height: 8px;
          background: rgba(148,163,184,0.14);
          border-radius: var(--r-full);
          margin-bottom: var(--sp-3);
        }

        .mockup-line.short {
          width: 60%;
        }

        .mockup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-3);
          margin-top: var(--sp-4);
        }

        .mockup-grid-item {
          height: 60px;
          background: rgba(26,34,53,0.5);
          border-radius: var(--r-md);
        }

        /* Employer Section Image */
        .employer-image {
          background: linear-gradient(135deg, rgba(26,34,53,0.5), rgba(19,25,41,0.5));
          border-radius: var(--r-2xl);
          padding: var(--sp-6);
          border: 1px solid rgba(148,163,184,0.08);
        }

        .employer-card {
          background: rgba(19,25,41,0.8);
          border-radius: var(--r-xl);
          overflow: hidden;
        }

        .employer-card-header {
          background: rgba(26,34,53,0.6);
          padding: var(--sp-3);
          display: flex;
          gap: var(--sp-2);
          border-bottom: 1px solid rgba(148,163,184,0.08);
        }

        .employer-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--c-muted);
        }

        .employer-card-body {
          padding: var(--sp-5);
        }

        .employer-line {
          height: 8px;
          background: rgba(148,163,184,0.14);
          border-radius: var(--r-full);
          margin-bottom: var(--sp-3);
        }

        .employer-line.short {
          width: 60%;
        }

        .employer-applicants {
          margin-top: var(--sp-4);
          display: flex;
          flex-direction: column;
          gap: var(--sp-2);
        }

        .applicant-item {
          height: 40px;
          background: rgba(26,34,53,0.5);
          border-radius: var(--r-md);
          width: 100%;
        }

        .applicant-item:nth-child(2) {
          width: 85%;
        }

        .applicant-item:nth-child(3) {
          width: 70%;
        }

        /* Faculty Section Image */
        .faculty-image {
          background: linear-gradient(135deg, rgba(26,34,53,0.5), rgba(19,25,41,0.5));
          border-radius: var(--r-2xl);
          padding: var(--sp-6);
          border: 1px solid rgba(148,163,184,0.08);
        }

        .review-card {
          display: flex;
          gap: var(--sp-4);
          background: rgba(19,25,41,0.8);
          border-radius: var(--r-xl);
          padding: var(--sp-4);
        }

        .review-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--r-full);
          background: linear-gradient(135deg, #3b82f6, #a78bfa);
        }

        .review-text {
          flex: 1;
        }

        .review-line {
          height: 8px;
          background: rgba(148,163,184,0.14);
          border-radius: var(--r-full);
          margin-bottom: var(--sp-2);
        }

        .review-line.short {
          width: 70%;
        }

        /* CTA Section */
        .cta-section {
          padding: var(--sp-12) 0;
        }

        .cta-card {
          background: linear-gradient(135deg, rgba(19,25,41,0.9), rgba(26,34,53,0.9));
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: var(--r-2xl);
          padding: var(--sp-10);
          text-align: center;
          backdrop-filter: blur(10px);
        }

        .cta-title {
          font-family: 'Sora', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: var(--c-text);
          margin-bottom: var(--sp-4);
        }

        .cta-description {
          color: var(--c-text-2);
          margin-bottom: var(--sp-8);
        }

        .cta-buttons {
          display: flex;
          gap: var(--sp-4);
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-primary {
          background: linear-gradient(135deg, #3b82f6, #a78bfa);
          border: none;
          padding: 12px 28px;
          border-radius: var(--r-full);
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: transform var(--t-fast);
        }

        .cta-primary:hover {
          transform: translateY(-2px);
        }

        .cta-secondary {
          background: transparent;
          border: 1px solid rgba(148,163,184,0.14);
          padding: 12px 28px;
          border-radius: var(--r-full);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--c-text-2);
          cursor: pointer;
          transition: all var(--t-fast);
        }

        .cta-secondary:hover {
          border-color: #3b82f6;
          color: #93c5fd;
          background: rgba(59,130,246,0.1);
        }

        /* Footer */
        .landing-footer {
          border-top: 1px solid rgba(148,163,184,0.08);
          padding: var(--sp-8) 0 var(--sp-6);
          margin-top: var(--sp-8);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--sp-8);
          margin-bottom: var(--sp-8);
        }

        .footer-logo {
          font-family: 'Sora', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-tagline {
          color: var(--c-muted);
          font-size: 0.8rem;
          margin-top: var(--sp-2);
        }

        .footer-links {
          display: flex;
          gap: var(--sp-8);
          flex-wrap: wrap;
        }

        .footer-column h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--c-text);
          margin-bottom: var(--sp-3);
        }

        .footer-link-btn {
          display: block;
          background: transparent;
          border: none;
          color: var(--c-muted);
          text-decoration: none;
          font-size: 0.8rem;
          margin-bottom: var(--sp-2);
          transition: color var(--t-fast);
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          text-align: left;
        }

        .footer-link-btn:hover {
          color: #93c5fd;
        }

        .footer-bottom {
          text-align: center;
          padding-top: var(--sp-6);
          border-top: 1px solid rgba(148,163,184,0.08);
          color: var(--c-muted);
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .landing-container { padding: 0 var(--sp-5); }
          .cta-card { padding: var(--sp-6); }
          .cta-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;