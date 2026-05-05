import React, { useState, useEffect } from 'react';
import { apiClient, handleApiError } from '../api/client';
import { AsciiLoader } from '../components/AsciiLoader';
import { UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const FriendsPage: React.FC = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        apiClient.get('/friends/myfriends'),
        apiClient.get('/friends/pending')
      ]);
      setFriends(friendsRes.data);
      setPending(pendingRes.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/friends/request', { email });
      setSuccess('Friend request sent!');
      setEmail('');
      fetchData();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const respondRequest = async (requestId: number, action: 'accept' | 'reject') => {
    try {
      await apiClient.post('/friends/respond', { requestId, action });
      fetchData();
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  if (isLoading) return <div style={{ paddingTop: '100px' }}><AsciiLoader /></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
      <h2 style={{ marginBottom: '32px' }}>Your Friends</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div layout className="card" whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} /> Add a Friend
            </h3>
            <form onSubmit={sendRequest} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="email"
                className="input"
                placeholder="Friend's Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Send</button>
            </form>
            {error && <p style={{ color: 'var(--error)', fontSize: '14px', marginTop: '12px' }}>{error}</p>}
            {success && <p style={{ color: 'var(--success)', fontSize: '14px', marginTop: '12px' }}>{success}</p>}
          </motion.div>

          <motion.div layout className="card" whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} /> Pending Requests
            </h3>
            {pending.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No pending requests.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pending.map(req => (
                  <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{req.sender.username}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{req.sender.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => respondRequest(req.id, 'accept')} style={{ color: 'var(--success)', padding: '4px' }}>
                        <UserCheck size={20} />
                      </button>
                      <button onClick={() => respondRequest(req.id, 'reject')} style={{ color: 'var(--error)', padding: '4px' }}>
                        <UserX size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div layout className="card" style={{ alignSelf: 'start' }} whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} /> My Friends
          </h3>
          {friends.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>You haven't added any friends yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {friends.map(friend => (
                <div key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-color)', fontWeight: 'bold' }}>
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{friend.username}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{friend.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};
