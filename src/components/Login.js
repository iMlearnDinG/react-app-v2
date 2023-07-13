import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null); // Add state for error messages

  const handleSubmit = async (e) => { // Update to be an async function
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Make a POST request to the server with the user's input
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // Include cookies in the request
    });

    const data = await response.json(); // Parse the JSON response

    if (response.ok) {
      // Login was successful, navigate to the menu page
      navigate('/menu');
    } else {
      // Login failed, display the error message
      setError(data.error);
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const isFormValid = username !== '' && password !== '';

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p>{error}</p>} {/* Display the error message if there is one */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" disabled={!isFormValid || isSubmitting}>
          Login
        </button>
      </form>
      <button onClick={handleRegisterClick}>Register</button>
    </div>
  );
}

export default Login;
