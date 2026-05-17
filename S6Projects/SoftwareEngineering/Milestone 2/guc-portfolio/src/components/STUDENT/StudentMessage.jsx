import React, { useState, useEffect, useCallback } from 'react';
import { USERS, COURSE_INSTRUCTORS } from '../../data/Data.js';

const StudentMessage = ({ user, onMessageUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedNewRecipient, setSelectedNewRecipient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, partner: null });

  // Generate sample messages based on user role
  const generateSampleMessages = useCallback(() => {
    const allUsers = [...USERS, ...COURSE_INSTRUCTORS].filter(u => u.id !== user.id && u.role !== 'Administrator' && u.role !== 'admin');
    if (allUsers.length === 0) return [];
    
    const sampleMessages = [];
    
    // Take up to 3 random users to create sample conversations
    const usersToChat = allUsers.slice(0, 3);
    
    usersToChat.forEach((partner, index) => {
      const partnerName = partner.name || `${partner.firstName} ${partner.lastName}`;
      const partnerRole = partner.role || 'User';
      
      // Message FROM partner TO current user
      let incomingMessage = "";
      let outgoingMessage = "";
      let incomingSubject = "";
      let outgoingSubject = "";
      
      // Role-based message content
      if (user.role === 'student') {
        if (partnerRole === 'instructor') {
          incomingMessage = index === 0 ? "Your project proposal looks good. Can you submit it by Friday?" : "I've reviewed your latest assignment. Great progress!";
          outgoingMessage = index === 0 ? "Yes, I'll have it submitted by Friday. Thank you!" : "Thank you for the feedback! I'll work on the improvements.";
          incomingSubject = `Course Update from ${partnerName}`;
          outgoingSubject = `Re: Course Update from ${partnerName}`;
        } else if (partnerRole === 'employer') {
          incomingMessage = "We received your internship application. When are you available for an interview?";
          outgoingMessage = "Thank you for considering my application! I'm available for an interview any day next week.";
          incomingSubject = `Internship Opportunity at ${partnerName}`;
          outgoingSubject = `Re: Internship Opportunity at ${partnerName}`;
        } else {
          incomingMessage = index === 0 ? "Hey! Want to work together on the group project?" : "Did you finish the assignment for next week?";
          outgoingMessage = index === 0 ? "Sure! That sounds great. Let's meet tomorrow to discuss." : "Almost done! Just need to review a few things.";
          incomingSubject = `Project Collaboration`;
          outgoingSubject = `Re: Project Collaboration`;
        }
      } 
      else if (user.role === 'instructor') {
        if (partnerRole === 'student') {
          incomingMessage = index === 0 ? "Professor, I'm struggling with the latest assignment. Can you help?" : "When is the deadline for the project submission?";
          outgoingMessage = index === 0 ? "Of course. Come to my office hours tomorrow and we'll go over it." : "The deadline is next Friday at 11:59 PM.";
          incomingSubject = `Course Question`;
          outgoingSubject = `Re: Course Question`;
        } else {
          incomingMessage = "Please submit your course syllabus by the end of the week.";
          outgoingMessage = "I'll have the syllabus ready by Thursday. Thanks for the reminder.";
          incomingSubject = `Course Documentation Required`;
          outgoingSubject = `Re: Course Documentation Required`;
        }
      } 
      else if (user.role === 'employer') {
        if (partnerRole === 'student') {
          incomingMessage = index === 0 ? "Hello, I'm very interested in the internship position at your company. Are you still accepting applications?" : "I just submitted my application for the software developer role. Looking forward to hearing from you!";
          outgoingMessage = index === 0 ? "Yes, we're still accepting applications. Please send your resume and portfolio." : "Thank you for your application. We'll review it and get back to you within a week.";
          incomingSubject = `Job Application Inquiry`;
          outgoingSubject = `Re: Job Application Inquiry`;
        } else {
          incomingMessage = "Your job posting has been approved and is now live on the platform.";
          outgoingMessage = "Great, thank you for the approval! When can I expect to see applications?";
          incomingSubject = `Job Posting Approved`;
          outgoingSubject = `Re: Job Posting Approved`;
        }
      } 
      else {
        // Admin or other roles
        if (partnerRole === 'instructor') {
          incomingMessage = index === 0 ? "I've submitted the new course proposal. Please review it when you have time." : "Can you approve the room change for my Wednesday class?";
          outgoingMessage = index === 0 ? "I've received your proposal. I'll review it by tomorrow." : "Room change has been approved. You'll receive a confirmation email shortly.";
          incomingSubject = `Course Approval Request`;
          outgoingSubject = `Re: Course Approval Request`;
        } else {
          incomingMessage = "We need to post a new job opening. Can you approve the posting?";
          outgoingMessage = "Please send me the job details and I'll approve it as soon as possible.";
          incomingSubject = `New Job Posting Request`;
          outgoingSubject = `Re: New Job Posting Request`;
        }
      }
      
      // Add incoming message
      sampleMessages.push({
        id: 1000 + index * 10 + 1,
        senderId: partner.id,
        receiverId: user.id,
        message: incomingMessage,
        subject: incomingSubject,
        timestamp: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        read: index === 0 ? false : true,
        senderName: partnerName,
        senderRole: partnerRole,
        type: 'message'
      });
      
      // Add outgoing reply
      sampleMessages.push({
        id: 1000 + index * 10 + 2,
        senderId: user.id,
        receiverId: partner.id,
        message: outgoingMessage,
        subject: outgoingSubject,
        timestamp: new Date(Date.now() - (index + 0.5) * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        senderName: user.name || `${user.firstName} ${user.lastName}` || "Current User",
        senderRole: user.role || "User",
        type: 'message'
      });
    });
    
    return sampleMessages;
  }, [user.id, user.role, user.name, user.firstName, user.lastName]);

  // Initialize messages with samples (no localStorage)
 useEffect(() => {
  try {
    const raw = localStorage.getItem(`messages_${user.id}`);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved) && saved.length > 0) {
        setMessages(saved);
        return;
      }
    }
  } catch (e) {}
  const samples = generateSampleMessages();
  setMessages(samples);
}, [generateSampleMessages, user.id]);

