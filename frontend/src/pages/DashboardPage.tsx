import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, handleApiError } from '../api/client';
import { todosApi } from '../api/todos';
import type { Todo, ReactionType } from '../types/todo';
import { useAuth } from '../context/AuthContext';
import { AsciiLoader } from '../components/AsciiLoader';
import { Plus, Check, Trash2, Users, Clock, Pencil, X, UserPlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const toLocalInputValue = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const isoToLocalInput = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : toLocalInputValue(d);
};

const reminderPresets: { label: string; compute: () => Date }[] = [
  { label: 'Tonight 8pm', compute: () => { const d = new Date(); d.setHours(20, 0, 0, 0); return d; } },
  { label: 'Tomorrow 9am', compute: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; } },
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
  { label: 'Next week', compute: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); return d; } },
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

interface Friend { id: number; username: string; email?: string; }

const ReminderInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {reminderPresets.map(preset => {
        const presetValue = toLocalInputValue(preset.compute());
        const isActive = value === presetValue;
        return (
          <button
            type="button"
            key={preset.label}
            onClick={() => onChange(presetValue)}
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '12px',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
              background: isActive ? 'var(--accent)' : 'var(--bg-secondary)',
              color: isActive ? 'var(--bg-color)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {preset.label}
          </button>
        );
      })}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
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
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ color: value ? 'var(--text-main)' : 'var(--text-muted)' }}
    />
    {value && (
      <div style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={12} /> {formatReminderLabel(value)}
      </div>
    )}
  </div>
);

const ownerBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  padding: '2px 8px',
  borderRadius: '10px',
};

