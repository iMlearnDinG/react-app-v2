import React, { useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../config/AuthContext.js';

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/logout`, {}, {
        withCredentials: true,
      });

      if (res.data.success) {
        setUser(null); // clear out the user context
        navigate('/login'); // redirect the user to the login page after successful logout
      } else {
        console.error(res.data.error); // handle error, maybe show a message to the user
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav>
      <h1>My App</h1>
      {user ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <button onClick={() => navigate('/login')}>Login</button>
      )}
      {/* Add your menu logic and components here */}
    </nav>
  );
}

export default Navbar;
