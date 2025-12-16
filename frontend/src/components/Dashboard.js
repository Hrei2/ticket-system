import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Ticket System</Typography>
          <Button color="inherit" onClick={() => navigate('/')}>Dashboard</Button>
          {user.role === 'admin' && <Button color="inherit" onClick={() => navigate('/users')}>Users</Button>}
          {user.role === 'admin' && <Button color="inherit" onClick={() => navigate('/age-rules')}>Age Rules</Button>}
          <Button color="inherit" onClick={() => navigate('/events')}>Events</Button>
          {(user.role === 'admin' || user.role === 'seller') && <Button color="inherit" onClick={() => navigate('/tickets')}>Tickets</Button>}
          {(user.role === 'admin' || user.role === 'scanner') && <Button color="inherit" onClick={() => navigate('/scan')}>Scan</Button>}
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4">Welcome, {user.username} ({user.role})</Typography>
          <Typography>Select an option from the menu.</Typography>
        </Box>
      </Container>
    </div>
  );
}

export default Dashboard;