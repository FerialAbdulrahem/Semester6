import React, { useState } from 'react';

const EmployerProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: user?.name || "TechCorp Egypt",
    email: user?.email || "contact@techcorp.com",
    phone: "+20 123 456 7890",
    website: "www.techcorp.com",
    industry: "Information Technology",
    founded: "2015",
    employeeCount: "50-100",
    bio: "TechCorp Egypt is a leading technology company specializing in software development, AI solutions, and digital transformation services.",
    address: "123 Nile Street, Cairo, Egypt",
    city: "Cairo",
    country: "Egypt",
    postalCode: "11511",
    location: {
      lat: 30.0444,
      lng: 31.2357
    }
  });

  const [formData, setFormData] = useState(companyData);
  const [searchLocation, setSearchLocation] = useState('');
  const [mapError, setMapError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCompanyData(formData);
    setIsEditing(false);
    setSaving(false);
    
    const successMsg = document.createElement('div');
    successMsg.className = 'safe-message';
    successMsg.textContent = '✓ Profile updated successfully!';
    successMsg.style.cssText = 'position:fixed; top:80px; right:20px; z-index:1000; padding:12px 20px; border-radius:8px; animation: fadeOut 3s forwards;';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
  };

  const handleCancel = () => {
    setFormData(companyData);
    setIsEditing(false);
    setMapError('');
  };

  const searchLocationOnMap = () => {
    if (!searchLocation.trim()) {
      setMapError('Please enter a location to search');
      return;
    }
    setMapError('');
    alert(`🔍 Searching for: "${searchLocation}"\n\nIn production, this would use Google Maps API to find and set your company location.`);
  };

  const InfoRow = ({ label, value }) => (
    <div className="info-row" style={styles.infoRow}>
      <span className="info-label" style={styles.infoLabel}>{label}:</span>
      <span className="info-value" style={styles.infoValue}>{value || '—'}</span>
    </div>
  );

  const employeeCounts = ["1-10", "11-50", "50-100", "100-500", "500+"];
  const industries = [
    "Information Technology", "Software Development", "Artificial Intelligence",
    "Cybersecurity", "Data Science", "Cloud Computing", "FinTech", "E-commerce",
    "Digital Marketing", "Consulting", "Education", "Healthcare"
  ];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      paddingBottom: '24px',
      borderBottom: '1px solid var(--c-border)',
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: '32px',
      fontWeight: 700,
      color: 'var(--c-text)',
      marginBottom: '12px',
      fontFamily: "'Sora', sans-serif",
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: '14px',
      color: 'var(--c-muted)',
      margin: 0,
      lineHeight: 1.5,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '40px',
    },
    statCard: {
      background: 'var(--c-surface)',
      border: '1px solid var(--c-border)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    },
    statIcon: {
      width: '52px',
      height: '52px',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '26px',
      flexShrink: 0,
    },
    statInfo: {
      flex: 1,
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 700,
      color: 'var(--c-text)',
      lineHeight: 1.2,
      marginBottom: '6px',
      fontFamily: "'Sora', sans-serif",
      letterSpacing: '-0.01em',
    },
    statLabel: {
      fontSize: '12px',
      color: 'var(--c-muted)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      lineHeight: 1.4,
    },
    section: {
      background: 'var(--c-surface)',
      border: '1px solid var(--c-border)',
      borderRadius: '20px',
      padding: '32px',
      marginBottom: '28px',
      transition: 'all 0.2s ease',
    },
    sectionTitle: {
      fontSize: '22px',
      fontWeight: 600,
      color: 'var(--c-text)',
      marginBottom: '28px',
      fontFamily: "'Sora', sans-serif",
      paddingBottom: '16px',
      borderBottom: '1px solid var(--c-border)',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '24px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    label: {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--c-text-2)',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      lineHeight: 1.4,
    },
    input: {
      padding: '12px 16px',
      border: '1px solid var(--c-border-strong)',
      borderRadius: '12px',
      background: 'var(--c-surface-2)',
      color: 'var(--c-text)',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      outline: 'none',
      lineHeight: 1.5,
    },
    textarea: {
      padding: '12px 16px',
      border: '1px solid var(--c-border-strong)',
      borderRadius: '12px',
      background: 'var(--c-surface-2)',
      color: 'var(--c-text)',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      outline: 'none',
      resize: 'vertical',
      minHeight: '120px',
      fontFamily: 'inherit',
      lineHeight: 1.6,
    },
    select: {
      padding: '12px 16px',
      border: '1px solid var(--c-border-strong)',
      borderRadius: '12px',
      background: 'var(--c-surface-2)',
      color: 'var(--c-text)',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      outline: 'none',
      cursor: 'pointer',
      lineHeight: 1.5,
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '12px',
    },
    infoRow: {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: '6px 0',
  borderBottom: '1px solid var(--c-border)',
  gap: '8px',
},
infoLabel: {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--c-accent)',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  lineHeight: 1.3,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
},
infoValue: {
  fontSize: '13px',
  color: 'var(--c-text)',
  fontWeight: 500,
  textAlign: 'left',
  lineHeight: 1.4,
  letterSpacing: '0.1px',
  wordBreak: 'break-word',
},
    fullWidth: {
      gridColumn: '1 / -1',
    },
    buttonGroup: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'flex-end',
      marginTop: '12px',
    },
    primaryButton: {
      padding: '12px 28px',
      background: 'linear-gradient(135deg, var(--c-primary), var(--c-accent-dark))',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      lineHeight: 1.5,
      letterSpacing: '0.3px',
    },
    secondaryButton: {
      padding: '12px 28px',
      background: 'var(--c-surface-2)',
      border: '1px solid var(--c-border-strong)',
      borderRadius: '12px',
      color: 'var(--c-text-2)',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      lineHeight: 1.5,
      letterSpacing: '0.3px',
    },
    saveButton: {
      padding: '12px 32px',
      background: 'linear-gradient(135deg, var(--c-green), #059669)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      lineHeight: 1.5,
      letterSpacing: '0.3px',
    },
    cancelButton: {
      padding: '12px 32px',
      background: 'var(--c-red-bg)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      borderRadius: '12px',
      color: '#fca5a5',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      lineHeight: 1.5,
      letterSpacing: '0.3px',
    },
    mapContainer: {
      marginTop: '24px',
      padding: '20px',
      background: 'var(--c-surface-2)',
      borderRadius: '14px',
      border: '1px solid var(--c-border)',
    },
    mapPlaceholder: {
      textAlign: 'center',
      marginBottom: '16px',
    },
    mapInstruction: {
      fontSize: '13px',
      color: 'var(--c-muted)',
      marginTop: '8px',
      lineHeight: 1.5,
    },
    errorMessage: {
      fontSize: '12px',
      color: '#fca5a5',
      marginTop: '10px',
      padding: '10px 14px',
      background: 'var(--c-red-bg)',
      borderRadius: '10px',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      lineHeight: 1.4,
    },
    locationSearch: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Company Profile</h1>
          <p style={styles.subtitle}>Manage your company information and location</p>
        </div>
        {!isEditing && (
          <button 
            style={styles.primaryButton}
            onClick={() => setIsEditing(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 22px rgba(59,130,246,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Stats Overview */}
      {!isEditing && (
        <div style={styles.statsGrid}>
          {[
            { icon: '🏢', label: 'Employees', value: companyData.employeeCount, color: '#3b82f6' },
            { icon: '📅', label: 'Founded', value: companyData.founded, color: '#10b981' },
            { icon: '💼', label: 'Industry', value: companyData.industry.split(' ')[0], color: '#a78bfa' },
            { icon: '📍', label: 'Location', value: companyData.city, color: '#f59e0b' },
          ].map((stat, idx) => (
            <div 
              key={idx}
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--c-primary-mid)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--c-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                ...styles.statIcon, 
                background: `rgba(${parseInt(stat.color.slice(1,3), 16)}, ${parseInt(stat.color.slice(3,5), 16)}, ${parseInt(stat.color.slice(5,7), 16)}, 0.1)` 
              }}>
                {stat.icon}
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Basic Information Section */}
      <div 
        style={styles.section}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--c-border-strong)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--c-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <h2 style={styles.sectionTitle}>Basic Information</h2>
        
        {isEditing ? (
          <>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Company Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+20 XXX XXX XXXX"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="www.company.com"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Industry</label>
                <select 
                  name="industry" 
                  value={formData.industry} 
                  onChange={handleInputChange}
                  style={styles.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Founded Year</label>
                <input
                  type="number"
                  name="founded"
                  value={formData.founded}
                  onChange={handleInputChange}
                  placeholder="YYYY"
                  min="1900"
                  max={new Date().getFullYear()}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Employee Count</label>
                <select 
                  name="employeeCount" 
                  value={formData.employeeCount} 
                  onChange={handleInputChange}
                  style={styles.select}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {employeeCounts.map(count => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Company Biography</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="5"
                placeholder="Tell us about your company mission, values, and culture..."
                style={styles.textarea}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </>
        ) : (
          <div style={styles.infoGrid}>
            <InfoRow label="Company Name" value={companyData.name} />
            <InfoRow label="Email" value={companyData.email} />
            <InfoRow label="Phone" value={companyData.phone} />
            <InfoRow label="Website" value={companyData.website} />
            <InfoRow label="Industry" value={companyData.industry} />
            <InfoRow label="Founded" value={companyData.founded} />
            <InfoRow label="Employee Count" value={companyData.employeeCount} />
            <div style={{ ...styles.infoRow, ...styles.fullWidth }}>
              <span style={styles.infoLabel}>Bio:</span>
              <span style={styles.infoValue}>{companyData.bio}</span>
            </div>
          </div>
        )}
      </div>

      {/* Address & Location Section */}
      <div 
        style={styles.section}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--c-border-strong)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--c-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <h2 style={styles.sectionTitle}>Address & Location</h2>
        
        {isEditing ? (
          <>
            <div style={styles.formGroup}>
              <label style={styles.label}>Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address, building, floor"
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Country</label>
                <input 
                  type="text" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleInputChange}
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Postal Code</label>
              <input 
                type="text" 
                name="postalCode" 
                value={formData.postalCode} 
                onChange={handleInputChange}
                style={styles.input}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Search Location on Map</label>
              <div style={styles.locationSearch}>
                <input
                  type="text"
                  placeholder="Enter city, address, or landmark..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocationOnMap()}
                  style={{ ...styles.input, flex: 1 }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button 
                  type="button" 
                  onClick={searchLocationOnMap}
                  style={styles.secondaryButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-primary-mid)';
                    e.currentTarget.style.color = '#93c5fd';
                    e.currentTarget.style.background = 'var(--c-primary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--c-border-strong)';
                    e.currentTarget.style.color = 'var(--c-text-2)';
                    e.currentTarget.style.background = 'var(--c-surface-2)';
                  }}
                >
                  🔍 Search
                </button>
              </div>
              {mapError && <div style={styles.errorMessage}>{mapError}</div>}
            </div>

            <div style={styles.mapContainer}>
              <div style={styles.mapPlaceholder}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📍</div>
                <p style={styles.mapInstruction}>
                  {formData.location.lat && formData.location.lng 
                    ? `📍 Selected Location: ${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`
                    : '🔍 Click "Search" to find and set your company location on the map'}
                </p>
              </div>
              <iframe
                title="company-location-map"
                width="100%"
                height="250"
                frameBorder="0"
                style={{ border: 0, borderRadius: '12px' }}
                src={`https://maps.google.com/maps?q=${formData.location.lat},${formData.location.lng}&z=15&output=embed`}
                allowFullScreen
              />
            </div>
          </>
        ) : (
          <div style={styles.infoGrid}>
            <InfoRow label="Address" value={companyData.address} />
            <InfoRow label="City" value={companyData.city} />
            <InfoRow label="Country" value={companyData.country} />
            <InfoRow label="Postal Code" value={companyData.postalCode} />
            <div style={{ ...styles.infoRow, ...styles.fullWidth }}>
              <span style={styles.infoLabel}>Map Location:</span>
              <div style={{ marginTop: '12px', width: '100%' }}>
                <iframe
                  title="company-location-preview"
                  width="100%"
                  height="220"
                  frameBorder="0"
                  style={{ border: 0, borderRadius: '12px' }}
                  src={`https://maps.google.com/maps?q=${companyData.location.lat},${companyData.location.lng}&z=15&output=embed`}
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div style={styles.buttonGroup}>
          <button 
            onClick={handleCancel}
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--c-red-bg)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
            }}
          >
            ❌ Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={styles.saveButton}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.filter = 'brightness(1.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {saving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; transform: translateX(0); }
          70% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
};

export default EmployerProfile;