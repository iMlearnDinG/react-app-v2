import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './config/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Menu from './components/Menu';
import SessionRenewal from './SessionRenewal';
import WaitingRoom from './components/waitingRoom';
import { LobbyProvider } from './config/LobbyContext'; 


function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <LobbyProvider> 
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/lobby" element={<PrivateRoute><Lobby /></PrivateRoute>} />
              <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
              <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
              <Route path="/waiting-room" element={<PrivateRoute><WaitingRoom /></PrivateRoute>} /> {/* Add this line */}
            </Routes>
          </LobbyProvider> 
        </AuthProvider>
      </div>
    </Router>
  );
}


export default SessionRenewal(App);
