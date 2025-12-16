import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import api from '../api';

function Tickets() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [form, setForm] = useState({ name: '', surname: '', birthdate: '', email: '' });
  const [editForm, setEditForm] = useState({ name: '', surname: '', birthdate: '', email: '', status: 'sold' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await api.get('/events');
    setEvents(res.data);
  };

  const fetchTickets = async (eventId) => {
    const res = await api.get(`/tickets/${eventId}`);
    setTickets(res.data);
  };

  const handleSell = async () => {
    const res = await api.post('/tickets', { ...form, event_id: selectedEvent });
    setOpen(false);
    setForm({ name: '', surname: '', birthdate: '', email: '' });
    fetchTickets(selectedEvent);
    // Show QR or something
    alert('Ticket sold! QR: ' + res.data.qr_code);
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket.id);
    setEditForm({ name: ticket.name, surname: ticket.surname, birthdate: ticket.birthdate, email: ticket.email, status: ticket.status });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    await api.put(`/tickets/${editingTicket}`, editForm);
    setEditOpen(false);
    setEditingTicket(null);
    fetchTickets(selectedEvent);
  };

  return (
    <Container>
      <Typography variant="h4">Tickets</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Select Event</InputLabel>
        <Select value={selectedEvent} onChange={(e) => { setSelectedEvent(e.target.value); fetchTickets(e.target.value); }}>
          {events.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
        </Select>
      </FormControl>
      <Button variant="contained" onClick={() => setOpen(true)} disabled={!selectedEvent}>Sell Ticket</Button>
      <List>
        {tickets.map(ticket => (
          <ListItem key={ticket.id}>
            <ListItemText primary={`#${ticket.number} ${ticket.name} ${ticket.surname}`} secondary={ticket.status} />
            {user && user.role === 'admin' && (
              <IconButton onClick={() => handleEdit(ticket)}>
                <Edit />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Sell Ticket</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth margin="normal" />
          <TextField label="Surname" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} fullWidth margin="normal" />
          <TextField label="Birthdate (DDMMYY)" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} fullWidth margin="normal" />
          <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSell}>Sell</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          <TextField label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} fullWidth margin="normal" />
          <TextField label="Surname" value={editForm.surname} onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })} fullWidth margin="normal" />
          <TextField label="Birthdate (DDMMYY)" value={editForm.birthdate} onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })} fullWidth margin="normal" />
          <TextField label="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} fullWidth margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              <MenuItem value="sold">Sold</MenuItem>
              <MenuItem value="used">Used</MenuItem>
              <MenuItem value="void">Void</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate}>Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Tickets;