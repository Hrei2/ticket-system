const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const EventSettings = require('../models/EventSettings');
const TicketHistory = require('../models/TicketHistory');
const { calculateAge, getAgeColor, formatBirthdate } = require('../utils/ageCalculator');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Scan/validate ticket (scanner only)
router.post('/scan/:ticketNumber',
  authMiddleware,
  roleCheck('scanner', 'admin'),
  async (req, res) => {
    try {
      const { ticketNumber } = req.params;

      // Find ticket
      const ticket = await Ticket.findByTicketNumber(ticketNumber);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Check if already scanned
      if (ticket.is_scanned) {
        return res.status(400).json({
          error: 'Ticket already scanned',
          scannedAt: ticket.scanned_at,
          scannedBy: ticket.scanned_by_username
        });
      }

      // Get event settings for age calculation
      const settings = await EventSettings.get();
      if (!settings) {
        return res.status(500).json({ error: 'Event settings not configured' });
      }

      // Calculate age
      const age = calculateAge(ticket.birthdate, settings.event_date);
      const ageColor = getAgeColor(age, settings.age_color_ranges);

      // Mark as scanned
      const scannedTicket = await Ticket.markAsScanned(ticketNumber, req.user.id);

      // Log scan
      await TicketHistory.create(
        ticket.id,
        'scanned',
        null,
        `Scanned at ${new Date().toISOString()}`,
        req.user.id
      );

      res.json({
        message: 'Ticket scanned successfully',
        ticket: {
          ticketNumber: scannedTicket.ticket_number,
          name: scannedTicket.name,
          surname: scannedTicket.surname,
          email: scannedTicket.email,
          class: scannedTicket.class,
          birthdate: formatBirthdate(scannedTicket.birthdate),
          age,
          ageColor,
          scannedAt: scannedTicket.scanned_at
        }
      });
    } catch (error) {
      console.error('Scan ticket error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Validate ticket without scanning (preview)
router.get('/validate/:ticketNumber',
  authMiddleware,
  roleCheck('scanner', 'admin'),
  async (req, res) => {
    try {
      const { ticketNumber } = req.params;

      // Find ticket
      const ticket = await Ticket.findByTicketNumber(ticketNumber);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Get event settings for age calculation
      const settings = await EventSettings.get();
      if (!settings) {
        return res.status(500).json({ error: 'Event settings not configured' });
      }

      // Calculate age
      const age = calculateAge(ticket.birthdate, settings.event_date);
      const ageColor = getAgeColor(age, settings.age_color_ranges);

      res.json({
        valid: true,
        ticket: {
          ticketNumber: ticket.ticket_number,
          name: ticket.name,
          surname: ticket.surname,
          email: ticket.email,
          class: ticket.class,
          birthdate: formatBirthdate(ticket.birthdate),
          age,
          ageColor,
          isScanned: ticket.is_scanned,
          scannedAt: ticket.scanned_at,
          scannedBy: ticket.scanned_by_username
        }
      });
    } catch (error) {
      console.error('Validate ticket error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
