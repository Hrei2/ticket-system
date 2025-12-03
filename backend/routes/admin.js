const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const TicketHistory = require('../models/TicketHistory');
const { sendTicketUpdateEmail } = require('../utils/emailService');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Update ticket (admin only)
router.put('/tickets/:id',
  authMiddleware,
  roleCheck('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Get original ticket
      const originalTicket = await Ticket.findById(id);
      if (!originalTicket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Validate birthdate if provided
      if (updates.birthdate) {
        if (!/^\d{6}$/.test(updates.birthdate)) {
          return res.status(400).json({ error: 'Birthdate must be in DDMMYY format' });
        }
        const day = parseInt(updates.birthdate.substring(0, 2));
        const month = parseInt(updates.birthdate.substring(2, 4));
        if (day < 1 || day > 31 || month < 1 || month > 12) {
          return res.status(400).json({ error: 'Invalid birthdate' });
        }
      }

      // Update ticket
      const updatedTicket = await Ticket.update(id, updates);

      // Log changes
      const changes = {};
      Object.keys(updates).forEach(key => {
        if (originalTicket[key] !== updates[key]) {
          changes[key] = updates[key];
        }
      });

      if (Object.keys(changes).length > 0) {
        await TicketHistory.create(
          id,
          'updated',
          JSON.stringify(originalTicket),
          JSON.stringify(changes),
          req.user.id
        );

        // Send email notification if owner changed
        if (changes.owner_email) {
          try {
            await sendTicketUpdateEmail(updatedTicket, changes);
          } catch (emailError) {
            console.error('Update email failed:', emailError);
          }
        }
      }

      res.json({
        message: 'Ticket updated successfully',
        ticket: updatedTicket
      });
    } catch (error) {
      console.error('Update ticket error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete ticket (admin only)
router.delete('/tickets/:id',
  authMiddleware,
  roleCheck('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Log deletion
      await TicketHistory.create(
        id,
        'deleted',
        JSON.stringify(ticket),
        null,
        req.user.id
      );

      await Ticket.delete(id);

      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Delete ticket error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get ticket history (admin only)
router.get('/tickets/:id/history',
  authMiddleware,
  roleCheck('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const history = await TicketHistory.getByTicketId(id);
      res.json(history);
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all history (admin only)
router.get('/history',
  authMiddleware,
  roleCheck('admin'),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const history = await TicketHistory.getAll(limit);
      res.json(history);
    } catch (error) {
      console.error('Get all history error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
