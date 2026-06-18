import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', ph_no: '', user_type: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password)
      return setError('Name, email and password are required');
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      setSuccess('Registered! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.sub}>Join the complaint portal</p>

        {error   && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <label style={styles.label}>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange}
          placeholder="John Doe" style={styles.input} />

        <label style={styles.label}>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          placeholder="john@email.com" style={styles.input} />

        <label style={styles.label}>Phone Number</label>
        <input name="ph_no" value={form.ph_no} onChange={handleChange}
          placeholder="9876543210" style={styles.input} />

        <label style={styles.label}>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange}
          placeholder="••••••••" style={styles.input} />

        <label style={styles.label}>Register As</label>
        <select name="user_type" value={form.user_type} onChange={handleChange} style={styles.input}>
          <option value="user">User (Citizen)</option>
          <option value="agent">Agent (Officer)</option>
        </select>

        <button onClick={handleSubmit} style={styles.btn}>Register</button>
        <p style={styles.link}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page:    { minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card:    { background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title:   { margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#1e1e2e' },
  sub:     { margin: '0 0 24px', color: '#888', fontSize: 14 },
  label:   { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 },
  input:   { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' },
  btn:     { width: '100%', padding: 12, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  error:   { background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  success: { background: '#f0fdf4', color: '#15803d', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  link:    { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#666' }
};