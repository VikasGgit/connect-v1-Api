
const notifications = require('../modals/notifications');
const User = require('../modals/user_profile');
const { sendNotification, getIO  } = require('../socket');
const { connect } = require('./connection_controller');
 
exports.getNotifications = async (req, res) => {
  const userId= req.user.id;
  try {
    const notifications = await
    User.findById(userId)
  .select('notification')
  .populate({
    path: 'notification',
    populate: {
      path: 'user_id',
      select: 'firstName lastName status', // only fetch name and education
      model: 'User'
    }
  });
    //  User.findById(userId).populate('notification').select('notification')
    res.status(200).json({success:true, notifications })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  exports.createNotifications = async (req, res) => {
    console.log("dlfkakjl user", req.body)
      try {
      await sendNotification(req.user.id, req.body.userId, req.body.not_code);
      if(req.body.not_code==1)
      await connect(req.user.id, req.body.userId);
        return res.status(200).json({message:"notification creation successfull"})
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };
  
exports.markAsRead = async (req, res) => {
    try {
      console.log("req, paramas", req.params)
      const notification = await notifications.findByIdAndUpdate(
        req.params.id,        
        { read: true },
        { new: true }
      )
      
      // if (notification) {
      //   // Emit update to the user
      //   const unreadCount = await notifications.countDocuments({
      //     user_id: req.user._id,
      //     read: false
      //   });
      //   getIO().to(req.user.id.toString()).emit('updateUnreadCount', unreadCount);
      // }
      
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.markAllAsRead = async (req, res) => {
    try {
      await notifications.updateMany(
        { user_id: req.user.id, read: false },
        { $set: { read: true } }
      );
      
      // Emit update to the user
      // getIO().to(req.user.id.toString()).emit('updateUnreadCount', 0);
      
      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };