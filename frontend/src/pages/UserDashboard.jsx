import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';
const CATEGORIES = ['police', 'electricity', 'municipality', 'water', 'other'];
const STATUS_COLORS = { pending: '#fef3c7|#92400e', 'in-review': '#dbeafe|#1e40af', resolved: '#d1fae5|#065f46' };

export default function UserDashboard() {
  const { token, user } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [complaints, setComplaints] = useState([]);
  const [messages, setMessages]     = useState({});
  const [newMsg, setNewMsg]         = useState({});
  const [openMsg, setOpenMsg]       = useState(null);
  const [tab, setTab]               = useState('submit');
  const [filter, setFilter]         = useState('all');
  const [form, setForm] = useState({
    name: user?.name || '', category: 'other', address: '',
    city: '', state: '', pincode: '', description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const fetchComplaints = async () => {
    const { data } = await axios.get(`${API}/complaints/my`, { headers });
    setComplaints(data);
  };

  const fetchMessages = async (id) => {
    const { data } = await axios.get(`${API}/messages/${id}`, { headers });
    setMessages(m => ({ ...m, [id]: data }));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    if (!form.address || !form.city || !form.state || !form.pincode || !form.description)
      return setError('Please fill all fields');
    try {
      await axios.post(`${API}/complaints`, form, { headers });
      setSubmitted(true);
      setForm({ name: user?.name || '', category: 'other', address: '', city: '', state: '', pincode: '', description: '' });
      fetchComplaints();
      setTimeout(() => { setSubmitted(false); setTab('track'); }, 1500);
    } catch (err) { setError(err.response?.data?.message || 'Error submitting'); }
  };

  const sendMessage = async (complaintId) => {
    if (!newMsg[complaintId]?.trim()) return;
    await axios.post(`${API}/messages`, { complaint_id: complaintId, message: newMsg[complaintId] }, { headers });
    setNewMsg(m => ({ ...m, [complaintId]: '' }));
    fetchMessages(complaintId);
  };

  const toggleMessages = (id) => {
    if (openMsg === id) { setOpenMsg(null); return; }
    setOpenMsg(id);
    fetchMessages(id);
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  const getBadge = (status) => {
    const [bg, color] = (STATUS_COLORS[status] || '#f3f4f6|#555').split('|');
    return { background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 };
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>My Complaint Portal</h1>

        <div style={styles.tabs}>
          {['submit', 'track'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}>
              {t === 'submit' ? '📝 Submit Complaint' : `📋 My Complaints (${complaints.length})`}
            </button>
          ))}
        </div>

        {tab === 'submit' && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Lodge a New Complaint</h2>
            {error    && <div style={styles.error}>{error}</div>}
            {submitted && <div style={styles.success}>✅ Complaint submitted successfully!</div>}

            <div style={styles.grid2}>
              <div>
                <label style={styles.label}>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} style={styles.input}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <label style={styles.label}>Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" style={styles.input} />

            <div style={styles.grid3}>
              <div>
                <label style={styles.label}>City</label>
                <input name="city" value={form.city} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>State</label>
                <input name="state" value={form.state} onChange={handleChange} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <label style={styles.label}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={4} placeholder="Describe your complaint in detail..." style={{ ...styles.input, resize: 'vertical' }} />

            <button onClick={handleSubmit} style={styles.btnPrimary}>Submit Complaint</button>
          </div>
        )}

        {tab === 'track' && (
          <div>
            <div style={styles.filterRow}>
              {['all', 'pending', 'in-review', 'resolved'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={styles.empty}>No complaints found.</div>
            ) : filtered.map(c => (
              <div key={c._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.cardTitle}>{c.category.toUpperCase()}</span>
                    <span style={{ marginLeft: 10, fontSize: 13, color: '#888' }}>{c.city}, {c.state}</span>
                  </div>
                  <span style={getBadge(c.status)}>{c.status}</span>
                </div>
                <p style={styles.desc}>{c.description}</p>
                {c.comment && <p style={styles.comment}>💬 Agent note: {c.comment}</p>}
                <p style={styles.date}>{new Date(c.createdAt).toLocaleDateString()}</p>

                <button onClick={() => toggleMessages(c._id)} style={styles.msgBtn}>
                  {openMsg === c._id ? 'Hide Messages' : '💬 Messages'}
                </button>

                {openMsg === c._id && (
                  <div style={styles.msgBox}>
                    {(messages[c._id] || []).map(m => (
                      <div key={m._id} style={styles.msgItem}>
                        <strong style={{ fontSize: 12 }}>{m.name}:</strong>
                        <span style={{ fontSize: 13, marginLeft: 6 }}>{m.message}</span>
                      </div>
                    ))}
                    <div style={styles.msgInput}>
                      <input value={newMsg[c._id] || ''} onChange={e => setNewMsg(n => ({ ...n, [c._id]: e.target.value }))}
                        placeholder="Type a message..." style={{ ...styles.input, marginBottom: 0, flex: 1 }} />
                      <button onClick={() => sendMessage(c._id)} style={styles.btnPrimary}>Send</button>
                    </div>
                  </div>
                )}
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
  container:   { maxWidth: 820, margin: '0 auto' },
  heading:     { fontSize: 26, fontWeight: 700, color: '#1e1e2e', marginBottom: 24 },
  tabs:        { display: 'flex', gap: 8, marginBottom: 24 },
  tab:         { padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 },
  activeTab:   { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },
  card:        { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle:   { fontWeight: 700, fontSize: 16, color: '#1e1e2e', margin: '0 0 16px' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
  grid3:       { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  label:       { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4, marginTop: 12 },
  input:       { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  btnPrimary:  { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginTop: 16 },
  error:       { background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
  success:     { background: '#f0fdf4', color: '#15803d', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 },
  filterRow:   { display: 'flex', gap: 8, marginBottom: 16 },
  filterBtn:   { padding: '6px 14px', borderRadius: 20, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 },
  filterActive:{ background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },
  desc:        { fontSize: 14, color: '#444', margin: '8px 0' },
  comment:     { fontSize: 13, color: '#1e40af', background: '#eff6ff', padding: '6px 10px', borderRadius: 6 },
  date:        { fontSize: 12, color: '#aaa', marginTop: 4 },
  empty:       { textAlign: 'center', padding: 48, color: '#888', fontSize: 15 },
  msgBtn:      { fontSize: 13, color: '#4f46e5', background: 'none', border: '1px solid #4f46e5', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', marginTop: 8 },
  msgBox:      { marginTop: 12, background: '#f9fafb', borderRadius: 8, padding: 12 },
  msgItem:     { padding: '6px 0', borderBottom: '1px solid #eee' },
  msgInput:    { display: 'flex', gap: 8, marginTop: 10 },
};