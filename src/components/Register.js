import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const register = () => {
    if (!username || !password) {
      setErrors(['Please provide a username and password.']);
      return;
    }

    const userData = {
      username: username,
      password: password
    };

    axios
      .post('/api/register', userData)
      .then((res) => {
        if (res.data.success) {
          navigate('/login', { replace: true });
        } else {
          setErrors(res.data.error);
        }
      })
      .catch((error) => {
        console.log(error);
        let errorMsg = ['An error occurred during registration'];

        if (error.response && error.response.data.error) {
          errorMsg = error.response.data.error;
        }

        setErrors(errorMsg);
      });
  };

  const exit = () => {
    navigate('/login');
  };

  return (
    <div>
      <h1>Register</h1>
      {/* Registration form */}
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={register}>Register</button>
      <button onClick={exit}>Exit</button>
      {errors.length > 0 && (
        <div>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default Register;
