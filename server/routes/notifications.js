const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50); // Last 50 notifications

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread notification count
router.get('/:userId/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.params.userId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.patch('/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.params.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
