import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, handleApiError } from '../api/client';
import { todosApi } from '../api/todos';
import type { Todo, ReactionType } from '../types/todo';
import { useAuth } from '../context/AuthContext';
import { AsciiLoader } from '../components/AsciiLoader';
import { ReminderPicker } from '../components/ReminderPicker';
import { formatReminderLabel } from '../utils/datetime';
import { Plus, Check, Trash2, Users, Clock, Pencil, X, UserPlus, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Friend { id: number; username: string; email?: string; }

const ownerBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  padding: '2px 8px',
  borderRadius: '10px',
};

const MetaRow: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '24px' }}>
    <div style={{
      width: '20px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
      {children}
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editReminder, setEditReminder] = useState<string | null>(null);

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
    const reminderIso = reminderTime;
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
    setReminderTime(null);
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
    setEditReminder(todo.reminderTime ?? null);
    setManagingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAbout('');
    setEditReminder(null);
  };

  const saveEdit = async (id: number) => {
    if (!editName.trim()) return;
    const reminderIso = editReminder;
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
    const ownerName = todo.owner.username + (todo.owner.id === user?.id ? ' (you)' : '');

    return (
      <motion.div
        layout
        key={todo.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={isEditing ? undefined : { scale: 1.005 }}
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          opacity: todo.isCompleted ? 0.65 : 1,
          transition: 'opacity 0.2s ease, box-shadow 0.3s ease',
        }}
      >
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
            <ReminderPicker value={editReminder} onChange={setEditReminder} idPrefix={`edit-${todo.id}`} />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>
              <button type="button" onClick={() => saveEdit(todo.id)} className="btn-primary">Save</button>
            </div>
          </div>
        ) : (
          <>
            {/* Header: checkbox · title+badge · side actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <button
                onClick={() => toggleTodo(todo.id)}
                aria-label={todo.isCompleted ? 'Mark as not done' : 'Mark as done'}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: `2px solid ${todo.isCompleted ? 'var(--success)' : 'var(--border-color)'}`,
                  backgroundColor: todo.isCompleted ? 'var(--success)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  marginTop: '2px',
                  flexShrink: 0,
                }}
              >
                {todo.isCompleted && <Check size={12} />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{
                    fontSize: '17px',
                    margin: 0,
                    textDecoration: todo.isCompleted ? 'line-through' : 'none',
                    color: todo.isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
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
                  <div className="markdown-content" style={{ marginTop: '6px' }}>
                    <ReactMarkdown>{todo.about}</ReactMarkdown>
                  </div>
                )}
              </div>

              {isOwner && (
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(todo)}
                    style={{ color: 'var(--text-muted)', padding: '6px' }}
                    title="Edit"
                    aria-label="Edit todo"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    style={{ color: 'var(--text-muted)', padding: '6px' }}
                    className="hover-danger"
                    title="Delete"
                    aria-label="Delete todo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Meta rows aligned to title indent */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '34px' }}>
              {todo.reminderTime && (
                <MetaRow icon={<Clock size={14} />}>
                  <span style={{ color: 'var(--accent)', fontSize: '13px' }}>
                    {formatReminderLabel(todo.reminderTime)}
                  </span>
                </MetaRow>
              )}

              <MetaRow icon={<Users size={14} />}>
                <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                  {ownerName}
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}> · owner</span>
                </span>
                {todo.participants.map(p => (
                  <span key={p.id} style={{
                    fontSize: '12px',
                    padding: '2px 4px 2px 10px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}>
                    {p.username}{p.id === user?.id ? ' (you)' : ''}
                    {isOwner && (
                      <button
                        onClick={() => removeParticipant(todo.id, p.id)}
                        title={`Remove ${p.username}`}
                        aria-label={`Remove ${p.username}`}
                        style={{
                          marginLeft: '2px',
                          padding: '2px',
                          borderRadius: '50%',
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          background: 'transparent',
                        }}
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))}
                {isOwner && availableFriends.length > 0 && !isManaging && (
                  <button
                    onClick={() => startManage(todo.id)}
                    style={{
                      fontSize: '12px',
                      padding: '2px 10px',
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
                    <UserPlus size={12} /> Add
                  </button>
                )}
              </MetaRow>

              <MetaRow icon={<Heart size={14} />}>
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
                        fontSize: '12px',
                        padding: '3px 10px',
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
              </MetaRow>
            </div>

            {isManaging && (
              <div style={{
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
          </>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <input
                autoFocus
                className="input"
                placeholder="What do you want to achieve?"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ fontSize: '18px', fontWeight: 500 }}
              />
              <textarea
                className="input"
                placeholder="Add some details..."
                value={newAbout}
                onChange={(e) => setNewAbout(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
              <ReminderPicker value={reminderTime} onChange={setReminderTime} idPrefix="create" />
              {friends.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-main)' }}>Add friends to this goal</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {friends.map(friend => (
                      <label key={friend.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: 'var(--bg-secondary)', padding: '5px 12px', borderRadius: '14px', border: selectedFriends.includes(friend.id) ? '1px solid var(--accent)' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}>
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
              <button type="button" onClick={() => { setIsAdding(false); setReminderTime(null); }} className="btn-secondary">Cancel</button>
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
