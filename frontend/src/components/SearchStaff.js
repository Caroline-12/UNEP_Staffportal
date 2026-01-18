import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchStaff = () => {
    const [staff, setStaff] = useState([]);
    const [criteria, setCriteria] = useState({ fullnames: '', duty_station_id: '', education_level_id: '' });
    const [dutyStations, setDutyStations] = useState([]);
    const [educationLevels, setEducationLevels] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/duty-stations').then(res => setDutyStations(res.data));
        axios.get('http://localhost:5000/api/education-levels').then(res => setEducationLevels(res.data));
    }, []);

    const handleSearch = async () => {
        const query = new URLSearchParams(criteria).toString();
        const res = await axios.get(`http://localhost:5000/api/staff/search?${query}`);
        setStaff(res.data);
    };

    return (
        <div>
            <h2>Search Staff</h2>
            <input placeholder="Full Name" onChange={e => setCriteria({...criteria, fullnames: e.target.value})}/>
            <select onChange={e => setCriteria({...criteria, duty_station_id: e.target.value})}>
                <option value="">Select Duty Station</option>
                {dutyStations.map(ds => <option key={ds.id} value={ds.id}>{ds.station_name}</option>)}
            </select>
            <select onChange={e => setCriteria({...criteria, education_level_id: e.target.value})}>
                <option value="">Select Education Level</option>
                {educationLevels.map(el => <option key={el.id} value={el.id}>{el.level_name}</option>)}
            </select>
            <button onClick={handleSearch}>Search</button>

            <table>
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Duty Station</th><th>Education Level</th></tr>
                </thead>
                <tbody>
                    {staff.map(s => (
                        <tr key={s.index_number}>
                            <td>{s.fullnames}</td>
                            <td>{s.email}</td>
                            <td>{s.DutyStation?.station_name}</td>
                            <td>{s.EducationLevel?.level_name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
