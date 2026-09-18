import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthShell from './AuthShell';
import { authService } from '../../services/authService';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('farmverse_remember_email');
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.includes('@') || password.length < 6) {
      setError('Please enter a valid email and a password with at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await authService.login(email, password);
      
      if (remember) {
        localStorage.setItem('farmverse_remember_email', email);
      } else {
        localStorage.removeItem('farmverse_remember_email');
      }
      
      setMessage('Login successful — welcome to FarmVerse.');
      setTimeout(() => {
        onLogin?.(user);
        navigate('/dashboard');
      }, 600);
    } catch (err) {
      setError(err.message || 'User not registered. Please create an account first.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div className="selectable-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary)' }}>
            <Sprout size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>FarmVerse</h2>
            <h1 style={{ fontSize: '1.4rem' }}>Welcome back</h1>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Sign in to manage your farms and soil health records.
        </p>

        {/* Quick Demo Accounts Helper */}
        <div style={{ background: 'var(--bg-card-hover, rgba(255, 255, 255, 0.05))', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px border-subtle' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Quick Demo Accounts:</span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              onClick={() => fillDemoAccount('bob@farmverse.com', 'password123')}
            >
              🌱 Farmer Bob
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              onClick={() => fillDemoAccount('alice@farmverse.com', 'password123')}
            >
              🔬 Dr. Alice
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              onClick={() => fillDemoAccount('admin@farmverse.com', 'password123')}
            >
              👑 System Admin
            </button>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email or phone</label>
            <input
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@farmverse.in"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Forgot Password?</Link>
          </div>

          {error && (
            <div className="badge badge-danger" style={{ marginBottom: '1rem', width: '100%', justifyContent: 'flex-start', padding: '0.6rem', gap: '0.5rem', fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
            {isSubmitting ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        {message && (
          <div className="badge badge-success" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '0.6rem' }}>
            <CheckCircle size={13} /> {message}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          New to FarmVerse? <Link to="/create-account" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Account</Link>
        </div>
      </div>
    </AuthShell>
  );
}
