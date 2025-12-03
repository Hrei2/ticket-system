const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const EventSettings = require('../models/EventSettings');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get event settings (all authenticated users)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const settings = await EventSettings.get();
    if (!settings) {
      return res.status(404).json({ error: 'Event settings not found' });
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event settings (admin only)
router.put('/', 
  authMiddleware, 
  roleCheck('admin'),
  [
    body('eventDate').isISO8601().withMessage('Invalid date format'),
    body('ageColorRanges').isObject().withMessage('Age color ranges must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { eventDate, ageColorRanges } = req.body;

      const updatedSettings = await EventSettings.update(
        eventDate,
        [],
        ageColorRanges
      );

      res.json({
        message: 'Settings updated successfully',
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
