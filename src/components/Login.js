import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../config/AuthContext';
import "../css/login.css";
import loginImage0 from "../media/login-image.png";
import loginImage1 from "../media/login-image1.png";
import backgroundVideo from "../media/video.mp4";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    const data = await response.json();
    setIsSubmitting(false);
    if (data.success) {
      setUser(data.data.user);
      navigate('/menu');
    } else {
      setError(data.error);
    }
  };


  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const isFormValid = username !== '' && password !== '';

  const handleRegisterClick = async () => {
    navigate('/register');
  };

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/check-session`, {
        credentials: 'include', // This is important for sending the session cookie
      });
  
      const data = await response.json();
  
      if (data.loggedIn) {
        setUser(data.user);
        navigate('/menu');
      }
    };
  
    checkSession();
  
    const video = document.getElementById('background-video');
    if (video) {
      video.playbackRate = 0.39;
    }
  }, []);


  return (
    <div className="login-header">
      <img id="login-image0" src={loginImage0} alt="Login" className="login-image0" />
      <video id="background-video" src={backgroundVideo} type="video/mp4" className="background-video" autoPlay loop muted playsInline></video>

      <h1 className="glow-text" style={{ textAlign: 'center' }}>B L I N D</h1>
      <h2 className="glow-text" style={{ textAlign: 'center' }}>E Y E</h2>

      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>

        <div className="login-input-group">
          <input
            type="text"
            placeholder='Username'
            id="username"
            name="username"
            value={username}
            onChange={handleInputChange}
            className='login-input'
          />
          <input
            type="password"
            placeholder='Password'
            id="password"
            name="password"
            value={password}
            onChange={handleInputChange}
            className='login-input'
          />
        </div>
        <div/><button type="submit" className="login-button" disabled={!isFormValid || isSubmitting}><div/>
          Login
        </button>
      </form>
      
        <img id="login-image1" src={loginImage1} alt="Login" className="login-image1" />
        <div className="signup-section"><p>Don't have an account?</p></div>
        
      <div/> <button className="register-button" onClick={handleRegisterClick}>Register</button> <div/>
    </div>
  );
}

export default Login;
