import React, { useEffect, useState, useRef, useMemo } from "react";

/// ADMIN
import AdminP1 from '../ADMIN/CourseManagement.jsx';
import AdminP2 from '../ADMIN/EmployerApproval.jsx';
import AdminP3 from '../ADMIN/ProjectManagement.jsx';
import AdminP4 from '../ADMIN/UserManagement.jsx';
import Notifications from '../ADMIN/Notifications.jsx';
import { EMPLOYER_NOTIFICATIONS } from '../../data/Data.js';
import {INOTIFICATIONS } from '../../data/Data.js';
import { LINK_REQUESTS } from '../../data/DummyData.js';

/// INSTRUCTOR
import InstructorP1 from "../INSTRUCTOR/page1.jsx";
import InstructorP2 from "../INSTRUCTOR/page2.jsx";
import InstructorP3 from "../INSTRUCTOR/page3.jsx";
import TaskFeedback from "../INSTRUCTOR/TaskFeedback.jsx";
import InstructorInvitations from "../INSTRUCTOR/instructorinvitations.jsx";

/// EMPLOYER
import EmployerP1 from "../EMPLOYER/page1.jsx";
import EmployerP3 from "../EMPLOYER/page3.jsx";
import EmployerProfile from "../EMPLOYER/profile.jsx";
import ApplicationPage from "../EMPLOYER/applications.jsx";

/// STUDENT
import StudentP1 from "../STUDENT/StudentInternship.jsx";
import StudentP2 from "../STUDENT/StudentPortfolio.jsx";
import StudentP3 from "../STUDENT/StudentProject.jsx";
import StudentExplore from "../STUDENT/StudentExplore.jsx";
import StudentFavorite from "../STUDENT/StudentFavorite.jsx";
import StudentNotification from "../STUDENT/StudentNotification.jsx";
import StudentMessage from "../STUDENT/StudentMessage.jsx";

import AdminDashboard from "../ADMIN/AdminDashboard.jsx";
import InstructorDashboard from "../INSTRUCTOR/InstructorDashboard.jsx";
import EmployerDashboard from "../EMPLOYER/EmployerDshboard.jsx";
import StudentDashboard from "../STUDENT/StudentDashboard.jsx";

import { NOTIFICATIONS, STUDENT_FAVORITES, USERS, COURSE_INSTRUCTORS } from "../../data/Data.js";

import "../styles/DashboardLayout.css";

