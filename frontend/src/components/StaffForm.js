import React, { useState } from 'react';
import axios from 'axios';

const StaffForm = ({ fetchStaff }) => {
  const [formData, setFormData] = useState({
    fullnames: '', email: '', current_location: '', highest_education: '',
    duty_station: '', remote_availability: false, software_expertise: '',
    expertise_level: '', language_level: '', level_of_responsibility: ''
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/staff', formData);
    fetchStaff();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="fullnames" placeholder="Full Names" onChange={handleChange} required/>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required/>
      <input type="text" name="current_location" placeholder="Current Location" onChange={handleChange}/>
      <input type="text" name="highest_education" placeholder="Highest Education" onChange={handleChange}/>
      <input type="text" name="duty_station" placeholder="Duty Station" onChange={handleChange}/>
      <label>
        Remote Available:
        <input type="checkbox" name="remote_availability" onChange={handleChange}/>
      </label>
      <input type="text" name="software_expertise" placeholder="Software Expertise" onChange={handleChange}/>
      <input type="text" name="expertise_level" placeholder="Expertise Level" onChange={handleChange}/>
      <input type="text" name="language_level" placeholder="Language Level" onChange={handleChange}/>
      <input type="text" name="level_of_responsibility" placeholder="Level of Responsibility" onChange={handleChange}/>
      <button type="submit">Add Staff</button>
    </form>
  );
};

export default StaffForm;
