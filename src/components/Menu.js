import React from 'react';
import { useNavigate } from 'react-router-dom';

function Menu() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    const data = await response.json();

    if (data.success) {
      // redirect the user to the login page after successful logout
      navigate('/login');
    } else {
      // handle error, maybe show a message to the user
      console.error(data.error);
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
