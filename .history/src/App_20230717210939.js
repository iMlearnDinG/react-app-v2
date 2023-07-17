import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Menu from './components/Menu';
import SessionRenewal from './SessionRenewal';

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading...</div>;
  } else if (!user) {
    navigate('/login', { replace: true });
    return null;
  } else {
    return children;
  }
}

function App() {
  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/lobby" element={<PrivateRoute><Lobby /></PrivateRoute>} />
            <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
            <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default SessionRenewal(App);
