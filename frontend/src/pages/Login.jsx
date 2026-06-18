import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', form);
      login(data.user, data.token);
      if (data.user.user_type === 'admin') navigate('/admin');
      else if (data.user.user_type === 'agent') navigate('/agent');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.sub}>Login to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          placeholder="john@email.com" style={styles.input} />

        <label style={styles.label}>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange}
          placeholder="••••••••" style={styles.input}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

        <button onClick={handleSubmit} style={styles.btn}>Login</button>
        <p style={styles.link}>No account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page:  { minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card:  { background: '#fff', borderRadius: 16, padding: 36, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title: { margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#1e1e2e' },
  sub:   { margin: '0 0 24px', color: '#888', fontSize: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' },
  btn:   { width: '100%', padding: 12, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  link:  { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#666' }
};