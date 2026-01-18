import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="app-container">
      <Sidebar onLogout={() => setUser(null)} />
      <div className="main-content">
        <Dashboard />
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [creds, setCreds] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    const data = await res.json();
    if (data.success) onLogin(data.user);
    else alert("Login Failed");
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>UNEP Skills Portal</h2>
        <form onSubmit={handleLogin}>
          <input placeholder="Username" onChange={e => setCreds({...creds, username: e.target.value})} />
          <input type="password" placeholder="Password" onChange={e => setCreds({...creds, password: e.target.value})} />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

function Sidebar({ onLogout }) {
  return (
    <div className="sidebar">
      <h3>Admin Panel</h3>
      <ul>
        <li>Staff Directory</li>
        <li>Duty Stations</li>
        <li>Reports</li>
      </ul>
      <button onClick={onLogout} className="logout-btn">Logout</button>
    </div>
  );
}

function Dashboard() {
  const [view, setView] = useState('list');
  const [staff, setStaff] = useState([]);
  const [lookups, setLookups] = useState({ stations: [], edu: [] });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStaff();
    fetch('http://localhost:5000/api/lookups').then(r => r.json()).then(setLookups);
  }, []);

  const fetchStaff = (query = '') => {
    fetch(`http://localhost:5000/api/staff?q=${query}`)
      .then(r => r.json())
      .then(setStaff);
  };

  return (
    <div>
      <div className="header">
        <h1>Staff Management</h1>
        {view === 'list' && (
          <div className="actions">
            <input 
              className="search-bar"
              placeholder="Search Name or Index..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); fetchStaff(e.target.value); }}
            />
            <button className="add-btn" onClick={() => setView('add')}>+ Add Staff</button>
          </div>
        )}
      </div>

      {view === 'list' ? (
        <table className="staff-table">
          <thead>
            <tr>
              <th>Index</th>
              <th>Name</th>
              <th>Station</th>
              <th>Education</th>
              <th>Remote</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td>{s.index_number}</td>
                <td>{s.full_names}</td>
                <td>{s.duty_station || 'N/A'}</td>
                <td>{s.education || 'N/A'}</td>
                <td>{s.remote_available ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <AddStaffForm lookups={lookups} onCancel={() => setView('list')} onSave={() => { fetchStaff(); setView('list'); }} />
      )}
    </div>
  );
}

function AddStaffForm({ lookups, onCancel, onSave }) {
  const [form, setForm] = useState({ index: '', name: '', email: '', stationId: '', eduId: '', remote: 1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/staff', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form)
    }).then(() => onSave());
  };

  return (
    <form onSubmit={handleSubmit} className="staff-form">
      <h3>New Staff Profile</h3>
      <input placeholder="Index Number" onChange={e => setForm({...form, index: e.target.value})} required />
      <input placeholder="Full Name" onChange={e => setForm({...form, name: e.target.value})} required />
      <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />

      <select onChange={e => setForm({...form, stationId: e.target.value})} required>
        <option value="">Select Duty Station</option>
        {lookups.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <select onChange={e => setForm({...form, eduId: e.target.value})} required>
        <option value="">Select Education</option>
        {lookups.edu.map(e => <option key={e.id} value={e.id}>{e.level_name}</option>)}
      </select>

      <div className="btn-group">
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        <button type="submit" className="save-btn">Save</button>
      </div>
    </form>
  );
}