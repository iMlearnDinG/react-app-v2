import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/register.css'
import registerImage from '../media/register-image.png';
import registerImage1 from '../media/register-image1.png';
import registerImage2 from '../media/register-image2.png';
import registerImage3 from '../media/register-image3.png';
import backgroundVideo from '../media/video.mp4'
import $ from "jquery";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [isImageAnimated, setImageAnimated] = useState(false);

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
      .post(`${process.env.REACT_APP_API_BASE_URL}/register`, userData)
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

  useEffect(() => {
    const videoElement = $('.background-video')[0];
    if (videoElement) {
      videoElement.playbackRate = 0.42;
    }
  }, []);

  const exit = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <img src={registerImage} alt="Register" className={`register-image ${isImageAnimated ? "animate" : ""}`} />
      <video id="background-video" className="background-video" autoPlay loop muted playsInline>
          <source src={backgroundVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      <h1 className="register-heading">Register</h1>
        <img
        src={registerImage1}
        alt="Register"
        className="register-image1"
        style={{ transform: "scaleY(-1)" }}
      />
      {/* Registration form */}
      <div>
        <input  className="register-input"
          type="text"
          id="username"
          placeholder='Choose a username...'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <input  className="register-input"
          type="password"
          id="password"
          placeholder='Create a password...'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
        <img
        src={registerImage2}
        alt="Register"
        className="register-image2"
      />
        <img
        src={registerImage3}
        alt="Register"
        className="register-image3"
        />
      <div className="button-container"></div>
        <button className="register-button" onClick={register}>Register</button>
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
