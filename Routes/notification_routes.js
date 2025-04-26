const express = require('express')
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotifications
} =require( '../controllers/notificationController');
const  { auth } = require( '../middlewares/auth');

const router = express.Router();

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
router.route('/')
  .get(auth, getNotifications)
  .post(auth, createNotifications);

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.route('/:id/read')
  .put(auth, markAsRead);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.route('/read-all')
  .put(auth, markAllAsRead);

module.exports=router;