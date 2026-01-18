import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Pointing to Port 5003...uniques due to my exiating ports
const API_URL = 'http://127.0.0.1:5003/api';

// ===================================================================================
// 1. MAIN APP CONTROLLER
// ===================================================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!user) return <LoginPage onLogin={(u) => { setUser(u); setCurrentView('dashboard'); }} />;

  const logout = () => { setUser(null); setCurrentView('dashboard'); };

  // --- STAFF VIEW ---
  if (user.role === 'staff') {
    return (
      <div className="app-container">
        <StaffSidebar onLogout={logout} onNavigate={setCurrentView} active={currentView} />
        <div className="main-content">
          <TopBar user={user} />
          <div className="content-wrapper">
             {currentView === 'dashboard' && <StaffDashboard user={user} />}
             {currentView === 'roster' && <StaffRoster user={user} />}
             {currentView === 'profile' && <StaffProfile user={user} />}
             {currentView === 'training' && <StaffTraining user={user} />}
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  return (
    <div className="app-container">
      <AdminSidebar onLogout={logout} onNavigate={setCurrentView} active={currentView} />
      <div className="main-content">
        <TopBar user={user} />
        <div className="content-wrapper">
          {currentView === 'dashboard' && <AdminDashboard onAdd={() => setCurrentView('add_staff')} />}
          {currentView === 'add_staff' && <AddStaffForm onCancel={() => setCurrentView('dashboard')} onSave={() => setCurrentView('dashboard')} />}
          {currentView === 'assign_training' && <AdminAssignTraining />}
          {currentView === 'reports' && <AdminReports />}
          {currentView === 'stations' && <AdminStations />}
        </div>
        <Footer />
      </div>
    </div>
  );
}

// ===================================================================================
// 2. SHARED COMPONENTS
// ===================================================================================
function LoginPage({ onLogin }) {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const handleLogin = (e) => {
    e.preventDefault();
    fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creds) })
      .then(r => r.json()).then(d => d.success ? onLogin(d.user) : alert("Invalid Credentials"))
      .catch(() => alert("System Offline: Check if backend is running on 5003"));
  };
  return (
    <div className="login-bg">
      <div className="login-card">
        <h2>UNEP Skills Portal</h2>
        <form onSubmit={handleLogin}>
          <input className="form-control" placeholder="Username" onChange={e => setCreds({...creds, username: e.target.value})} />
          <input className="form-control" type="password" placeholder="Password" onChange={e => setCreds({...creds, password: e.target.value})} />
          <button className="btn-primary full-width">Login</button>
        </form>
        <p className="login-footer">Project By: Caroline Kausi</p>
      </div>
    </div>
  );
}
function TopBar({ user }) { return <div className="topbar"><h4>UN Environment Programme</h4><div className="user-info">User: <strong>{user.username}</strong></div></div>; }
function Footer() { return <div className="footer">© 2026 United Nations | Internal Use Only</div>; }

