// ADMIN/Notifications.jsx
import React from 'react';

const Notifications = ({ notifs, setNotifs, markOneRead, setActivePage }) => {
  
  // Local state to track read/unread if needed
 

  // Helper function to get icon based on type
  const getIcon = (type) => {
    switch(type) {
      case 'link': return '🔗';
      case 'unlink': return '📎';
      case 'internship_accepted': return '✅';
      case 'internship_rejected': return '❌';
      case 'project_feedback': return '📝';
      case 'task_comment': return '💬';
      case 'project_flagged': return '⚠️';
      case 'project_invitation': return '📨';
      case 'private_message': return '💬';
      default: return '🔔';
    }
  };

  // Handle mark as read
  const handleMarkAsRead = (id) => {
    if (markOneRead) {
      markOneRead(id);
    } else {
      setNotifs(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    }
  };

  // Handle mark as unread
  const handleMarkAsUnread = (id) => {
    setNotifs(prev => prev.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  };

  // Helper to format message with colored link/unlink text
  const formatMessage = (notif) => {
    let message = '';
    let action = '';
    
    if (notif.type === 'link') {
      message = `${notif.instructor} (${notif.email}) requested to `;
      action = 'link';
    } else if (notif.type === 'unlink') {
      message = `${notif.instructor} (${notif.email}) requested to `;
      action = 'unlink';
    } else if (notif.message) {
      return notif.message;
    } else {
      return 'You have a new notification';
    }
    
    const status = notif.status;
    
    return (
      <span>
        {message}
        <span style={{ 
          color: notif.type === 'link' ? '#10b981' : '#f59e0b',
          fontWeight: 600,
          backgroundColor: notif.type === 'link' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {action}
        </span>
        {` ${notif.course}`}
        {status === 'approved' && <span style={{ color: '#10b981', marginLeft: '8px' }}>✓ Approved</span>}
        {status === 'rejected' && <span style={{ color: '#ef4444', marginLeft: '8px' }}>✗ Rejected</span>}
        {status === 'accepted' && <span style={{ color: '#10b981', marginLeft: '8px' }}></span>}
      </span>
    );
  };

  // If no notifications
  if (!notifs || notifs.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard__page">
          <h1 className="cm__heading">Notifications</h1>
          <div className="no-notifications">
            <span>🔔</span>
            <p>No notifications yet</p>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        <h1 className="cm__heading">Notifications</h1>

        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p className="section-label" style={{ marginTop: 'var(--sp-5)' }}>Your Notifications ({unreadCount} unread)</p>
            <button 
              className="mark-all-btn" 
              onClick={() => {
                setNotifs(prev => prev.map(n => ({ ...n, read: true })));
              }}
            >
              Mark All as Read
            </button>
          </div>

          <div className="notification-list">
            {notifs.map((notif) => {
              const time = notif.time || notif.date || new Date().toISOString();
              const isRead = notif.read || false;
              
              return (
                <div
                  key={notif.id}
                  className={`notification-item ${!isRead ? "unread" : ""}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="notification-icon" style={{ fontSize: '24px' }}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="notification-content" style={{ flex: 1 }}>
                    <div className="notification-title" style={{ fontWeight: 500, marginBottom: '4px', lineHeight: '1.5' }}>
                      {formatMessage(notif)}
                    </div>
                    <div className="notification-time" style={{ fontSize: '12px', color: 'var(--c-muted)' }}>
                      {typeof time === 'string' && time.includes('-') ? time : new Date(time).toLocaleDateString()}
                    </div>
                  </div>
                  {!isRead && <div className="unread-dot"></div>}
                  <div className="notification-actions">
                    {isRead ? (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleMarkAsUnread(notif.id);
                        }} 
                        className="action-btn" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Mark Unread
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleMarkAsRead(notif.id);
                        }} 
                        className="action-btn" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;