import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import AuthShell from './AuthShell';
import { authService } from '../../services/authService';

export default function SimpleAuthPage({ type }) {
  const isCreate = type === 'create';
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isCreate) {
      setSuccess('Password reset link sent to your email.');
      return;
    }

    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setError('Confirm password does not match password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const displayName = name.trim() || email.split('@')[0];
      await authService.register(displayName, email, cleanPassword, 'ROLE_FARMER');
      setError('');
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={15} /> Back to login
        </Link>

        <h1 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{isCreate ? 'Create Account' : 'Forgot Password?'}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          {isCreate
            ? 'Create your FarmVerse account to manage farms and soil health records.'
            : "Enter your email or phone and we'll help you reset your password."}
        </p>

        {error && (
          <div className="badge badge-danger" style={{ marginBottom: '1.25rem', width: '100%', padding: '0.65rem', justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="badge badge-success" style={{ marginBottom: '1.25rem', width: '100%', padding: '0.65rem', justifyContent: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isCreate && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arun Kumar"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email or phone</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@farmverse.in"
              required
            />
          </div>

          {isCreate && (
            <>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 chars)"
                    required
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <div className="input-with-icon">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button className="btn btn-primary" type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '0.5rem' }}>
            {isSubmitting ? 'Processing...' : isCreate ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </AuthShell>
  );
}
