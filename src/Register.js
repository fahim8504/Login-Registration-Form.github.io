import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password
      });
      alert(res.data.msg);
      navigate('/login'); // ✅ redirect after successful register
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
        
        {form.confirmPassword && (
          <p style={{ color: passwordsMatch ? 'green' : 'red' }}>
            {passwordsMatch ? 'Passwords match ✅' : 'Passwords do not match ❌'}
          </p>
        )}

        <button type="submit">Register</button>
        <div className="link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
