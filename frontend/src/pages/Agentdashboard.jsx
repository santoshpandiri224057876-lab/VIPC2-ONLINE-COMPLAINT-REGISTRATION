import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

export default function AgentDashboard() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [assignments, setAssignments] = useState([]);
  const [messages, setMessages]       = useState({});
  const [newMsg, setNewMsg]           = useState({});
  const [openMsg, setOpenMsg]         = useState(null);
  const [notes, setNotes]             = useState({});

  const fetchAssignments = async () => {
    const { data } = await axios.get(`${API}/assigned`, { headers });
    setAssignments(data);
  };

  const fetchMessages = async (id) => {
    const { data } = await axios.get(`${API}/messages/${id}`, { headers });
    setMessages(m => ({ ...m, [id]: data }));
  };

  useEffect(() => { fetchAssignments(); }, []);

  const updateStatus = async (assignId, complaintId, status) => {
    await axios.patch(`${API}/assigned/${assignId}`, { status }, { headers });
    await axios.patch(`${API}/complaints/${complaintId}`, { status }, { headers });
    fetchAssignments();
  };

  const saveNote = async (complaintId) => {
    if (!notes[complaintId]?.trim()) return;
    await axios.patch(`${API}/complaints/${complaintId}`, { comment: notes[complaintId] }, { headers });
    setNotes(n => ({ ...n, [complaintId]: '' }));
    fetchAssignments();
  };

  const sendMessage = async (complaintId) => {
    if (!newMsg[complaintId]?.trim()) return;
    await axios.post(`${API}/messages`, { complaint_id: complaintId, message: newMsg[complaintId] }, { headers });
    setNewMsg(m => ({ ...m, [complaintId]: '' }));
    fetchMessages(complaintId);
  };

  const STATUS_COLORS = {
    pending:    { background: '#fef3c7', color: '#92400e' },
    'in-review':{ background: '#dbeafe', color: '#1e40af' },
    resolved:   { background: '#d1fae5', color: '#065f46' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Agent Dashboard</h1>
        <p style={styles.sub}>Your assigned complaints — {assignments.length} total</p>

        {assignments.length === 0 ? (
          <div style={styles.empty}>No complaints assigned to you yet.</div>
        ) : assignments.map(a => {
          const c = a.complaint_id;
          if (!c) return null;
          return (
            <div key={a._id} style={styles.card}>
              <div style={styles.header}>
                <div>
                  <span style={styles.cat}>{c.category?.toUpperCase()}</span>
                  <span style={styles.loc}>{c.city}, {c.state}</span>
                </div>
                <span style={{ ...styles.badge, ...STATUS_COLORS[a.status] }}>{a.status}</span>
              </div>

              <p style={styles.desc}>{c.description}</p>
              <p style={styles.meta}>📍 {c.address}, {c.pincode}</p>

              <div style={styles.row}>
                <select value={a.status}
                  onChange={e => updateStatus(a._id, c._id, e.target.value)}
                  style={styles.select}>
                  <option value="pending">Pending</option>
                  <option value="in-review">In Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div style={styles.noteRow}>
                <input
                  value={notes[c._id] || ''}
                  onChange={e => setNotes(n => ({ ...n, [c._id]: e.target.value }))}
                  placeholder="Add action note / resolution detail..."
                  style={styles.input} />
                <button onClick={() => saveNote(c._id)} style={styles.noteBtn}>Save Note</button>
              </div>
              {c.comment && <p style={styles.existingNote}>📝 Last note: {c.comment}</p>}

              <button onClick={() => {
                if (openMsg === c._id) { setOpenMsg(null); return; }
                setOpenMsg(c._id); fetchMessages(c._id);
              }} style={styles.msgToggle}>
                {openMsg === c._id ? 'Hide Messages' : '💬 View / Reply Messages'}
              </button>

              {openMsg === c._id && (
                <div style={styles.msgBox}>
                  {(messages[c._id] || []).map(m => (
                    <div key={m._id} style={styles.msgItem}>
                      <strong style={{ fontSize: 12 }}>{m.name}:</strong>
                      <span style={{ fontSize: 13, marginLeft: 6 }}>{m.message}</span>
                    </div>
                  ))}
                  <div style={styles.msgInputRow}>
                    <input value={newMsg[c._id] || ''}
                      onChange={e => setNewMsg(n => ({ ...n, [c._id]: e.target.value }))}
                      placeholder="Reply..." style={{ ...styles.input, marginBottom: 0, flex: 1 }} />
                    <button onClick={() => sendMessage(c._id)} style={styles.sendBtn}>Send</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page:       { minHeight: '100vh', background: '#f5f5f7', padding: '24px 16px' },
  container:  { maxWidth: 820, margin: '0 auto' },
  heading:    { fontSize: 26, fontWeight: 700, color: '#1e1e2e', marginBottom: 4 },
  sub:        { color: '#888', fontSize: 14, marginBottom: 24 },
  card:       { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cat:        { fontWeight: 700, fontSize: 15, color: '#1e1e2e', marginRight: 8 },
  loc:        { fontSize: 13, color: '#888' },
  badge:      { fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20 },
  desc:       { fontSize: 14, color: '#444', margin: '8px 0' },
  meta:       { fontSize: 13, color: '#666', marginBottom: 12 },
  row:        { display: 'flex', gap: 8, marginBottom: 12 },
  select:     { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 },
  noteRow:    { display: 'flex', gap: 8, marginBottom: 6 },
  input:      { flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, boxSizing: 'border-box' },
  noteBtn:    { padding: '8px 14px', background: '#0f6e56', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  existingNote:{ fontSize: 12, color: '#555', background: '#f9fafb', padding: '6px 10px', borderRadius: 6, margin: '4px 0 8px' },
  msgToggle:  { fontSize: 13, color: '#4f46e5', background: 'none', border: '1px solid #4f46e5', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' },
  msgBox:     { marginTop: 10, background: '#f9fafb', borderRadius: 8, padding: 12 },
  msgItem:    { padding: '6px 0', borderBottom: '1px solid #eee' },
  msgInputRow:{ display: 'flex', gap: 8, marginTop: 10 },
  sendBtn:    { padding: '8px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
};