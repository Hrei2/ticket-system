import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

function AgeRules() {
  const [rules, setRules] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ min_age: '', max_age: '', color: 'green' });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/age-rules', { headers: { Authorization: `Bearer ${token}` } });
      setRules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (rule = null) => {
    if (rule) {
      setEditing(rule.id);
      setForm({ min_age: rule.min_age, max_age: rule.max_age, color: rule.color });
    } else {
      setEditing(null);
      setForm({ min_age: '', max_age: '', color: 'green' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editing) {
        await axios.put(`/api/age-rules/${editing}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/age-rules', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchRules();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/age-rules/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Age Rules</Typography>
      <Button variant="contained" onClick={() => handleOpen()}>Add Rule</Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Min Age</TableCell>
              <TableCell>Max Age</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>{rule.min_age}</TableCell>
                <TableCell>{rule.max_age}</TableCell>
                <TableCell>{rule.color}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(rule)}>Edit</Button>
                  <Button onClick={() => handleDelete(rule.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editing ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Min Age"
            type="number"
            value={form.min_age}
            onChange={(e) => setForm({ ...form, min_age: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Max Age"
            type="number"
            value={form.max_age}
            onChange={(e) => setForm({ ...form, max_age: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Color</InputLabel>
            <Select
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            >
              <MenuItem value="red">Red</MenuItem>
              <MenuItem value="yellow">Yellow</MenuItem>
              <MenuItem value="green">Green</MenuItem>
              <MenuItem value="blue">Blue</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AgeRules;