export const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editReminder, setEditReminder] = useState('');

  const [managingId, setManagingId] = useState<number | null>(null);
  const [stagedAdds, setStagedAdds] = useState<number[]>([]);

  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [todosRes, friendsRes] = await Promise.all([
        todosApi.list(),
        apiClient.get<Friend[]>('/friends/myfriends'),
      ]);
      setTodos(todosRes);
      setFriends(friendsRes.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
      likesCount: 0,
      dislikesCount: 0,
      myReaction: null,
    };
    const friendIds = selectedFriends;

    setTodos(prev => [optimistic, ...prev]);
    setNewName('');
    setNewAbout('');
    setReminderTime('');
    setSelectedFriends([]);
    setIsAdding(false);

    try {
      const created = await todosApi.create({ name: optimistic.name, about: optimistic.about, reminderTime: reminderIso });
      let final = created;
      if (friendIds.length > 0) {
        final = await todosApi.addParticipants(created.id, friendIds);
      }
      setTodos(prev => prev.map(t => t.id === tempId ? final : t));
    } catch (err) {
      setTodos(prev => prev.filter(t => t.id !== tempId));
      alert(handleApiError(err));
    }
  };

  const toggleTodo = async (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    try {
      await todosApi.toggle(id);
    } catch (err) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
      alert(handleApiError(err));
    }
  };

  const deleteTodo = async (id: number) => {
    const prev = todos;
    setTodos(todos.filter(t => t.id !== id));
    try {
      await todosApi.remove(id);
    } catch (err) {
      setTodos(prev);
      alert(handleApiError(err));
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditName(todo.name);
    setEditAbout(todo.about ?? '');
    setEditReminder(isoToLocalInput(todo.reminderTime));
    setManagingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAbout('');
    setEditReminder('');
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    const reminderIso = editReminder ? new Date(editReminder).toISOString() : null;
    const prev = todos;
    const patch = { name: editName, about: editAbout, reminderTime: reminderIso };
    setTodos(prev.map(t => t.id === id ? { ...t, ...patch } : t));
    cancelEdit();
    try {
      const updated = await todosApi.update(id, patch);
      setTodos(curr => curr.map(t => t.id === id ? updated : t));
    } catch (err) {
      setTodos(prev);
      alert(handleApiError(err));
    }
  };

  const handleReact = async (todoId: number, kind: ReactionType) => {
    const prev = todos;
    const target = prev.find(t => t.id === todoId);
    if (!target) return;
    if (target.owner.id === user?.id) return;

    const wasActive = target.myReaction === kind;
    let nextMyReaction: ReactionType | null;
    let likeDelta = 0;
    let dislikeDelta = 0;

    if (wasActive) {
      nextMyReaction = null;
      if (kind === 'like') likeDelta = -1; else dislikeDelta = -1;
    } else {
      nextMyReaction = kind;
      if (kind === 'like') {
        likeDelta = 1;
        if (target.myReaction === 'dislike') dislikeDelta = -1;
      } else {
        dislikeDelta = 1;
        if (target.myReaction === 'like') likeDelta = -1;
      }
    }

    setTodos(prev.map(t => t.id === todoId ? {
      ...t,
      myReaction: nextMyReaction,
      likesCount: t.likesCount + likeDelta,
      dislikesCount: t.dislikesCount + dislikeDelta,
    } : t));

    try {
      const updated = wasActive
        ? await todosApi.removeReaction(todoId)
        : await todosApi.setReaction(todoId, kind);
      setTodos(curr => curr.map(t => t.id === todoId ? updated : t));
    } catch (err) {
      setTodos(prev);
      alert(handleApiError(err));
    }
  };

  const removeParticipant = async (todoId: number, participantId: number) => {
    const prev = todos;
    setTodos(prev.map(t =>
      t.id === todoId ? { ...t, participants: t.participants.filter(p => p.id !== participantId) } : t
    ));
    try {
      await todosApi.removeParticipant(todoId, participantId);
    } catch (err) {
      setTodos(prev);
      alert(handleApiError(err));
    }
  };

  const startManage = (todoId: number) => {
    setManagingId(todoId);
    setStagedAdds([]);
    setEditingId(null);
  };

  const cancelManage = () => {
    setManagingId(null);
    setStagedAdds([]);
  };

  const submitAddParticipants = async (todoId: number) => {
    if (stagedAdds.length === 0) { cancelManage(); return; }
    const prev = todos;
    const newOnes = friends
      .filter(f => stagedAdds.includes(f.id))
      .map(f => ({ id: f.id, username: f.username }));
    setTodos(prev.map(t =>
      t.id === todoId ? { ...t, participants: [...t.participants, ...newOnes] } : t
    ));
    cancelManage();
    try {
      const updated = await todosApi.addParticipants(todoId, stagedAdds);
      setTodos(curr => curr.map(t => t.id === todoId ? updated : t));
    } catch (err) {
      setTodos(prev);
      alert(handleApiError(err));
    }
  };

  if (isLoading) return <div style={{ paddingTop: '100px' }}><AsciiLoader /></div>;

  const ownedTodos = todos.filter(t => t.owner.id === user?.id);
  const sharedTodos = todos.filter(t => t.owner.id !== user?.id);

  const renderTodoCard = (todo: Todo) => {
    const isOwner = todo.owner.id === user?.id;
    const isEditing = editingId === todo.id;
    const isManaging = managingId === todo.id;
    const availableFriends = friends.filter(f => !todo.participants.some(p => p.id === f.id));

    return (
      <motion.div
        layout
        key={todo.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={isEditing ? undefined : { scale: 1.01 }}
        className="card"
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start',
          opacity: todo.isCompleted ? 0.6 : 1,
          transition: 'opacity 0.2s ease, box-shadow 0.3s ease',
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
            flexShrink: 0,
          }}
        >
          {todo.isCompleted && <Check size={14} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                autoFocus
                className="input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ fontSize: '18px', fontWeight: 500 }}
              />
              <textarea
                className="input"
                value={editAbout}
                onChange={(e) => setEditAbout(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
              <ReminderInput value={editReminder} onChange={setEditReminder} />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>
                <button type="button" onClick={() => saveEdit(todo.id)} className="btn-primary">Save</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h3 style={{
                  fontSize: '18px',
                  textDecoration: todo.isCompleted ? 'line-through' : 'none',
                  color: todo.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                  margin: 0,
                }}>
                  {todo.name}
                </h3>
                <span style={{
                  ...ownerBadgeStyle,
                  background: isOwner ? 'var(--accent)' : 'transparent',
                  color: isOwner ? 'var(--bg-color)' : 'var(--text-muted)',
                  border: isOwner ? 'none' : '1px solid var(--border-color)',
                }}>
                  {isOwner ? 'Owner' : 'Participant'}
                </span>
              </div>

              {todo.about && (
                <div className="markdown-content" style={{ marginBottom: '12px' }}>
                  <ReactMarkdown>{todo.about}</ReactMarkdown>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Users size={12} /> {todo.owner.username}{todo.owner.id === user?.id ? ' (you)' : ''}
                </span>
                {todo.participants.map(p => (
                  <span key={p.id} style={{
                    fontSize: '12px',
                    padding: '3px 4px 3px 10px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {p.username}{p.id === user?.id ? ' (you)' : ''}
                    {isOwner && (
                      <button
                        onClick={() => removeParticipant(todo.id, p.id)}
                        title={`Remove ${p.username}`}
                        style={{
                          marginLeft: '2px',
                          padding: '2px',
                          borderRadius: '50%',
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          background: 'transparent',
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
                {isOwner && availableFriends.length > 0 && !isManaging && (
                  <button
                    onClick={() => startManage(todo.id)}
                    style={{
                      fontSize: '12px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: 'transparent',
                      border: '1px dashed var(--border-color)',
                      color: 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <UserPlus size={12} /> Add people
                  </button>
                )}
              </div>

              {isManaging && (
                <div style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-main)' }}>
                    Add friends to this goal
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {availableFriends.map(f => {
                      const checked = stagedAdds.includes(f.id);
                      return (
                        <label key={f.id} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: checked ? 'var(--accent)' : 'var(--bg-color)',
                          color: checked ? 'var(--bg-color)' : 'var(--text-main)',
                          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-color)'}`,
                          cursor: 'pointer',
                        }}>
                          <input
                            type="checkbox"
                            style={{ display: 'none' }}
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) setStagedAdds([...stagedAdds, f.id]);
                              else setStagedAdds(stagedAdds.filter(id => id !== f.id));
                            }}
                          />
                          {checked ? <Check size={12} /> : <UserPlus size={12} />}
                          {f.username}
                        </label>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={cancelManage} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={() => submitAddParticipants(todo.id)} className="btn-primary" disabled={stagedAdds.length === 0}>
                      Add ({stagedAdds.length})
                    </button>
                  </div>
                </div>
              )}

              {todo.reminderTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent)', marginBottom: '8px' }}>
                  <Clock size={14} />
                  {formatReminderLabel(isoToLocalInput(todo.reminderTime))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                {(['like', 'dislike'] as const).map(kind => {
                  const active = todo.myReaction === kind;
                  const face = kind === 'like' ? '( ^.^ )' : '( >.< )';
                  const count = kind === 'like' ? todo.likesCount : todo.dislikesCount;
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => handleReact(todo.id, kind)}
                      disabled={isOwner}
                      className="ascii-font"
                      title={isOwner ? 'Owners cannot react' : undefined}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: active ? 'var(--accent)' : 'var(--bg-secondary)',
                        color: active ? 'var(--bg-color)' : 'var(--text-main)',
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border-color)'}`,
                        cursor: isOwner ? 'default' : 'pointer',
                        opacity: isOwner ? 0.7 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{face}</span>
                      <span>{kind}</span>
                      <span style={{ color: active ? 'var(--bg-color)' : 'var(--text-muted)', opacity: active ? 0.85 : 1, fontWeight: 600 }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {isOwner && !isEditing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => startEdit(todo)}
              style={{ color: 'var(--text-muted)', padding: '8px' }}
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{ color: 'var(--text-muted)', padding: '8px' }}
              className="hover-danger"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </motion.div>
    );
  };

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
                <ReminderInput value={reminderTime} onChange={setReminderTime} />
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

      {todos.length === 0 && !isAdding && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }} className="card">
          No goals yet. Start setting some milestones!
        </div>
      )}

      {ownedTodos.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Your goals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnimatePresence>
              {ownedTodos.map(renderTodoCard)}
            </AnimatePresence>
          </div>
        </section>
      )}

      {sharedTodos.length > 0 && (
        <section>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Shared with you
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AnimatePresence>
              {sharedTodos.map(renderTodoCard)}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
};
