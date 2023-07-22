import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../config/AuthContext.js';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/logout`, {}, {
        withCredentials: true,
      });

      if (res.data.success) {
        setUser(null);
        navigate('/login');
      } else {
        console.error(res.data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <header >
        <h1>My App</h1>
        {user && (
          <button onClick={handleLogout}>Logout</button>
        )}
        {!user && (
          <button onClick={() => navigate('/login')}>Login</button>
        )}
      </header>

      <footer>
        <p>© 2023 My App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Navbar;
