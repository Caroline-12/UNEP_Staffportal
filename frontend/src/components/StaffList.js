import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StaffList = () => {
  const [staff, setStaff] = useState([]);

  const fetchStaff = async () => {
    const res = await axios.get('http://localhost:5000/api/staff');
    setStaff(res.data);
  };

  const deleteStaff = async (id) => {
    await axios.delete(`http://localhost:5000/api/staff/${id}`);
    fetchStaff();
  };

  useEffect(() => { fetchStaff(); }, []);

  return (
    <div>
      <h2>Staff List</h2>
      <table>
        <thead>
          <tr>
            <th>Index</th><th>Full Name</th><th>Email</th><th>Current Location</th><th>Highest Education</th><th>Duty Station</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.index_number}>
              <td>{s.index_number}</td>
              <td>{s.fullnames}</td>
              <td>{s.email}</td>
              <td>{s.current_location}</td>
              <td>{s.highest_education}</td>
              <td>{s.duty_station}</td>
              <td>
                <button>Edit</button>
                <button onClick={() => deleteStaff(s.index_number)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffList;
