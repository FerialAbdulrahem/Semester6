import React, { useState } from 'react';
import './App.css';
import Login from './components/SHARED/LoginPage';
import Register from './components/SHARED/RegisterPage';
import EmployerRegister from './components/SHARED/register';
import DashboardLayout from './components/SHARED/DashboardLayout';
import LandingPage from './components/LandingPage';

const App = () => {
  const [step, setStep] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setStep('dashboard');
    setShowLanding(false);
  };

  const handleLogout = () => {
    setStep('login');
    setCurrentUser(null);
  };

  const handleGoToRegister = () => {
    setStep('register');
    setShowLanding(false);
  };

  const handleGoToEmployerRegister = () => {
    setStep('registerCompany');
  };

  const handleBackToLogin = () => {
    setStep('login');
  };

  const handleRegisterSuccess = (userData) => {
    alert('Account created successfully! Please log in.');
    setStep('login');
  };

  const handleStartPortfolio = () => {
    setShowLanding(false);
    setStep('register');
  };
  
  const handleAlreadyHaveAccount = () => {
    setShowLanding(false);
    setStep('login');
  };

  // If showing landing page, render it without nav/footer
  if (showLanding) {
    return (
      <LandingPage 
        onNavigateToRegister={handleStartPortfolio}
        onNavigateToLogin={handleAlreadyHaveAccount}
      />
    );
  }

  return (
    <div className="app">
      {step !== 'dashboard' && (
        <nav className="modern-nav">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-text">PortfolioHub</span> 
            </div>
          </div>
        </nav>
      )}

      <main className={step === 'dashboard' ? 'dashboard-main' : ''}>
        
        {step === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={handleGoToRegister}
          />
        )}

        {step === 'register' && (
          <Register
            onBack={handleBackToLogin}
            onRegisterSuccess={handleRegisterSuccess}
            onCompanyRegister={handleGoToEmployerRegister}
          />
        )}

        {step === 'registerCompany' && (
          <EmployerRegister
            onBack={handleBackToLogin}
            onSuccess={handleRegisterSuccess}
            onGoToRegister={handleGoToRegister}
          />
        )}

        {step === 'dashboard' && currentUser && (
          <DashboardLayout
            user={currentUser}
            onLogout={handleLogout}
          />
        )}
      </main>

      {step !== 'dashboard' && (
        <footer className="modern-footer">
          <p>© 2026 PortfolioHub</p>
        </footer>
      )}
    </div>
  );
};

export default App;