// ===================================================================================
// 3. STAFF COMPONENTS
// ===================================================================================
function StaffSidebar({ onLogout, onNavigate, active }) {
  return (
    <div className="sidebar" style={{background: '#005c84'}}>
      <div className="brand"><h3>My Portal</h3></div>
      <ul className="nav-menu">
        <li className={active === 'dashboard'?'active':''} onClick={() => onNavigate('dashboard')}>Dashboard</li>
        <li className={active === 'roster'?'active':''} onClick={() => onNavigate('roster')}>Shift Roster</li>
        <li className={active === 'profile'?'active':''} onClick={() => onNavigate('profile')}>My Profile</li>
        <li className={active === 'training'?'active':''} onClick={() => onNavigate('training')}>My Trainings</li>
      </ul>
      <div className="nav-footer"><button onClick={onLogout} className="btn-danger">Sign Out</button></div>
    </div>
  );
}
function StaffDashboard({ user }) {
  return (
    <div className="fade-in">
      <div className="page-header"><h2>My Dashboard</h2></div>
      <div style={{marginBottom:'30px'}}><StaffRoster user={user} isWidget={true} /></div>
      <div><StaffProfile user={user} isWidget={true} /></div>
    </div>
  );
}
function StaffRoster({ user, isWidget }) {
  const [date, setDate] = useState('');
  const handleApply = () => alert(`Shift Request for ${date} Sent.`);
  return (
      <div className={`card ${!isWidget ? 'fade-in' : ''}`}>
          {!isWidget && <h2>Shift Roster</h2>}
          <div className="split-view">
             <div><h4>Upcoming</h4><table className="data-table"><tbody><tr><td>2026-01-20</td><td>Morning</td><td><span className="status-ok">Confirmed</span></td></tr></tbody></table></div>
             <div style={{background:'#f8f9fa', padding:'15px', borderRadius:'8px'}}>
                <h4>Request Shift</h4>
                <input type="date" className="form-control" onChange={e => setDate(e.target.value)} />
                <button className="btn-primary full-width" onClick={handleApply}>Submit</button>
             </div>
          </div>
      </div>
  );
}
function StaffProfile({ user, isWidget }) {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  useEffect(() => { 
      fetch(`${API_URL}/my-profile?index=${user.staff_index}`).then(r => r.json()).then(d => { setProfile(d); setForm(d); }); 
  }, [user]);

  const update = () => fetch(`${API_URL}/staff-update`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) }).then(() => { setEdit(false); alert("Updated"); });

  if (!profile) return <div className="card">Loading...</div>;
  return (
    <div className={`card ${!isWidget ? 'fade-in' : ''}`}>
      <div className="split-view">
        <div style={{flex:1}}>
            <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
               <div style={{fontSize:'30px'}}>👤</div>
               <div><h3>{profile.full_names}</h3><span className="badge">{profile.index_number}</span></div>
               {!edit && <button className="btn-secondary" onClick={()=>setEdit(true)} style={{marginLeft:'auto'}}>Edit</button>}
            </div>
            {edit ? (
               <div><input className="form-control" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /><button className="btn-primary" onClick={update}>Save</button></div>
            ) : (
               <table className="data-table"><tbody><tr><td>Station:</td><td>{profile.duty_station}</td></tr><tr><td>Email:</td><td>{profile.email}</td></tr></tbody></table>
            )}
        </div>
      </div>
    </div>
  );
}
function StaffTraining({ user }) {
  const [list, setList] = useState([]);

  // FIX: Wrap loadTrainings in useCallback so it's stable
  const loadTrainings = useCallback(() => {
    fetch(`${API_URL}/my-profile?index=${user.staff_index}`)
      .then(r => r.json())
      .then(p => fetch(`${API_URL}/my-trainings?staffId=${p.id}`))
      .then(r => r.json())
      .then(setList);
  }, [user]); // Only recreate this function if 'user' changes

  // Now we can safely include loadTrainings in the dependency array
  useEffect(() => { 
      loadTrainings(); 
  }, [loadTrainings]);

  const updateStatus = (assignmentId, newStatus) => {
    fetch(`${API_URL}/update-training-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: assignmentId, status: newStatus })
    }).then(() => {
      loadTrainings(); // Refresh the list
    });
  };

  const getProgress = (status) => {
    if (status === 'Completed') return 100;
    if (status === 'In Progress') return 50;
    return 0;
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'green';
    if (status === 'In Progress') return 'orange';
    return '#009EDB';
  };

  return (
    <div className="card fade-in">
      <div className="page-header">
        <h2>My Learning Path</h2>
      </div>

      {list.length === 0 ? <p style={{color:'#888'}}>No active courses assigned.</p> : (
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          {list.map((t) => (
            <div key={t.assignment_id} style={{border:'1px solid #eee', padding:'20px', borderRadius:'8px', background:'#fcfcfc'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <h3 style={{margin:0, color:'#333'}}>{t.course_name}</h3>
                <span className="tag" style={{background: getStatusColor(t.status), color:'white'}}>{t.status}</span>
              </div>
              <p style={{color:'#666', fontSize:'14px', marginBottom:'15px'}}>{t.description}</p>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'15px'}}>
                <div className="progress-container" style={{height:'8px', background:'#ddd'}}>
                  <div className="progress-fill" style={{width: `${getProgress(t.status)}%`, background: getStatusColor(t.status)}}></div>
                </div>
                <span style={{fontSize:'12px', fontWeight:'bold', color:'#666'}}>{getProgress(t.status)}%</span>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                {t.status === 'Assigned' && <button className="btn-primary" onClick={() => updateStatus(t.assignment_id, 'In Progress')}>▶ Start Course</button>}
                {t.status === 'In Progress' && (
                  <>
                    <button className="btn-secondary" onClick={() => window.open('https://www.un.org', '_blank')}>Continue Learning</button>
                    <button className="btn-primary" style={{background:'#28a745'}} onClick={() => updateStatus(t.assignment_id, 'Completed')}>✔ Mark as Done</button>
                  </>
                )}
                {t.status === 'Completed' && <button className="btn-secondary" disabled style={{opacity:0.6, cursor:'default'}}>Certificate Available</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================================================================================
// 4. ADMIN COMPONENTS
// ===================================================================================
function AdminSidebar({ onLogout, onNavigate, active }) {
  return (
    <div className="sidebar">
      <div className="brand"><h3>Admin Console</h3></div>
      <ul className="nav-menu">
        <li onClick={() => onNavigate('dashboard')}>Staff Directory</li>
        <li onClick={() => onNavigate('assign_training')}>Assign Training</li>
        <li onClick={() => onNavigate('reports')}>Reports</li>
        <li onClick={() => onNavigate('stations')}>Duty Stations</li>
      </ul>
      <div className="nav-footer"><button onClick={onLogout} className="btn-danger">Sign Out</button></div>
    </div>
  );
}
function AdminDashboard({ onAdd }) {
  const [list, setList] = useState([]);
  useEffect(() => { 
      fetch(`${API_URL}/staff`).then(r => r.json()).then(setList); 
  }, []);
  return (
    <div className="fade-in">
      <div className="page-header"><h2>Staff Directory</h2><button className="btn-primary" onClick={onAdd}>+ Add Staff</button></div>
      <div className="card"><table className="data-table"><thead><tr><th>Index</th><th>Name</th><th>Station</th><th>Remote</th></tr></thead><tbody>{list.map(s=><tr key={s.id}><td>{s.index_number}</td><td>{s.full_names}</td><td>{s.duty_station}</td><td>{s.remote_available?'✅':'❌'}</td></tr>)}</tbody></table></div>
    </div>
  );
}
function AdminAssignTraining() {
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selStaff, setSelStaff] = useState('');
  const [selCourse, setSelCourse] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCourse, setNewCourse] = useState({name:'', desc:'', hours:0});

  useEffect(() => { loadData(); }, []);
  const loadData = () => {
      fetch(`${API_URL}/staff`).then(r=>r.json()).then(setStaff);
      fetch(`${API_URL}/trainings`).then(r=>r.json()).then(setCourses);
      fetch(`${API_URL}/all-assigned-trainings`).then(r=>r.json()).then(setAssignments);
  };
  const assign = () => fetch(`${API_URL}/assign-training`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({staffId:selStaff, trainingId:selCourse}) }).then(()=>{ alert("Assigned"); loadData(); });
  const createCourse = () => fetch(`${API_URL}/trainings`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newCourse) }).then(()=>{ alert("Created"); setIsAdding(false); loadData(); });

  return (
      <div className="fade-in">
          <div className="card" style={{marginBottom:'30px'}}>
              <div className="page-header"><h2>Assign Training</h2><button className="btn-secondary" onClick={()=>setIsAdding(!isAdding)}>{isAdding?'Cancel':'+ Create Course'}</button></div>
              {isAdding && <div style={{background:'#eee', padding:'10px', marginBottom:'10px'}}><input className="form-control" placeholder="Course Name" onChange={e=>setNewCourse({...newCourse, name:e.target.value})} /><button className="btn-primary" onClick={createCourse}>Save</button></div>}
              <div className="split-view">
                  <select className="form-control" onChange={e=>setSelStaff(e.target.value)}><option value="">Select Staff...</option>{staff.map(s=><option key={s.id} value={s.id}>{s.full_names}</option>)}</select>
                  <select className="form-control" onChange={e=>setSelCourse(e.target.value)}><option value="">Select Course...</option>{courses.map(c=><option key={c.id} value={c.id}>{c.course_name}</option>)}</select>
              </div>
              <button className="btn-primary full-width" onClick={assign}>Assign</button>
          </div>
          <div className="card"><h3>Assignments History</h3><table className="data-table"><thead><tr><th>Name</th><th>Course</th><th>Date</th></tr></thead><tbody>{assignments.map(a=><tr key={a.id}><td>{a.full_names}</td><td>{a.course_name}</td><td>{a.assigned_date.split('T')[0]}</td></tr>)}</tbody></table></div>
      </div>
  );
}
function AdminReports() {
  const [s, setS] = useState(null);

  // Fetch report data safely
  useEffect(() => { 
      fetch(`${API_URL}/reports`).then(r => r.json()).then(setS); 
  }, []);

  if (!s) return <div className="card">Loading Analytics...</div>;

  // Calculate Percentages for Visuals
  const remotePercent = s.total_staff > 0 ? Math.round((s.remote_staff / s.total_staff) * 100) : 0;
  // Mock target for training (e.g., target is 50 completions)
  const trainingPercent = Math.min(Math.round((s.completed_trainings / 50) * 100), 100); 

  return (
    <div className="fade-in">
        <div className="page-header">
            <h2>System Analytics & Reports</h2>
            <button className="btn-secondary">Download PDF</button>
        </div>

        {/* TOP ROW: KEY METRICS */}
        <div className="stat-grid">
            <div className="stat-card" style={{borderLeftColor: '#009EDB'}}>
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                    <h3>{s.total_staff}</h3>
                    <p>Total Personnel</p>
                </div>
            </div>
            <div className="stat-card" style={{borderLeftColor: '#28a745'}}>
                <div className="stat-icon">🌍</div>
                <div className="stat-info">
                    <h3>{s.remote_staff}</h3>
                    <p>Remote Available</p>
                </div>
            </div>
            <div className="stat-card" style={{borderLeftColor: '#ffc107'}}>
                <div className="stat-icon">🎓</div>
                <div className="stat-info">
                    <h3>{s.completed_trainings}</h3>
                    <p>Trainings Done</p>
                </div>
            </div>
        </div>

        {/* BOTTOM ROW: VISUAL BREAKDOWN */}
        <div className="split-view">
            <div className="card">
                <h3>Remote Workforce Capacity</h3>
                <p style={{color:'#666', marginBottom:'10px'}}>Percentage of staff equipped for telecommuting.</p>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                    <strong>{remotePercent}% Capacity</strong>
                    <span>{s.remote_staff} / {s.total_staff} Staff</span>
                </div>
                <div className="progress-container">
                    <div className="progress-fill" style={{width: `${remotePercent}%`, background: '#28a745'}}></div>
                </div>
            </div>

            <div className="card">
                <h3>Training Compliance Goal</h3>
                <p style={{color:'#666', marginBottom:'10px'}}>Progress towards quarterly training targets.</p>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                    <strong>{trainingPercent}% to Target</strong>
                    <span>{s.completed_trainings} Completions</span>
                </div>
                <div className="progress-container">
                    <div className="progress-fill" style={{width: `${trainingPercent}%`, background: '#ffc107'}}></div>
                </div>
            </div>
        </div>
    </div>
  );
}
function AdminStations() {
  const [list, setList] = useState([]); 
  const [name, setName] = useState('');

  useEffect(() => { load(); }, []);

  const load = () => fetch(`${API_URL}/lookups`).then(r => r.json()).then(d => setList(d.stations));
  
  const add = () => {
      if(!name) return;
      fetch(`${API_URL}/duty-stations`, { 
          method: 'POST', 
          headers: {'Content-Type':'application/json'}, 
          body: JSON.stringify({name}) 
      }).then(() => { setName(''); load(); });
  };

  return (
    <div className="fade-in">
       <div className="page-header">
           <h2>Duty Station Management</h2>
       </div>

       <div className="split-view">
           {/* LEFT: ADD FORM */}
           <div className="card" style={{flex: 1}}>
               <h3>Register New Location</h3>
               <p style={{color:'#666', fontSize:'13px', marginBottom:'15px'}}>Enter the official designation of the new duty station.</p>
               <label style={{fontSize:'12px', fontWeight:'bold'}}>STATION NAME</label>
               <div className="input-group">
                   <input 
                        className="form-control" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="e.g. Nairobi Office" 
                        style={{marginBottom:0}}
                   />
                   <button className="btn-primary" onClick={add}>Add Location</button>
               </div>
           </div>

           {/* RIGHT: DATA TABLE */}
           <div className="card" style={{flex: 2}}>
               <h3>Active Stations</h3>
               <table className="data-table">
                   <thead>
                       <tr>
                           <th>ID</th>
                           <th>Station Name</th>
                           <th>Status</th>
                       </tr>
                   </thead>
                   <tbody>
                       {list.map(s => (
                           <tr key={s.id}>
                               <td style={{color:'#888'}}>#{s.id}</td>
                               <td style={{fontWeight:'500'}}>{s.name}</td>
                               <td><span className="tag tag-green">Active</span></td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>
       </div>
    </div>
  );
}
function AddStaffForm({ onCancel, onSave }) {
  const [form, setForm] = useState({}); const [ops, setOps] = useState({stations:[], edu:[]});
  useEffect(() => { 
      fetch(`${API_URL}/lookups`).then(r=>r.json()).then(setOps); 
  }, []);
  const save = (e) => { e.preventDefault(); fetch(`${API_URL}/staff`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) }).then(onSave); };
  return <div className="card form-card"><h3>Add Staff</h3><form onSubmit={save}><input className="form-control" placeholder="Index" onChange={e=>setForm({...form, index:e.target.value})} /><input className="form-control" placeholder="Name" onChange={e=>setForm({...form, name:e.target.value})} /><input className="form-control" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})} /><select className="form-control" onChange={e=>setForm({...form, stationId:e.target.value})}><option>Station...</option>{ops.stations.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select className="form-control" onChange={e=>setForm({...form, eduId:e.target.value})}><option>Edu...</option>{ops.edu.map(e=><option key={e.id} value={e.id}>{e.level_name}</option>)}</select><button className="btn-primary">Save</button> <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button></form></div>;
}