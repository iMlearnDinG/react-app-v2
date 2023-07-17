import React, { useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext.js';

function Menu() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

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
    <div>
      <h1>Menu</h1>
      <button onClick={handleLogout}>Logout</button>
      {/* Add your menu logic and components here */}
    </div>
  );
}

export default Menu;
