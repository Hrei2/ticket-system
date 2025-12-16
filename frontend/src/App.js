import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Events from './components/Events';
import Tickets from './components/Tickets';
import Scan from './components/Scan';
import Users from './components/Users';
import AgeRules from './components/AgeRules';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/users" element={<Users />} />
          <Route path="/age-rules" element={<AgeRules />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;