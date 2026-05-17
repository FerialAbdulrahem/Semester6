// CourseInstructorProfile.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { instructorProfileData } from '../../data/DummyData';

const storageKey = 'guc-portfolio-instructor-profile';

const createInitialProfile = (user) => ({
  ...instructorProfileData,
  name: user?.name || instructorProfileData.name,
  email: user?.email || instructorProfileData.email,
  biography:
    'I teach software engineering and guide students through applied project work, design reviews, and research-led development.',
  researchInterests: [
    'Human-centered software engineering',
    'Educational technology',
    'Applied web systems'
  ],
  educationBackground: [
    {
      id: 'edu-1',
      degree: 'PhD in Software Engineering',
      institution: 'German University in Cairo',
      year: '2018'
    },
    {
      id: 'edu-2',
      degree: 'MSc in Computer Science',
      institution: 'Cairo University',
      year: '2013'
    }
  ]
});

const CourseInstructorProfile = ({ user }) => {
  const initialProfile = useMemo(() => createInitialProfile(user), [user]);
  const [profile, setProfile] = useState(initialProfile);
  const [bioDraft, setBioDraft] = useState(initialProfile.biography);
  const [interestDraft, setInterestDraft] = useState('');
  const [educationDraft, setEducationDraft] = useState({ degree: '', institution: '', year: '' });
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [educationEditDraft, setEducationEditDraft] = useState({ degree: '', institution: '', year: '' });

  useEffect(() => {
    try {
      const storedProfile = window.localStorage.getItem(storageKey);
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile({ ...initialProfile, ...parsedProfile });
        setBioDraft(parsedProfile.biography || initialProfile.biography);
      }
    } catch (error) {
      console.warn('Unable to load instructor profile state:', error);
    }
  }, [initialProfile]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(profile));
    } catch (error) {
      console.warn('Unable to persist instructor profile state:', error);
    }
  }, [profile]);

  const updateProfileField = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));


  };

  const handleBiographySave = (event) => {
    event.preventDefault();
    updateProfileField('biography', bioDraft.trim());
  };

  const handleBiographyRemove = () => {
    setBioDraft('');
    updateProfileField('biography', '');
  };

  const handleAddInterest = (event) => {
    event.preventDefault();
    const nextInterest = interestDraft.trim();
    if (!nextInterest) {
      return;
    }

    if (profile.researchInterests.includes(nextInterest)) {
      setInterestDraft('');
      return;
    }

    updateProfileField('researchInterests', [...profile.researchInterests, nextInterest]);
    setInterestDraft('');
  };

  const handleRemoveInterest = (interestToRemove) => {
    updateProfileField(
      'researchInterests',
      profile.researchInterests.filter((interest) => interest !== interestToRemove)
    );
  };

  const handleAddEducation = (event) => {
    event.preventDefault();
    const degree = educationDraft.degree.trim();
    const institution = educationDraft.institution.trim();
    const year = educationDraft.year.trim();

    if (!degree || !institution || !year) {
      return;
    }

    updateProfileField('educationBackground', [
      ...profile.educationBackground,
      {
        id: `${Date.now()}`,
        degree,
        institution,
        year,
      },
    ]);
    setEducationDraft({ degree: '', institution: '', year: '' });
  };

  const startEditingEducation = (entry) => {
    setEditingEducationId(entry.id);
    setEducationEditDraft({
      degree: entry.degree,
      institution: entry.institution,
      year: entry.year,
    });
  };

  const handleEducationEditChange = (field, value) => {
    setEducationEditDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEducationSave = (educationId) => {
    updateProfileField(
      'educationBackground',
      profile.educationBackground.map((entry) =>
        entry.id === educationId
          ? {
              ...entry,
              ...educationEditDraft,
            }
          : entry
      )
    );
    setEditingEducationId(null);
  };

  const handleRemoveEducation = (educationId) => {
    updateProfileField(
      'educationBackground',
      profile.educationBackground.filter((entry) => entry.id !== educationId)
    );
    if (editingEducationId === educationId) {
      setEditingEducationId(null);
    }
  };



  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="container" style={{ maxWidth: '1300px', margin: '0 auto', padding: 'var(--sp-8)' }}>
      <div className="card" style={{ marginBottom: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <span className="badge badge--primary" style={{ marginBottom: 'var(--sp-2)', display: 'inline-block' }}>Instructor profile</span>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.75rem', fontWeight: '700', color: 'var(--c-text)', margin: 'var(--sp-2) 0' }}>{profile.name}</h1>
            <p style={{ color: 'var(--c-text-2)', margin: 'var(--sp-1) 0' }}><strong>{profile.title}</strong> - {profile.department}</p>
            <p style={{ color: 'var(--c-text-2)', margin: 'var(--sp-1) 0' }}>{profile.email}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
        {/* Biography Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: '700', color: 'var(--c-text)', margin: 0 }}>Biography</h3>
            <button className="btn-danger" type="button" onClick={handleBiographyRemove} style={{ padding: '6px 12px', minWidth: 'auto' }}>
              Remove
            </button>
          </div>
          <form onSubmit={handleBiographySave}>
            <textarea
              className="sp__search-input"
              style={{ width: '100%', minHeight: '120px', marginBottom: 'var(--sp-4)' }}
              value={bioDraft}
              onChange={(event) => setBioDraft(event.target.value)}
              placeholder="Write a short biography"
              rows="5"
            />
            <div>
              <button className="btn-primary" type="submit">
                Update biography
              </button>
            </div>
          </form>
          <p style={{ color: 'var(--c-text-2)', marginTop: 'var(--sp-4)', lineHeight: 1.6 }}>{profile.biography || 'No biography added yet.'}</p>
        </div>

        {/* Research Interests Section */}
        <div className="card">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: '700', color: 'var(--c-text)', marginBottom: 'var(--sp-4)' }}>Research interests</h3>
          <form onSubmit={handleAddInterest} style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <input
              className="sp__search-input"
              type="text"
              style={{ flex: 1 }}
              value={interestDraft}
              onChange={(event) => setInterestDraft(event.target.value)}
              placeholder="Add a research interest"
            />
            <button className="btn-primary" type="submit">
              Add
            </button>
          </form>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {profile.researchInterests.length === 0 ? (
              <p style={{ color: 'var(--c-muted)', fontStyle: 'italic' }}>No research interests yet.</p>
            ) : (
              profile.researchInterests.map((interest) => (
                <div key={interest} className="skill-badge" style={{ gap: 'var(--sp-2)' }}>
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: 'var(--sp-2)' }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Education Background Section */}
        <div className="card">
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: '700', color: 'var(--c-text)', marginBottom: 'var(--sp-4)' }}>Education background</h3>
          <form onSubmit={handleAddEducation} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr auto', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)', alignItems: 'center' }}>
            <input
              className="sp__search-input"
              type="text"
              value={educationDraft.degree}
              onChange={(event) => setEducationDraft((current) => ({ ...current, degree: event.target.value }))}
              placeholder="Degree"
            />
            <input
              className="sp__search-input"
              type="text"
              value={educationDraft.institution}
              onChange={(event) => setEducationDraft((current) => ({ ...current, institution: event.target.value }))}
              placeholder="Institution"
            />
            <input
              className="sp__search-input"
              type="text"
              value={educationDraft.year}
              onChange={(event) => setEducationDraft((current) => ({ ...current, year: event.target.value }))}
              placeholder="Year"
            />
            <button className="btn-primary" type="submit" style={{ whiteSpace: 'nowrap' }}>
              Add education
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {profile.educationBackground.length === 0 ? (
              <p style={{ color: 'var(--c-muted)', fontStyle: 'italic' }}>No education entries yet.</p>
            ) : (
              profile.educationBackground.map((entry) => (
                <div key={entry.id} className="card" style={{ padding: 'var(--sp-4)' }}>
                  {editingEducationId === entry.id ? (
                    <div>
                      <input
                        className="sp__search-input"
                        type="text"
                        style={{ width: '100%', marginBottom: 'var(--sp-2)' }}
                        value={educationEditDraft.degree}
                        onChange={(event) => handleEducationEditChange('degree', event.target.value)}
                        placeholder="Degree"
                      />
                      <input
                        className="sp__search-input"
                        type="text"
                        style={{ width: '100%', marginBottom: 'var(--sp-2)' }}
                        value={educationEditDraft.institution}
                        onChange={(event) => handleEducationEditChange('institution', event.target.value)}
                        placeholder="Institution"
                      />
                      <input
                        className="sp__search-input"
                        type="text"
                        style={{ width: '100%', marginBottom: 'var(--sp-3)' }}
                        value={educationEditDraft.year}
                        onChange={(event) => handleEducationEditChange('year', event.target.value)}
                        placeholder="Year"
                      />
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <button className="btn-primary" type="button" onClick={() => handleEducationSave(entry.id)}>
                          Save
                        </button>
                        <button className="btn-secondary" type="button" onClick={() => setEditingEducationId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
                      <div>
                        <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: '0.95rem', fontWeight: '700', color: 'var(--c-text)', marginBottom: 'var(--sp-1)' }}>{entry.degree}</h4>
                        <p style={{ color: 'var(--c-text-2)', marginBottom: 'var(--sp-1)' }}>{entry.institution}</p>
                        <span className="badge">{entry.year}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                        <button className="btn-secondary" type="button" onClick={() => startEditingEducation(entry)} style={{ minWidth: 'auto', padding: '6px 12px' }}>
                          ✏️ Update
                        </button>
                        <button className="btn-danger" type="button" onClick={() => handleRemoveEducation(entry.id)} style={{ minWidth: 'auto', padding: '6px 12px' }}>
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInstructorProfile;