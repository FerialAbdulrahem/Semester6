const StudentNotification = ({ user, notifications, setNotifications, notificationsEnabled, setNotificationsEnabled }) => {

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAsUnread = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleNotifications = () => {
    if (setNotificationsEnabled) {
      setNotificationsEnabled(prev => !prev);
    }
  };

  const isEnabled = notificationsEnabled !== undefined ? notificationsEnabled : true;
  const unreadCount = notifications.filter(n => !n.read).length;

  // Helper to get icon based on notification type
  const getIcon = (type) => {
    switch(type) {
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

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        <h1 className="cm__heading">Notifications</h1>

        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p className="section-label">Your Notifications ({unreadCount} unread)</p>
            <div>
              <button className="mark-all-btn" onClick={markAllAsRead} style={{ marginRight: '10px' }}>
                Mark All as Read
              </button>
              <button className="mark-all-btn" onClick={toggleNotifications}>
                {isEnabled ? '🔕 Turn Off Notifications' : '🔔 Turn On Notifications'}
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="no-notifications">
              <span>🔔</span>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? "unread" : ""}`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="notification-icon" style={{ fontSize: '24px' }}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="notification-content" style={{ flex: 1 }}>
                    <div className="notification-title" style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {notif.message}
                    </div>
                    <div className="notification-time" style={{ fontSize: '12px', color: 'var(--c-muted)' }}>
                      {new Date(notif.date).toLocaleDateString()}
                    </div>
                  </div>
                  {!notif.read && <div className="unread-dot"></div>}
                  <div className="notification-actions">
                    {notif.read ? (
                      <button onClick={(e) => { e.stopPropagation(); markAsUnread(notif.id); }} className="action-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        Mark Unread
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="action-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotification;