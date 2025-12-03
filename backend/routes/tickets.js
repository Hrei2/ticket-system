const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const TicketHistory = require('../models/TicketHistory');
const { sendTicketEmail } = require('../utils/emailService');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Create ticket (seller only)
router.post('/',
  authMiddleware,
  roleCheck('seller', 'admin'),
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('surname').trim().notEmpty().withMessage('Surname is required'),
    body('birthdate').matches(/^\d{6}$/).withMessage('Birthdate must be in DDMMYY format'),
    body('class').trim().notEmpty().withMessage('Class is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, name, surname, birthdate, class: ticketClass } = req.body;

      // Validate birthdate format
      const day = parseInt(birthdate.substring(0, 2));
      const month = parseInt(birthdate.substring(2, 4));
      if (day < 1 || day > 31 || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Invalid birthdate' });
      }

      // Create ticket
      const ticket = await Ticket.create({
        email,
        name,
        surname,
        birthdate,
        ticketClass
      }, req.user.id);

      // Log creation
      await TicketHistory.create(
        ticket.id,
        'created',
        null,
        JSON.stringify(ticket),
        req.user.id
      );

      // Send email
      try {
        await sendTicketEmail(ticket);
      } catch (emailError) {
        console.error('Email send failed:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        message: 'Ticket created successfully',
        ticket
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all tickets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { isScanned, class: ticketClass, search } = req.query;

    const filters = {};
    if (isScanned !== undefined) {
      filters.isScanned = isScanned === 'true';
    }
    if (ticketClass) {
      filters.class = ticketClass;
    }
    if (search) {
      filters.search = search;
    }

    const tickets = await Ticket.getAll(filters);
    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single ticket
router.get('/:ticketNumber', authMiddleware, async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const ticket = await Ticket.findByTicketNumber(ticketNumber);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ticket statistics
router.get('/stats/summary', authMiddleware, roleCheck('admin'), async (req, res) => {
  try {
    const stats = await Ticket.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
