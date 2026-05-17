// TaskFeedback.jsx
import React, { useEffect, useMemo, useState } from 'react';

const tasksCommentsStorageKey = 'guc-portfolio-tasks-comments';
const tasksProgressStorageKey = 'guc-portfolio-tasks-progress';

const createTasks = () => [
  {
    id: 'task_001',
    projectType: 'Course Project',
    projectName: 'Smart Campus App',
    taskTitle: 'Implement authentication flow for student portal',
    description: 'Add secure login, role-based access, and session management.',
    progress: 'Initial scaffolding done. Login form created.',
    comments: [],
  },
  {
    id: 'task_002',
    projectType: 'Bachelor Project',
    projectName: 'AI Chatbot Thesis',
    taskTitle: 'Prepare dataset and evaluation pipeline',
    description: 'Collect conversational logs, annotate intents and prepare metrics.',
    progress: 'Dataset collection in progress; 60% complete.',
    comments: [],
  },
  {
    id: 'task_003',
    projectType: 'Course Project',
    projectName: 'Network Visualizer',
    taskTitle: 'Add animated topology rendering',
    description: 'Render dynamic topology with node/link animations and status indicators.',
    progress: 'Prototype working with static data.',
    comments: [],
  },
];

const CommentSection = ({ taskId, comments, onAdd, onEdit, onRemove }) => {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(taskId, text.trim());
    setText('');
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditingText(c.text);
  };

  const saveEdit = (id) => {
    if (!editingText.trim()) return;
    onEdit(taskId, id, editingText.trim());
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div style={{ marginTop: 'var(--sp-5)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--c-border)' }}>
      <h4 className="section-label" style={{ marginBottom: 'var(--sp-3)', textAlign: 'left' }}>Instructor Feedback</h4>

      <form onSubmit={handleAdd} style={{ marginBottom: 'var(--sp-4)' }}>
        <textarea
          className="sp__search-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add feedback or comment on this task..."
          rows={3}
          style={{ width: '100%', marginBottom: 'var(--sp-2)' }}
        />
        <button className="btn-primary" type="submit">Add Comment</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {comments.length === 0 ? (
          <p className="empty-state-subtitle">No feedback yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="card" style={{ padding: 'var(--sp-4)' }}>
              {editingId === c.id ? (
                <div>
                  <textarea
                    className="sp__search-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    style={{ width: '100%', marginBottom: 'var(--sp-2)' }}
                  />
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <button className="btn-primary" onClick={() => saveEdit(c.id)} type="button">Save</button>
                    <button className="btn-secondary" onClick={() => setEditingId(null)} type="button">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                    <span className="badge badge--primary">Instructor</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--c-muted)' }}>{new Date(c.date).toLocaleString()}</span>
                  </div>
                  <p style={{ color: 'var(--c-text-2)', marginBottom: 'var(--sp-3)', lineHeight: 1.5 }}>{c.text}</p>
                  <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                    <button className="btn-secondary" onClick={() => startEdit(c)} type="button" style={{ minWidth: 'auto', padding: '4px 12px' }}>Edit</button>
                    <button className="btn-danger" onClick={() => onRemove(taskId, c.id)} type="button" style={{ minWidth: 'auto', padding: '4px 12px' }}>Remove</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TaskFeedback = ({ user }) => {
  const initialTasks = useMemo(() => createTasks(), []);
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    try {
      const storedComments = window.localStorage.getItem(tasksCommentsStorageKey);
      const storedProgress = window.localStorage.getItem(tasksProgressStorageKey);
      const commentsMap = storedComments ? JSON.parse(storedComments) : {};
      const progressMap = storedProgress ? JSON.parse(storedProgress) : {};

      setTasks((prev) =>
        prev.map((t) => ({
          ...t,
          comments: commentsMap[t.id] || t.comments || [],
          progress: progressMap[t.id] ?? t.progress,
        }))
      );
    } catch (error) {
      console.warn('Failed to restore task state:', error);
    }
  }, []);

  useEffect(() => {
    try {
      const commentsOut = {};
      const progressOut = {};
      tasks.forEach((t) => {
        if (t.comments && t.comments.length) commentsOut[t.id] = t.comments;
        if (t.progress) progressOut[t.id] = t.progress;
      });
      window.localStorage.setItem(tasksCommentsStorageKey, JSON.stringify(commentsOut));
      window.localStorage.setItem(tasksProgressStorageKey, JSON.stringify(progressOut));
    } catch (error) {
      console.warn('Failed to persist task state:', error);
    }
  }, [tasks]);

  const addComment = (taskId, text) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: [
                ...t.comments,
                { id: `${Date.now()}-${Math.random()}`, text, date: new Date().toISOString() },
              ],
            }
          : t
      )
    );
  };

  const editComment = (taskId, commentId, newText) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, comments: t.comments.map((c) => (c.id === commentId ? { ...c, text: newText, date: new Date().toISOString() } : c)) }
          : t
      )
    );
  };

  const removeComment = (taskId, commentId) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) } : t)));
  };

  return (
    <div className="dashboard">
      <div className="dashboard__page">
        <h1 className="cm__heading">Task Feedback</h1>

        <div>
          <div className="section-label" style={{ marginBottom: 'var(--sp-4)', textAlign: 'left' }}>Open Tasks</div>
          <div className="internships-grid">
            {tasks.map((task) => (
              <div key={task.id} className="internship-card">
                <div className="internship-header">
                  <h3>{task.taskTitle}</h3>
                  <span className="badge badge--primary">{task.projectType}</span>
                </div>

                <div className="company-name" style={{ marginTop: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
                  <strong>Project:</strong> {task.projectName}
                </div>

                <p className="description"><strong>Task Description:</strong> {task.description}</p>

                <div className="application-info" style={{ marginBottom: 'var(--sp-4)' }}>
                  <strong>Progress (reported by student)</strong>
                  <p style={{ marginTop: 'var(--sp-2)', marginBottom: 0, whiteSpace: 'pre-wrap' }}>{task.progress || 'No progress reported yet.'}</p>
                </div>

                <CommentSection
                  taskId={task.id}
                  comments={task.comments || []}
                  onAdd={addComment}
                  onEdit={editComment}
                  onRemove={removeComment}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFeedback;