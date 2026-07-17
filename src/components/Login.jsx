import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill out all fields.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/signup' : '/api/login';
      const body = isSignUp ? { name, email, password } : { email, password };

      const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      // Save token for future API calls
      localStorage.setItem('wealth-tracker-token', data.token);
      
      // Tell parent we are logged in
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <span className="eyebrow">{isSignUp ? "Join Us" : "Welcome Back"}</span>
          <h2>{isSignUp ? "Create your account" : "Sign in to your account"}</h2>
          <p>Access your personal wealth and expense dashboard.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
          {isSignUp && (
            <label>
              <span>Full Name</span>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label>
            <span>Email Address</span>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          
          <label>
            <span>Password</span>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          
          <button type="submit" className="primary-button login-button" disabled={loading}>
            {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#52605d' }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
          <button 
            type="button" 
            style={{ background: 'none', border: 'none', color: '#0f766e', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }} 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </main>
  );
}
