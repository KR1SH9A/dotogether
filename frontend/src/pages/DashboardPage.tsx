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
    
    try {
      const payload: any = { name: newName, about: newAbout };
      if (reminderTime) {
        payload.reminderTime = new Date(reminderTime).toISOString();
      }
      const res = await apiClient.post('/todos', payload);
      if (selectedFriends.length > 0) {
        await apiClient.post(`/todos/${res.data.id}/participants`, { userIds: selectedFriends });
      }
      setNewName('');
      setNewAbout('');
      setReminderTime('');
      setSelectedFriends([]);
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      await apiClient.post(`/todos/${id}/toggle`);
      setTodos(todos.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await apiClient.delete(`/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>Set a Reminder/Deadline (Optional)</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  style={{ color: reminderTime ? 'var(--text-main)' : 'var(--text-muted)' }}
                />
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
