import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import api from '../api';

function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'seller' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  const handleCreate = async () => {
    await api.post('/users', form);
    setOpen(false);
    setForm({ username: '', password: '', role: 'seller' });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await api.delete(`/users/${id}`);
      fetchUsers();
    }
  };

  return (
    <Container>
      <Typography variant="h4">Users</Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>Create User</Button>
      <List>
        {users.map(user => (
          <ListItem key={user.id}>
            <ListItemText primary={user.username} secondary={user.role} />
            <IconButton onClick={() => handleDelete(user.id)} color="error">
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} fullWidth margin="normal" />
          <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="seller">Seller</MenuItem>
              <MenuItem value="scanner">Scanner</MenuItem>
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

export default Users;