useEffect(() => {
  if (messages.length > 0) {
    localStorage.setItem(`messages_${user.id}`, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('messages-updated', { detail: { userId: user.id } }));
  }
}, [messages, user.id]);

  // Get all unique chat partners
  const getChatPartners = () => {
    const partnerIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId === user.id) {
        partnerIds.add(msg.receiverId);
      } else {
        partnerIds.add(msg.senderId);
      }
    });
    
    return Array.from(partnerIds).map(id => {
      const partner = getAllUsers().find(u => u.id === id);
      const unreadCount = messages.filter(m => 
        m.senderId === id && m.receiverId === user.id && !m.read
      ).length;
      const lastMessage = messages
        .filter(m => (m.senderId === id && m.receiverId === user.id) || (m.senderId === user.id && m.receiverId === id))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      
      return {
        id,
        name: partner?.name || `${partner?.firstName} ${partner?.lastName}` || 'Unknown',
        role: partner?.role || 'User',
        email: partner?.email || '',
        avatar: partner?.name?.charAt(0) || partner?.firstName?.charAt(0) || '?',
        unreadCount,
        lastMessage: lastMessage?.message || 'No messages yet',
        lastMessageTime: lastMessage?.timestamp || null,
        lastMessageSender: lastMessage?.senderId === user.id ? 'You: ' : ''
      };
    }).sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
  };

  // Delete entire chat conversation
  const deleteChat = (partnerId) => {
    const updatedMessages = messages.filter(msg => 
      !((msg.senderId === user.id && msg.receiverId === partnerId) ||
        (msg.senderId === partnerId && msg.receiverId === user.id))
    );
    
    setMessages(updatedMessages);
    
    if (selectedChat?.id === partnerId) {
      setSelectedChat(null);
    }
    
    setShowDeleteConfirm(false);
    setChatToDelete(null);
  };

  // Get conversation between current user and selected partner
  const getConversation = (partnerId) => {
    return messages
      .filter(msg => 
        (msg.senderId === user.id && msg.receiverId === partnerId) ||
        (msg.senderId === partnerId && msg.receiverId === user.id)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // Mark messages as read when opening a chat
  const markChatAsRead = (partnerId) => {
    setMessages(messages.map(msg => 
      (msg.senderId === partnerId && msg.receiverId === user.id && !msg.read)
        ? { ...msg, read: true }
        : msg
    ));
    
    // Trigger counter update in parent
    if (typeof onMessageUpdate === 'function') {
      onMessageUpdate();
    }
    
    // Also dispatch a custom event for the dashboard layout
    window.dispatchEvent(new CustomEvent('messages-updated', { 
      detail: { userId: user.id } 
    }));
  };

  // NEW: Toggle unread/read status for a chat
  const toggleReadStatus = (partnerId) => {
    const allMessagesFromPartner = messages.filter(msg => 
      msg.senderId === partnerId && msg.receiverId === user.id
    );
    
    // Check if all messages are read
    const allRead = allMessagesFromPartner.every(msg => msg.read === true);
    
    // Toggle: if all read, mark as unread; if any unread, mark as read
    const newReadStatus = !allRead;
    
    setMessages(messages.map(msg => 
      (msg.senderId === partnerId && msg.receiverId === user.id)
        ? { ...msg, read: newReadStatus }
        : msg
    ));
    
    // Trigger counter update in parent
    if (typeof onMessageUpdate === 'function') {
      onMessageUpdate();
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('messages-updated', { 
      detail: { userId: user.id } 
    }));
    
    // Close context menu
    setContextMenu({ visible: false, x: 0, y: 0, partner: null });
  };

  // Send a new message
  const sendMessage = () => {
    if (!newMessageText.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      senderId: user.id,
      receiverId: selectedChat.id,
      message: newMessageText,
      subject: `Chat with ${selectedChat.name}`,
      timestamp: new Date().toISOString(),
      read: false,
      senderName: user.name || `${user.firstName} ${user.lastName}`,
      senderRole: user.role || 'Student',
      type: 'message'
    };

    setMessages([...messages, newMessage]);
    setNewMessageText('');
    
    // Trigger counter update in parent
    if (typeof onMessageUpdate === 'function') {
      onMessageUpdate();
    }
    
    // Also dispatch a custom event for the dashboard layout
    window.dispatchEvent(new CustomEvent('messages-updated', { 
      detail: { userId: user.id } 
    }));
    
    setSelectedChat({
      ...selectedChat,
      lastMessage: newMessageText,
      lastMessageTime: new Date().toISOString(),
      lastMessageSender: 'You: '
    });
  };

  // Start a new conversation
  const startNewConversation = (recipient) => {
    const existingConversation = getChatPartners().find(p => p.id === recipient.id);
    
    if (existingConversation) {
      setSelectedChat(existingConversation);
      markChatAsRead(recipient.id);
    } else {
      const newPartner = {
        id: recipient.id,
        name: recipient.name || `${recipient.firstName} ${recipient.lastName}`,
        role: recipient.role,
        email: recipient.email,
        avatar: (recipient.name || recipient.firstName)?.charAt(0) || '?',
        unreadCount: 0,
        lastMessage: 'No messages yet',
        lastMessageTime: null,
        lastMessageSender: ''
      };
      
      setSelectedChat(newPartner);
    }
    
    setShowNewChatModal(false);
    setSelectedNewRecipient(null);
  };

  // Handle right-click context menu
  const handleContextMenu = (e, partner) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      partner: partner
    });
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0, partner: null });
    };
    
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  // Handle Enter key to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getAllUsers = () => {
    return [...USERS, ...COURSE_INSTRUCTORS].filter(u => u.id !== user.id && u.role !== 'Administrator' && u.role !== 'admin');
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const chatPartners = getChatPartners();
  const filteredPartners = chatPartners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadTotal = chatPartners.reduce((sum, partner) => sum + partner.unreadCount, 0);

  const availableUsers = getAllUsers().filter(user => 
    !chatPartners.some(partner => partner.id === user.id)
  );

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="cm__heading">Messages {unreadTotal > 0 && `(${unreadTotal} unread)`}</h1>
      </div>

      <div className="chat-container" style={{
        display: 'flex',
        height: 'calc(100vh - 200px)',
        minHeight: '500px',
        background: 'var(--c-surface)',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--sh-md)',
        border: '1px solid var(--c-border)'
      }}>
        {/* Chat Sidebar */}
        <div className="chat-sidebar" style={{
          width: '320px',
          borderRight: '1px solid var(--c-border)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--c-surface-2)'
        }}>
          {/* Search Bar */}
          <div style={{ padding: 'var(--sp-4)', borderBottom: '1px solid var(--c-border)' }}>
            <input
              type="text"
              placeholder="🔍 Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* New Message Button */}
          <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--c-border)' }}>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              + New Message
            </button>
          </div>

          {/* Chat List */}
          <div className="chat-list" style={{ flex: 1, overflowY: 'auto' }}>
            {filteredPartners.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-text-2)' }}>
                <span style={{ fontSize: '48px' }}>💬</span>
                <p style={{ marginTop: '12px' }}>No conversations yet</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="btn-primary"
                  style={{ marginTop: '12px' }}
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              filteredPartners.map(partner => (
                <div
                  key={partner.id}
                  style={{
                    position: 'relative',
                    borderBottom: '1px solid var(--c-border)',
                    transition: 'background var(--t-fast)'
                  }}
                >
                  <div
                    onClick={() => {
                      setSelectedChat(partner);
                      markChatAsRead(partner.id);
                    }}
                    onContextMenu={(e) => handleContextMenu(e, partner)}
                    style={{
                      padding: 'var(--sp-4)',
                      cursor: 'pointer',
                      background: selectedChat?.id === partner.id ? 'var(--c-primary-light)' : 'transparent',
                      transition: 'background var(--t-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedChat?.id !== partner.id) {
                        e.currentTarget.style.background = 'var(--c-surface-3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChat?.id !== partner.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--r-full)',
                        background: partner.unreadCount > 0 ? 'var(--c-primary)' : 'var(--c-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        {partner.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--c-text)' }}>{partner.name}</strong>
                          {partner.lastMessageTime && (
                            <span style={{ fontSize: '11px', color: 'var(--c-text-2)' }}>
                              {formatMessageTime(partner.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--c-text-2)', marginBottom: '4px' }}>
                          {partner.role}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: 'var(--c-text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          <span style={{ fontWeight: partner.unreadCount > 0 ? '500' : 'normal' }}>
                            {partner.lastMessageSender}{partner.lastMessage}
                          </span>
                        </div>
                      </div>
                    </div>
                    {partner.unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        right: '50px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'var(--c-primary)',
                        color: 'white',
                        borderRadius: 'var(--r-full)',
                        padding: '2px 8px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {partner.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  {/* Delete Chat Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(partner);
                      setShowDeleteConfirm(true);
                    }}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer',
                      color: 'var(--c-muted)',
                      padding: '8px',
                      borderRadius: 'var(--r-md)',
                      transition: 'all var(--t-fast)',
                      opacity: 0,
                      pointerEvents: 'none'
                    }}
                    className="delete-chat-btn"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--c-red-bg)';
                      e.currentTarget.style.color = '#fca5a5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--c-muted)';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--c-surface)'
        }}>
          {selectedChat ? (
            <>
              {/* Chat Header with Delete Option */}
              <div style={{
                padding: 'var(--sp-4) var(--sp-5)',
                borderBottom: '1px solid var(--c-border)',
                background: 'var(--c-surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--r-full)',
                    background: 'var(--c-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {selectedChat.avatar}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--c-text)' }}>{selectedChat.name}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-text-2)' }}>{selectedChat.role}</p>
                  </div>
                </div>
                
                {/* Delete Chat Button in Header */}
                <button
                  onClick={() => {
                    setChatToDelete(selectedChat);
                    setShowDeleteConfirm(true);
                  }}
                  className="btn-danger"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🗑️ Delete Conversation
                </button>
              </div>

              {/* Messages Area */}
              <div className="messages-area" style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--sp-5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'var(--c-surface)'
              }}>
                {getConversation(selectedChat.id).length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--c-muted)'
                  }}>
                    <span style={{ fontSize: '64px' }}>💬</span>
                    <p style={{ marginTop: '16px', fontSize: '16px' }}>No messages yet</p>
                    <p style={{ fontSize: '14px' }}>Send the first message to start the conversation!</p>
                  </div>
                ) : (
                  getConversation(selectedChat.id).map((msg, index) => {
                    const isOwnMessage = msg.senderId === user.id;
                    const conversation = getConversation(selectedChat.id);
                    const showDateSeparator = index === 0 || 
                      new Date(msg.timestamp).toDateString() !== new Date(conversation[index - 1]?.timestamp).toDateString();
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDateSeparator && (
                          <div style={{
                            textAlign: 'center',
                            margin: '8px 0 16px 0',
                            position: 'relative'
                          }}>
                            <span style={{
                              background: 'var(--c-surface-2)',
                              padding: '4px 12px',
                              borderRadius: 'var(--r-full)',
                              fontSize: '12px',
                              color: 'var(--c-text-2)'
                            }}>
                              {new Date(msg.timestamp).toDateString() === new Date().toDateString() 
                                ? 'Today' 
                                : new Date(msg.timestamp).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                        <div style={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          marginBottom: '4px'
                        }}>
                          <div style={{
                            maxWidth: '70%',
                            background: isOwnMessage ? 'var(--c-primary)' : 'var(--c-surface-2)',
                            color: isOwnMessage ? 'white' : 'var(--c-text)',
                            padding: '10px 14px',
                            borderRadius: isOwnMessage ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            wordWrap: 'break-word',
                            boxShadow: 'var(--sh-xs)'
                          }}>
                            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                              {msg.message}
                            </div>
                            <div style={{
                              fontSize: '10px',
                              marginTop: '4px',
                              color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'var(--c-muted)',
                              textAlign: 'right'
                            }}>
                              {formatMessageTime(msg.timestamp)}
                              {isOwnMessage && (
                                <span style={{ marginLeft: '4px' }}>
                                  {msg.read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div style={{
                padding: 'var(--sp-4) var(--sp-5)',
                borderTop: '1px solid var(--c-border)',
                background: 'var(--c-surface-2)'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <textarea
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedChat.name}...`}
                    rows="2"
                    className="search-input"
                    style={{
                        flex: 1,
                        resize: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessageText.trim()}
                    className="btn-primary"
                    style={{
                      opacity: newMessageText.trim() ? 1 : 0.5,
                      cursor: newMessageText.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-muted)',
              padding: '40px'
            }}>
              <span style={{ fontSize: '64px' }}>💬</span>
              <h3 style={{ marginTop: '16px', color: 'var(--c-text)' }}>Select a conversation</h3>
              <p style={{ fontSize: '14px' }}>Choose someone from the list or start a new chat</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="btn-primary"
                style={{ marginTop: '20px' }}
              >
                + New Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu for Read/Unread */}
      {contextMenu.visible && contextMenu.partner && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--c-surface)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-lg)',
            zIndex: 1000,
            minWidth: '180px',
            overflow: 'hidden',
            border: '1px solid var(--c-border-strong)'
          }}
        >
          <div
            onClick={() => toggleReadStatus(contextMenu.partner.id)}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background var(--t-fast)',
              color: 'var(--c-text)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--c-surface-2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--c-surface)'}
          >
            <span style={{ fontSize: '16px' }}>
              {messages.filter(msg => 
                msg.senderId === contextMenu.partner.id && 
                msg.receiverId === user.id && 
                !msg.read
              ).length > 0 ? '📖' : '🔴'}
            </span>
            <span>
              {messages.filter(msg => 
                msg.senderId === contextMenu.partner.id && 
                msg.receiverId === user.id && 
                !msg.read
              ).length > 0 ? 'Mark as read' : 'Mark as unread'}
            </span>
          </div>
          <div style={{ height: '1px', background: 'var(--c-border)' }}></div>
          <div
            onClick={() => {
              setChatToDelete(contextMenu.partner);
              setShowDeleteConfirm(true);
              setContextMenu({ visible: false, x: 0, y: 0, partner: null });
            }}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fca5a5',
              transition: 'background var(--t-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--c-red-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--c-surface)'}
          >
            <span>🗑️</span>
            <span>Delete conversation</span>
          </div>
        </div>
      )}

      {/* Delete Chat Confirmation Modal */}
      {showDeleteConfirm && chatToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Delete Conversation</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <span style={{ fontSize: '48px' }}>🗑️</span>
                <h3 style={{ margin: '16px 0 8px 0', color: 'var(--c-text)' }}>Delete chat with {chatToDelete.name}?</h3>
                <p style={{ color: 'var(--c-text-2)', fontSize: '14px' }}>
                  This will permanently delete all messages in this conversation. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => deleteChat(chatToDelete.id)} className="btn-danger">
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
         <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h2>Start New Conversation</h2>
              <button className="modal-close" onClick={() => setShowNewChatModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select a person to message:</label>
                <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: 'var(--sp-3)' }}>
                  {availableUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--c-text-2)' }}>
                      <span style={{ fontSize: '48px' }}>👥</span>
                      <p style={{ marginTop: '12px' }}>No other users available</p>
                      <p style={{ fontSize: '12px' }}>You've already messaged everyone!</p>
                    </div>
                  ) : (
                    availableUsers.map(recipient => (
                      <div
                        key={recipient.id}
                        onClick={() => setSelectedNewRecipient(recipient)}
                        style={{
                          padding: 'var(--sp-3)',
                          margin: '8px 0',
                          borderRadius: 'var(--r-lg)',
                          border: selectedNewRecipient?.id === recipient.id ? '2px solid var(--c-primary)' : '1px solid var(--c-border)',
                          cursor: 'pointer',
                          transition: 'all var(--t-fast)',
                          background: selectedNewRecipient?.id === recipient.id ? 'var(--c-primary-light)' : 'var(--c-surface)'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedNewRecipient?.id !== recipient.id) {
                            e.currentTarget.style.background = 'var(--c-surface-2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedNewRecipient?.id !== recipient.id) {
                            e.currentTarget.style.background = 'var(--c-surface)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--r-full)',
                            background: 'var(--c-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            {(recipient.name || recipient.firstName)?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: 'var(--c-text)' }}>
                              {recipient.name || `${recipient.firstName} ${recipient.lastName}`}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }}>{recipient.role}</div>
                            {recipient.email && (
                              <div style={{ fontSize: '11px', color: 'var(--c-muted)' }}>{recipient.email}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowNewChatModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => selectedNewRecipient && startNewConversation(selectedNewRecipient)} 
                className="btn-primary"
                disabled={!selectedNewRecipient}
                style={{
                  opacity: selectedNewRecipient ? 1 : 0.5,
                  cursor: selectedNewRecipient ? 'pointer' : 'not-allowed'
                }}
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add instructions tooltip */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'var(--c-surface-2)',
        color: 'var(--c-text-2)',
        padding: '8px 16px',
        borderRadius: 'var(--r-full)',
        fontSize: '12px',
        opacity: 0.7,
        pointerEvents: 'none',
        zIndex: 999,
        border: '1px solid var(--c-border)'
      }}>
        💡 Right-click on any chat to mark as read/unread
      </div>
    </div>
  );
};

export default StudentMessage;