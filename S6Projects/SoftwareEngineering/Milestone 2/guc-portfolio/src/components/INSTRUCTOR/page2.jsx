// page2.jsx
import React, { useEffect, useMemo, useState } from 'react';

const instructorCoursesStorageKey = 'guc-portfolio-instructor-linked-courses';

const createItems = () => [
  {
    id: 'csen701',
    itemKind: 'course',
    name: 'Software Engineering',
    code: 'CSEN701',
    creditHours: 3,
  },
  {
    id: 'csen601',
    itemKind: 'course',
    name: 'Computer Networks',
    code: 'CSEN601',
    creditHours: 3,
  },
  {
    id: 'topic_001',
    itemKind: 'bachelor',
    topicName:
      'Adaptive Federated Learning Architectures for Privacy-Preserving Clinical Decision Support in Resource-Constrained Hospitals',
    description:
      'This topic investigates how federated learning can improve medical decision support accuracy while preserving patient privacy and operating efficiently in hospitals with limited compute resources.',
  },
  {
    id: 'topic_002',
    itemKind: 'bachelor',
    topicName:
      'Explainable Multimodal Transformers for Early Detection of Infrastructure Failure in Smart Urban Transportation Systems',
    description:
      'This topic explores interpretable AI models that combine sensor streams, text logs, and image data to predict and explain critical failures before they happen in smart city transport networks.',
  },
];

const ALWAYS_LINKED_IDS = ['topic_001', 'topic_002'];

const Page2 = ({ user }) => {
  const items = useMemo(() => createItems(), []);
  const [linkedCourseIds, setLinkedCourseIds] = useState([]);

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem(instructorCoursesStorageKey);
      if (savedValue) {
        const parsed = JSON.parse(savedValue);
        if (Array.isArray(parsed)) {
          const mergedIds = [...new Set([...parsed, ...ALWAYS_LINKED_IDS])];
          setLinkedCourseIds(mergedIds);
          return;
        }
      }
    } catch (error) {
      console.warn('Unable to restore linked courses:', error);
    }

    setLinkedCourseIds(['csen701', 'csen601', 'topic_001', 'topic_002']);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        instructorCoursesStorageKey,
        JSON.stringify(linkedCourseIds)
      );
    } catch (error) {
      console.warn('Unable to persist linked courses:', error);
    }
  }, [linkedCourseIds]);

  const toggleLink = (id) => {
    if (ALWAYS_LINKED_IDS.includes(id)) {
      return;
    }
    
    setLinkedCourseIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((i) => i !== id)
        : [...prevIds, id]
    );
  };

  const linkedCount = linkedCourseIds.length;

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        <h1 className="cm__heading">Courses/Projects</h1>

        <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
          <p style={{ margin: 0 }}><strong>{user?.name || 'Instructor'}</strong> is currently linked to <strong className="stat-value" style={{ fontSize: '1.2rem' }}>{linkedCount}</strong> {linkedCount === 1 ? 'item' : 'items'}.</p>
        </div>

        <div className="internships-grid">
          {items.map((item) => {
            const isLinked = linkedCourseIds.includes(item.id);
            const isCourseItem = item.itemKind === 'course';
            const isBachelorItem = item.itemKind === 'bachelor';
            const title = isCourseItem ? item.name : item.topicName;
            const typeLabel = isCourseItem ? 'Course' : 'Bachelor Project';

            return (
              <div key={item.id} className="internship-card">
                <div className="internship-header">
                  <h3>{title}</h3>
                  <span className={`badge ${isLinked ? 'badge--green' : 'badge--red'}`}>
                    {isLinked ? 'Linked ✓' : 'Not linked'}
                  </span>
                </div>

                <div style={{ marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                  {isCourseItem && (
                    <>
                      <p><strong>Course Code:</strong> {item.code}</p>
                      <p><strong>Credit Hours:</strong> {item.creditHours}</p>
                    </>
                  )}
                  {isBachelorItem && (
                    <p className="description">{item.description}</p>
                  )}
                  <p><strong>Type:</strong> {typeLabel}</p>
                </div>

                {isCourseItem && (
                  <button
                    className={isLinked ? "btn-danger" : "btn-primary"}
                    type="button"
                    onClick={() => toggleLink(item.id)}
                    style={{ width: '100%' }}
                  >
                    {isLinked ? `Unlink ${typeLabel}` : `Link ${typeLabel}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Page2;