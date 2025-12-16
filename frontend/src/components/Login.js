import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4">Login</Typography>
        <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth margin="normal" />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal" />
        <Button variant="contained" onClick={handleLogin} fullWidth sx={{ mt: 2 }}>Login</Button>
      </Box>
    </Container>
  );
}

export default Login;