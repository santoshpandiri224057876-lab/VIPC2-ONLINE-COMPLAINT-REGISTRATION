import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';
const CATEGORIES = ['all','police','electricity','municipality','water','other'];

export default function AdminDashboard() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [tab, setTab]             = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers]           = useState([]);
  const [filter, setFilter]         = useState('all');
  const [catFilter, setCatFilter]   = useState('all');
  const [assignMap, setAssignMap]   = useState({});

  const fetchAll = async () => {
    const [c, u] = await Promise.all([
      axios.get(`${API}/complaints`, { headers }),
      axios.get(`${API}/users`, { headers }),
    ]);
    setComplaints(c.data);
    setUsers(u.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const agents = users.filter(u => u.user_type === 'agent');

  const updateStatus = async (id, status) => {
    await axios.patch(`${API}/complaints/${id}`, { status }, { headers });
    fetchAll();
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    await axios.delete(`${API}/complaints/${id}`, { headers });
    fetchAll();
  };

  const assignAgent = async (complaintId) => {
    const agentId = assignMap[complaintId];
    if (!agentId) return;
    const agent = agents.find(a => a._id === agentId);
    await axios.post(`${API}/assigned`, {
      complaint_id: complaintId, user_id: agentId, agent: agent?.name, status: 'pending'
    }, { headers });
    alert('Assigned successfully!');
  };

  const updateUserType = async (id, user_type) => {
    await axios.patch(`${API}/users/${id}`, { user_type }, { headers });
    fetchAll();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`${API}/users/${id}`, { headers });
    fetchAll();
  };

  const STATUS_COLORS = {
    pending:    { background: '#fef3c7', color: '#92400e' },
    'in-review':{ background: '#dbeafe', color: '#1e40af' },
    resolved:   { background: '#d1fae5', color: '#065f46' },
  };

  const filtered = complaints
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => catFilter === 'all' || c.category === catFilter);

  const stats = {
    total:    complaints.length,
    pending:  complaints.filter(c => c.status === 'pending').length,
    inReview: complaints.filter(c => c.status === 'in-review').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Admin Dashboard</h1>

        <div style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total,    bg: '#ede9fe', color: '#5b21b6' },
            { label: 'Pending', value: stats.pending,  bg: '#fef3c7', color: '#92400e' },
            { label: 'In Review', value: stats.inReview, bg: '#dbeafe', color: '#1e40af' },
            { label: 'Resolved', value: stats.resolved, bg: '#d1fae5', color: '#065f46' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, background: s.bg }}>
              <div style={{ ...styles.statVal, color: s.color }}>{s.value}</div>
              <div style={{ ...styles.statLabel, color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.tabs}>
          {['complaints', 'users'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}>
              {t === 'complaints' ? `📋 Complaints (${complaints.length})` : `👥 Users (${users.length})`}
            </button>
          ))}
        </div>

        {tab === 'complaints' && (
          <div>
            <div style={styles.filterRow}>
              {['all','pending','in-review','resolved'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={styles.select}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>

            {filtered.map(c => (
              <div key={c._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.cat}>{c.category?.toUpperCase()}</span>
                    <span style={styles.loc}>{c.city}, {c.state}</span>
                  </div>
                  <span style={{ ...styles.badge, ...STATUS_COLORS[c.status] }}>{c.status}</span>
                </div>
                <p style={styles.desc}>{c.description}</p>
                <p style={styles.meta}>
                  👤 {c.user_id?.name} · {c.user_id?.email} · 📍 {c.address}, {c.pincode}
                </p>

                <div style={styles.actionRow}>
                  <select value={c.status} onChange={e => updateStatus(c._id, e.target.value)} style={styles.select}>
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <select value={assignMap[c._id] || ''}
                    onChange={e => setAssignMap(m => ({ ...m, [c._id]: e.target.value }))}
                    style={styles.select}>
                    <option value="">Assign Agent</option>
                    {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                  <button onClick={() => assignAgent(c._id)} style={styles.assignBtn}>Assign</button>
                  <button onClick={() => deleteComplaint(c._id)} style={styles.deleteBtn}>Delete</button>
                </div>
                <p style={styles.date}>{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div>
            {users.map(u => (
              <div key={u._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.cat}>{u.name}</span>
                    <span style={styles.loc}>{u.email}</span>
                  </div>
                  <span style={{ ...styles.badge, background: '#ede9fe', color: '#5b21b6' }}>{u.user_type}</span>
                </div>
                <p style={styles.meta}>📞 {u.ph_no || 'N/A'}</p>
                <div style={styles.actionRow}>
                  <select value={u.user_type} onChange={e => updateUserType(u._id, e.target.value)} style={styles.select}>
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => deleteUser(u._id)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight: '100vh', background: '#f5f5f7', padding: '24px 16px' },
  container:   { maxWidth: 900, margin: '0 auto' },
  heading:     { fontSize: 26, fontWeight: 700, color: '#1e1e2e', marginBottom: 20 },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard:    { borderRadius: 12, padding: '20px 16px', textAlign: 'center' },
  statVal:     { fontSize: 32, fontWeight: 700 },
  statLabel:   { fontSize: 13, fontWeight: 600, marginTop: 4 },
  tabs:        { display: 'flex', gap: 8, marginBottom: 20 },
  tab:         { padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 },
  activeTab:   { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },
  filterRow:   { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn:   { padding: '6px 14px', borderRadius: 20, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 },
  filterActive:{ background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },
  card:        { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cat:         { fontWeight: 700, fontSize: 15, color: '#1e1e2e', marginRight: 8 },
  loc:         { fontSize: 13, color: '#888' },
  badge:       { fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 },
  desc:        { fontSize: 14, color: '#444', margin: '6px 0' },
  meta:        { fontSize: 13, color: '#666', marginBottom: 10 },
  actionRow:   { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 },
  select:      { padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 },
  assignBtn:   { padding: '7px 14px', background: '#0f6e56', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  deleteBtn:   { padding: '7px 14px', background: 'none', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  date:        { fontSize: 12, color: '#aaa' },
};