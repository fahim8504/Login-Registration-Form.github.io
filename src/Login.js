import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';  // Correct named import
import { FcGoogle } from 'react-icons/fc'; // Optional for custom button icon

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/login', form);
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        <div className="link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("Google user info:", decoded);

            axios.post('http://localhost:5000/api/google-login', {
              email: decoded.email,
              fullName: decoded.name,
            })
            .then(res => {
              alert(res.data.msg);
              navigate('/home'); // or /dashboard
            })
            .catch(err => {
              alert(err.response?.data?.msg || 'Google login failed');
            });
          }}
          onError={() => {
            alert('Google Login Failed');
          }}
          useOneTap
          theme="outline"
          width="100%"
          text="signin_with"
        />

        {/* Uncomment below for a custom Google button with icon */}
        {/*
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            const decoded = jwtDecode(credentialResponse.credential);
            // Your code...
          }}
          onError={() => alert('Google Login Failed')}
          render={renderProps => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 20px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              <FcGoogle size={20} style={{ marginRight: '10px' }} />
              Continue with Google
            </button>
          )}
        />
        */}
      </div>
    </div>
  );
}

export default Login;
