import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../api';

function Events() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', date: '', time: '', start_number: 1, assigned_users: [] });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchEvents();
    if (user.role === 'admin') fetchUsers();
  }, []);

  const fetchEvents = async () => {
    const res = await api.get('/events');
    setEvents(res.data);
  };

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  const handleCreate = async () => {
    await api.post('/events', form);
    setOpen(false);
    setForm({ name: '', description: '', date: '', time: '', start_number: 1, assigned_users: [] });
    fetchEvents();
  };

  return (
    <Container>
      <Typography variant="h4">Events</Typography>
      {user.role === 'admin' && <Button variant="contained" onClick={() => setOpen(true)}>Create Event</Button>}
      <List>
        {events.map(event => (
          <ListItem key={event.id}>
            <ListItemText primary={event.name} secondary={`${event.date} ${event.time}`} />
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Event</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth margin="normal" />
          <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth margin="normal" />
          <TextField label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField label="Start Number" type="number" value={form.start_number} onChange={(e) => setForm({ ...form, start_number: parseInt(e.target.value) })} fullWidth margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Assigned Users</InputLabel>
            <Select multiple value={form.assigned_users} onChange={(e) => setForm({ ...form, assigned_users: e.target.value })}>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Events;