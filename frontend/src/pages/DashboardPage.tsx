import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, handleApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AsciiLoader } from '../components/AsciiLoader';
import { Plus, Check, Trash2, Users, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Todo {
  id: number;
  name: string;
  about: string;
  isCompleted: boolean;
  owner: { id: number; username: string };
  participants: { id: number; username: string }[];
  reminderTime?: string | null;
}

const toLocalInputValue = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const reminderPresets: { label: string; compute: () => Date }[] = [
  {
    label: 'Tonight 8pm',
    compute: () => { const d = new Date(); d.setHours(20, 0, 0, 0); return d; },
  },
  {
    label: 'Tomorrow 9am',
    compute: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; },
  },
  {
    label: 'This weekend',
    compute: () => {
      const d = new Date();
      const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntilSat);
      d.setHours(10, 0, 0, 0);
      return d;
    },
  },
  {
    label: 'Next week',
    compute: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); return d; },
  },
];

const formatReminderLabel = (value: string): string => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (dayDiff === 0) return `Today at ${time}`;
  if (dayDiff === 1) return `Tomorrow at ${time}`;
  if (dayDiff === -1) return `Yesterday at ${time}`;
  if (dayDiff > 1 && dayDiff < 7) return `${d.toLocaleDateString(undefined, { weekday: 'long' })} at ${time}`;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [todosRes, friendsRes] = await Promise.all([
        apiClient.get('/todos'),
        apiClient.get('/friends/myfriends')
      ]);
      setTodos(todosRes.data);
      setFriends(friendsRes.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const tempId = -Date.now();
    const reminderIso = reminderTime ? new Date(reminderTime).toISOString() : null;
    const optimistic: Todo = {
      id: tempId,
      name: newName,
      about: newAbout,
      isCompleted: false,
      owner: { id: user?.id ?? 0, username: user?.username ?? '' },
      participants: friends
        .filter(f => selectedFriends.includes(f.id))
        .map(f => ({ id: f.id, username: f.username })),
      reminderTime: reminderIso,
    };
    const friendIds = selectedFriends;

    setTodos(prev => [optimistic, ...prev]);
    setNewName('');
    setNewAbout('');
    setReminderTime('');
    setSelectedFriends([]);
    setIsAdding(false);

    try {
      const payload: any = { name: optimistic.name, about: optimistic.about };
      if (reminderIso) payload.reminderTime = reminderIso;
      const res = await apiClient.post('/todos', payload);
      if (friendIds.length > 0) {
        await apiClient.post(`/todos/${res.data.id}/participants`, { userIds: friendIds });
      }
      setTodos(prev => prev.map(t =>
        t.id === tempId
          ? { ...res.data, owner: optimistic.owner, participants: optimistic.participants }
          : t
      ));
    } catch (err) {
      setTodos(prev => prev.filter(t => t.id !== tempId));
      alert(handleApiError(err));
    }
  };

  const toggleTodo = async (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    try {
      await apiClient.post(`/todos/${id}/toggle`);
    } catch (err) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
      alert(handleApiError(err));
    }
  };

  const deleteTodo = async (id: number) => {
    const prev = todos;
    setTodos(todos.filter(t => t.id !== id));
    try {
      await apiClient.delete(`/todos/${id}`);
    } catch (err) {
      setTodos(prev);
      alert(handleApiError(err));
    }
  };

  if (isLoading) return <div style={{ paddingTop: '100px' }}><AsciiLoader /></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>Your Goals & Tasks</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Goal
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            layout
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddTodo}
            className="card"
            style={{ marginBottom: '24px' }}
          >
            <div style={{ marginBottom: '16px' }}>
              <input
                autoFocus
                className="input"
                placeholder="What do you want to achieve?"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}
              />
              <textarea
                className="input"
                placeholder="Add some details..."
                value={newAbout}
                onChange={(e) => setNewAbout(e.target.value)}
                rows={3}
                style={{ resize: 'vertical', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>Set a Reminder/Deadline (Optional)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {reminderPresets.map(preset => {
                    const presetValue = toLocalInputValue(preset.compute());
                    const isActive = reminderTime === presetValue;
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setReminderTime(presetValue)}
                        style={{
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                          background: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                          color: isActive ? 'white' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                  {reminderTime && (
                    <button
                      type="button"
                      onClick={() => setReminderTime('')}
                      style={{
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="datetime-local"
                  className="input"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  style={{ color: reminderTime ? 'var(--text-main)' : 'var(--text-muted)' }}
                />
                {reminderTime && (
                  <div style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {formatReminderLabel(reminderTime)}
                  </div>
                )}
              </div>
              {friends.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-main)' }}>Add Friends to this Goal:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {friends.map(friend => (
                      <label key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '16px', border: selectedFriends.includes(friend.id) ? '1px solid var(--accent)' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <input
                          type="checkbox"
                          style={{ display: 'none' }}
                          checked={selectedFriends.includes(friend.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedFriends([...selectedFriends, friend.id]);
                            else setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                          }}
                        />
                        {selectedFriends.includes(friend.id) ? <Check size={14} color="var(--success)" /> : <Users size={14} color="var(--text-muted)" />}
                        <span style={{ color: selectedFriends.includes(friend.id) ? 'var(--text-main)' : 'var(--text-muted)' }}>{friend.username}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Create</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {error && <div style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {todos.length === 0 && !isAdding && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }} className="card">
            No goals yet. Start setting some milestones!
          </div>
        )}
        <AnimatePresence>
          {todos.map((todo) => {
            const isOwner = todo.owner.id === user?.id;
            return (
              <motion.div
                layout
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.01 }}
                className="card"
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  opacity: todo.isCompleted ? 0.6 : 1,
                  transition: 'opacity 0.2s ease, box-shadow 0.3s ease'
                }}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${todo.isCompleted ? 'var(--success)' : 'var(--border-color)'}`,
                    backgroundColor: todo.isCompleted ? 'var(--success)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginTop: '4px',
                    flexShrink: 0
                  }}
                >
                  {todo.isCompleted && <Check size={14} />}
                </button>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    marginBottom: '4px',
                    textDecoration: todo.isCompleted ? 'line-through' : 'none',
                    color: todo.isCompleted ? 'var(--text-muted)' : 'var(--text-main)'
                  }}>
                    {todo.name}
                  </h3>
                  {todo.about && (
                    <div className="markdown-content" style={{ marginBottom: '16px' }}>
                      <ReactMarkdown>{todo.about}</ReactMarkdown>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} /> 
                      {todo.participants.length > 0 ? (
                         `${todo.owner.username} + ${todo.participants.map(p => p.username).join(', ')}`
                      ) : (
                        todo.owner.username === user?.username ? 'Just you' : todo.owner.username
                      )}
                    </span>
                    {todo.reminderTime && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>
                        <Clock size={14} />
                        {new Date(todo.reminderTime).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
                
                {isOwner && (
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    style={{ color: 'var(--text-muted)', padding: '8px' }}
                    className="hover-danger"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