const DashboardLayout = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState("dashboard");
  // ── NEW: store the params passed via goTo so pages can read them ──────────
  const [pageParams, setPageParams] = useState({});

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user.avatar || null);
  const fileInputRef = useRef(null);
  
  const [messagesUpdate, setMessagesUpdate] = useState(0);

  const [favoriteStudents, setFavoriteStudents] = useState(() => {
    const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        return parsed.portfolios || [];
      } catch (error) {
        console.error("Failed to parse favorites:", error);
      }
    }
    if (user.role === 'student') {
      const studentFavs = STUDENT_FAVORITES[user.id] || {};
      return studentFavs.portfolios || [];
    }
    return [];
  });
  
  const [favoriteProjects, setFavoriteProjects] = useState(() => {
    const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        return parsed.projects || [];
      } catch (error) {
        console.error("Failed to parse favorites:", error);
      }
    }
    if (user.role === 'student') {
      const studentFavs = STUDENT_FAVORITES[user.id] || {};
      return studentFavs.projects || [];
    }
    return [];
  });

  useEffect(() => {
    const favoritesData = {
      portfolios: favoriteStudents,
      projects: favoriteProjects
    };
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favoritesData));
  }, [user.id, favoriteStudents, favoriteProjects]);

  const [notifications, setNotifications] = useState(() => {
  const normalizedRole = user.role?.toLowerCase();

  if (normalizedRole === 'admin') {
    return LINK_REQUESTS.map(n => ({ ...n, read: false }));
  } 
  
  if (normalizedRole === 'employer') {
    return EMPLOYER_NOTIFICATIONS.map(n => ({ ...n, read: false }));
  } 
  
  if (normalizedRole === 'student') {
    return NOTIFICATIONS.filter(
      n => String(n.userId) === String(user.id)
    );
  } 
  
  if (normalizedRole === 'instructor') {
  return INOTIFICATIONS.map(n => ({
    ...n,
    title: n.type === 'project_invitation'
      ? 'Project Invitation'
      : 'Private Message',
    time: n.date
  }));
}

  return [];
});
const handleRemoveProfilePic = () => {
  setProfilePicture(null);
  try {
    window.localStorage.removeItem('guc-portfolio-profile-picture');
    
    // If instructor, also remove from instructor profile storage
    if (user.role === 'instructor') {
      const instructorProfile = window.localStorage.getItem('guc-portfolio-instructor-profile');
      if (instructorProfile) {
        const parsedProfile = JSON.parse(instructorProfile);
        delete parsedProfile.picture;
        window.localStorage.setItem('guc-portfolio-instructor-profile', JSON.stringify(parsedProfile));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('guc-portfolio-instructor-picture-updated', { 
          detail: null 
        }));
      }
    }
  } catch (error) {
    console.warn('Unable to remove profile picture', error);
  }
};
  useEffect(() => {
    const messagesKey = `messages_${user.id}`;
    const existingMessages = localStorage.getItem(messagesKey);
    
    if (!existingMessages) {
      const getSampleMessages = (userId, userRole, userName) => {
        const allUsers = [...USERS, ...COURSE_INSTRUCTORS].filter(u => u.id !== userId);
        if (allUsers.length === 0) return [];
        
        const sampleMessages = [];
        const usersToChat = allUsers.slice(0, 3);
        
        usersToChat.forEach((partner, index) => {
          const partnerName = partner.name || `${partner.firstName} ${partner.lastName}`;
          const partnerRole = partner.role || 'User';
          
          sampleMessages.push({
            id: 1000 + index * 10 + 1,
            senderId: partner.id,
            receiverId: userId,
            message: `Hey! ${index === 0 ? "How's your project going?" : index === 1 ? "Did you see the new internship posting?" : "Want to collaborate on a project?"}`,
            subject: `Message from ${partnerName}`,
            timestamp: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
            read: index === 0 ? false : (index === 1 ? false : true),
            senderName: partnerName,
            senderRole: partnerRole,
            type: 'message'
          });
          
          if (index < 2) {
            sampleMessages.push({
              id: 1000 + index * 10 + 2,
              senderId: userId,
              receiverId: partner.id,
              message: index === 0 ? "It's going well! Thanks for asking." : "Yes, I'm planning to apply. Thanks for the heads up!",
              subject: `Re: Message from ${partnerName}`,
              timestamp: new Date(Date.now() - (index + 0.5) * 24 * 60 * 60 * 1000).toISOString(),
              read: true,
              senderName: userName || "Current User",
              senderRole: userRole || "User",
              type: 'message'
            });
          }
        });
        
        return sampleMessages;
      };
      
      const sampleMessages = getSampleMessages(user.id, user.role, user.name);
      if (sampleMessages.length > 0) {
        localStorage.setItem(messagesKey, JSON.stringify(sampleMessages));
        setMessagesUpdate(prev => prev + 1);
      }
    } else {
      setMessagesUpdate(prev => prev + 1);
    }
    
    setMessagesUpdate(prev => prev + 1);
  }, [user.id, user.role, user.name]);

  useEffect(() => {
    const handleMessagesUpdate = (event) => {
      if (event.detail && event.detail.userId === user.id) {
        setMessagesUpdate(prev => prev + 1);
      }
    };
    window.addEventListener('messages-updated', handleMessagesUpdate);
    return () => window.removeEventListener('messages-updated', handleMessagesUpdate);
  }, [user.id]);

  const normalizedRole = user.role;

  useEffect(() => {
    try {
      const storedProfile = window.localStorage.getItem('guc-portfolio-profile-picture');
      if (storedProfile) {
        setProfilePicture(storedProfile);
        return;
      }
    } catch (error) {}

    if (user.role === 'instructor') {
      try {
        const instructorProfile = window.localStorage.getItem('guc-portfolio-instructor-profile');
        if (instructorProfile) {
          const parsedProfile = JSON.parse(instructorProfile);
          setProfilePicture(parsedProfile.picture || user.avatar || null);
          return;
        }
      } catch (error) {}
    }

    setProfilePicture(user.avatar || null);

    const handlePictureUpdate = (event) => {
      setProfilePicture(event.detail || null);
    };

    window.addEventListener('guc-portfolio-instructor-picture-updated', handlePictureUpdate);
    return () => window.removeEventListener('guc-portfolio-instructor-picture-updated', handlePictureUpdate);
  }, [user.avatar, user.role]);

  const handleProfilePicUploadClick = () => fileInputRef.current?.click();

  const handleProfilePicSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setProfilePicture(result);
        try {
          window.localStorage.setItem('guc-portfolio-profile-picture', result);
        } catch (error) {
          console.warn('Unable to save profile picture', error);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const getNavItems = () => {
    const baseItems = [{ id: "dashboard", label: "Dashboard" }];
    const rolePages = {
      student: [
        { id: "spage2", label: "Portfolio" },
        { id: "spage1", label: "Internship" },
        { id: "spage3", label: "Project" },
        { id: "spage4", label: "Explore" }
      ],
      instructor: [
        { id: "ipage1", label: "Profile" },
        { id: "ipage2", label: "Courses/Projects" },
        { id: "ipage3", label: "Projects" },
        { id: "itask", label: "Task Feedback" },
        { id: "iinvitations", label: "Invitations" },
        { id: "spage4", label: "Explore" }
      ],
      employer: [
        { id: "epage1", label: "Portfolios" },
        { id: "epage2", label: "Applications" },
        { id: "epage3", label: "Internships" },
        { id: "spage4", label: "Explore" }
      ],
      admin: [
        { id: 'apage1', label: 'Courses' },
        { id: 'apage2', label: 'Employer' },
        { id: 'apage3', label: 'Projects' },
        { id: 'apage4', label: 'Users' },
        { id: 'spage4', label: 'Explore' }
      ]
    };
    const pages = rolePages[user.role] || rolePages.student;
    return [...baseItems, ...pages];
  };

  const navItems = getNavItems();

  // ── KEY FIX: goTo stores params then switches page ────────────────────────
  const handleGoTo = (target, params = {}) => {
    setPageParams(params);
    setActivePage(target);
  };

  // ── When user clicks a nav link manually, clear params so stale
  //    searchQuery / highlightId from a previous search don't linger. ────────
  const handleNavClick = (pageId) => {
    setPageParams({});
    setActivePage(pageId);
  };

  const renderDashboard = () => {
    const commonProps = { user, activePage, setActivePage, navItems };
    switch (user.role) {
      case "student":   return <StudentDashboard    {...commonProps} favoriteStudents={favoriteStudents} favoriteProjects={favoriteProjects} notifications={notifications} unreadMessages={unreadMessages} />;
      case "instructor": return <InstructorDashboard {...commonProps} />;
      case "employer":  return <EmployerDashboard   {...commonProps} />;
      case "admin":
        return (
          <AdminDashboard
            {...commonProps}
            goTo={handleGoTo}   // ← uses the fixed handler
          />
        );
      default:
        return <StudentDashboard {...commonProps} />;
    }
  };

  const renderContent = () => {
    const pages = {
      dashboard: renderDashboard(),
      internships: <StudentP1 user={user} />,
      portfolio:   <StudentP2 user={user} />,
      projects:    <StudentP3 user={user} />,
      spage1:      <StudentP1 user={user} />,
      spage2:      <StudentP2 user={user} />,
      spage3:      <StudentP3 user={user} />,

      notifications: user.role === 'admin' ? (
        <Notifications
          notifs={notifications}
          setNotifs={setNotifications}
          markOneRead={markAsRead}
          setActivePage={setActivePage}
        />
      ) : (
        <StudentNotification user={user} notifications={notifications} setNotifications={setNotifications} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} />
      ),

      messages: user.role !== 'admin'
        ? <StudentMessage user={user} onMessageUpdate={() => setMessagesUpdate(prev => prev + 1)} />
        : null,

      favorites: user.role !== 'admin' ? (
        <StudentFavorite
          user={user}
          favoriteStudents={favoriteStudents}
          favoriteProjects={favoriteProjects}
          removeStudentFavorite={(id) => setFavoriteStudents(prev => prev.filter(s => s.id !== id))}
          removeProjectFavorite={(id) => setFavoriteProjects(prev => prev.filter(p => p.id !== id))}
        />
      ) : null,

      ipage1: <InstructorP1 user={user} />,
      ipage2: <InstructorP2 user={user} />,
      ipage3: <InstructorP3 user={user} />,
      itask:  <TaskFeedback  user={user} />,
      iinvitations: <InstructorInvitations user={user} />,

      epage1:  <EmployerP1
        user={user}
        favoriteStudents={favoriteStudents}
        favoriteProjects={favoriteProjects}
        setFavoriteStudents={setFavoriteStudents}
        setFavoriteProjects={setFavoriteProjects}
      />,
      epage2: <ApplicationPage user={user} favoriteStudents={favoriteStudents} />,
      epage3:  <EmployerP3      user={user} />,

      profile: <EmployerProfile user={user} />,

      spage4: (
        <StudentExplore
          user={user}
          favoriteStudents={favoriteStudents}
          favoriteProjects={favoriteProjects}
          addStudentFavorite={(student) => {
            setFavoriteStudents(prev => prev.some(s => s.id === student.id) ? prev : [...prev, student]);
          }}
          addProjectFavorite={(project) => {
            setFavoriteProjects(prev => prev.some(p => p.id === project.id) ? prev : [...prev, project]);
          }}
          removeStudentFavorite={(id) => setFavoriteStudents(prev => prev.filter(s => s.id !== id))}
          removeProjectFavorite={(id) => setFavoriteProjects(prev => prev.filter(p => p.id !== id))}
        />
      ),

      // ── Admin pages now receive all params from goTo ──────────────────────
      apage1: (
        <AdminP1
          user={user}
          highlightId={pageParams.highlightId}
          searchQuery={pageParams.searchQuery}
        />
      ),
      apage2: (
        <AdminP2
          user={user}
          highlightId={pageParams.highlightId}
          filter={pageParams.filter}
        />
      ),
      apage3: (
        <AdminP3
          user={user}
          initialTab={pageParams.tab || "all"}
          highlightId={pageParams.highlightId}
          initialSearchQuery={pageParams.searchQuery || ""}  // ← THE KEY FIX
        />
      ),
      apage4: (
        <AdminP4
          user={user}
          highlightId={pageParams.highlightId}
          filter={pageParams.filter}
          searchQuery={pageParams.searchQuery}
        />
      ),
    };

    return pages[activePage] || renderDashboard();
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  const unreadMessages = useMemo(() => {
    if (normalizedRole === "admin") return 0;
    try {
      const raw = window.localStorage.getItem(`messages_${user.id}`);
      const messages = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(messages)) return 0;
      return messages.filter(m => m.receiverId === user.id && !m.read).length;
    } catch (error) {
      return 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, normalizedRole, messagesUpdate]);
  
  const favoritesCount = useMemo(() => {
    return favoriteStudents.length + favoriteProjects.length;
  }, [favoriteStudents, favoriteProjects]);

  const markAllAsRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const markAsRead    = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));

  const toggleRightSidebar  = () => setIsRightSidebarOpen(!isRightSidebarOpen);
  const openFavoritesPage   = () => setActivePage('favorites');
  const openMessagesPage    = () => setActivePage('messages');
  const openNotificationsPage = () => { setActivePage('notifications'); setIsNotificationOpen(false); };

  return (
    <div className="dashboard-layout">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar__brand">GUC Portfolio</div>

        <div className="navbar__links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`navbar__btn ${activePage === item.id ? "navbar__btn--active" : ""}`}
              onClick={() => handleNavClick(item.id)}   // ← clears params on manual nav
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="navbar__user">
          <span className="navbar__user-name">{user.name}</span>

          <div className="navbar__icons-group">
            {user.role !== 'admin' && (
              <div className="icon-button" onClick={openMessagesPage}>
                <span className="icon-btn">💬</span>
                {unreadMessages > 0 && <span className="icon-badge">{unreadMessages}</span>}
              </div>
            )}

            {user.role !== 'admin' && user.role !== 'instructor' && (
              <div className="icon-button" onClick={openFavoritesPage}>
                <span className="icon-btn">❤️</span>
                {favoritesCount > 0 && <span className="icon-badge">{favoritesCount}</span>}
              </div>
            )}

            <div className="icon-button" onClick={openNotificationsPage} style={{ position: 'relative' }}>
              <span className="icon-btn">🔔</span>
              {!notificationsEnabled && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', lineHeight: 1 }}>✕</span>
              )}
              {notificationsEnabled && unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
            </div>

            <div className="navbar__avatar" onClick={toggleRightSidebar}>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{user.avatar || '👤'}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className={`main-content-area ${isRightSidebarOpen ? "sidebar-open" : ""}`}>
        {renderContent()}
      </div>

      {/* RIGHT SIDEBAR */}
      <div className={`right-sidebar ${isRightSidebarOpen ? "open" : "closed"}`}>
        <div className="profile-card">
          <div className="profile-avatar">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-icon">👤</span>
            )}
          </div>
          <h3>{user.name || "Company Profile"}</h3>
          <p className="profile-role">{user.role}</p>
          <p className="profile-email">{user.email}</p>

          {user.role === "instructor" && (
            <button
              className="profile-card__button"
              onClick={() => { setActivePage("ipage1"); setIsRightSidebarOpen(false); }}
            >
              See full profile
            </button>
          )}
        </div>

        <div className="sidebar-actions">
  {user.role !== 'admin' && (
    <button className="sidebar-profile-btn" onClick={handleProfilePicUploadClick}>
      <span className="sidebar-btn-icon">📷</span>
      <span>Add Profile Pic</span>
    </button>
  )}
  
  {user.role !== 'admin' && profilePicture && (
    <button className="sidebar-remove-btn" onClick={handleRemoveProfilePic}>
      <span className="sidebar-btn-icon">🗑️</span>
      <span>Remove Profile Pic</span>
    </button>
  )}
  

  
  {/* Company Profile Button - Only visible for employer role */}
  {user.role === 'employer' && (
    <button
      className="sidebar-profile-btn"
      onClick={() => { setActivePage("profile"); setIsRightSidebarOpen(false); }}
      style={{
        background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent-dark))',
        color: 'white',
        border: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.filter = 'brightness(1.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
    >
      <span className="sidebar-btn-icon">🏢</span>
      <span>Company Profile</span>
    </button>
  )}

  <input
    type="file"
    ref={fileInputRef}
    accept="image/*"
    onChange={handleProfilePicSelected}
    style={{ display: 'none' }}
  />
</div>
          
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <span className="sidebar-btn-icon">🔓</span>
            <span>Logout</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfilePicSelected}
        />
      </div>

      {/* NOTIFICATION POPUP */}
      {isNotificationOpen && (
        <div className="notification-popup" onClick={(e) => e.stopPropagation()}>
          <div className="notification-header">
            <h3>Notifications</h3>
            <button className="mark-all-btn" onClick={markAllAsRead}>MARK ALL AS READ</button>
            <button className="close-notification" onClick={() => setIsNotificationOpen(false)}>✕</button>
          </div>
          <div className="notification-list">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.read ? "unread" : ""}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="notification-icon">{notif.icon}</div>
                <div className="notification-content">
                  <div className="notification-title">{notif.title}</div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">{notif.time}</div>
                </div>
                {!notif.read && <div className="unread-dot"></div>}
              </div>
            ))}
            {notifications.length > 5 && (
              <div className="view-all-notifications" onClick={openNotificationsPage}>
                View all notifications →
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;