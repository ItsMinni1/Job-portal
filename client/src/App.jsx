import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { api } from './api';
import './index.css';

// Pages - placeholder for now
const Landing = () => {
  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Find Your Dream Job
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Connect with top employers or find the perfect candidate. Simple, fast, and transparent.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        <Link to="/register?role=jobseeker" className="btn">I'm a Job Seeker</Link>
        <Link to="/register?role=employer" className="btn btn-secondary">I'm an Employer</Link>
        <Link to="/register?role=admin" className="btn btn-secondary" style={{ border: '1px dashed #6366f1' }}>Admin Demo</Link>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/login" style={{ color: '#6366f1' }}>Already have an account? Login</Link>
      </div>
    </div>
  );
};

const Navbar = ({ user, logout }) => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">JobPortal</Link>
      <div className="nav-links">
        {user ? (
          <>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>Hello, {user.username} ({user.role})</span>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  if (loading) return <div className="container">Loading...</div>;

  const getDashboard = () => {
    if (!user) return <Navigate to="/login" />;
    if (user.role === 'employer') return <EmployerDashboard user={user} />;
    if (user.role === 'jobseeker') return <JobSeekerDashboard user={user} />;
    if (user.role === 'admin') return <AdminDashboard user={user} />;
    return <Navigate to="/" />; // Fallback
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar user={user} logout={logout} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/login" element={<Login onLogin={login} />} />
            <Route path="/register" element={<Register onLogin={login} />} />
            <Route path="/dashboard" element={getDashboard()} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Placeholder Page Components - to be implemented fully next
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.login(username, password);
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    </div>
  );
};

const Register = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('jobseeker');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get role from valid URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'employer' || roleParam === 'jobseeker' || roleParam === 'admin') {
      setRole(roleParam);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.register(username, password, role);
      onLogin(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button type="button"
              className={`btn ${role === 'jobseeker' ? '' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              onClick={() => setRole('jobseeker')}>
              Seeker
            </button>
            <button type="button"
              className={`btn ${role === 'employer' ? '' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              onClick={() => setRole('employer')}>
              Employer
            </button>
            <button type="button"
              className={`btn ${role === 'admin' ? '' : 'btn-secondary'}`}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
              onClick={() => setRole('admin')}>
              Admin
            </button>
          </div>
          <input className="input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn" style={{ width: '100%' }}>Sign Up As {role.toUpperCase()}</button>
        </form>
      </div>
    </div>
  );
};

// Dashboards will be imported or defined here
import EmployerDashboard from './pages/EmployerDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default App;
