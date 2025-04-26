require('dotenv').config();

const { Server } = require('socket.io');
const FRONTEND_URL=process.env.FRONTEND_URL;
const notifications = require('./modals/notifications');
const user_profile = require('./modals/user_profile');

let io;

exports.initializeSocket = (server) => {
  if (io) {
    console.log("Socket.io already initialized");
    return io;
  }

  console.log("Initializing Socket.io");

  io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinUserRoom', async (userId) => {
      try {
        if (!userId) return;

        socket.join(userId.toString());
        console.log(`User ${userId} joined their room`);

        const unreadCount = await notifications.countDocuments({
          user_id: userId,
          read: false
        });
        socket.emit('initialUnreadCount', unreadCount);
      } catch (err) {
        console.error('Error in joinUserRoom:', err);
      }
    });
   
    //chat socket wirtten here 
    socket.on("setup",  async (user) => {
      console.log("User Connected", user);
      socket.join(user);
      console.log(`User joined self room ${user}`);
      socket.emit("connected");
    });
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log(`User joined room ${room}`);
    });

    socket.on("newMessage", (newMessageStatus) => {
      var chat = newMessageStatus.chat;
      console.log("new message from socket",newMessageStatus);
      if(!chat.users){
        return console.log("chat.users not defined");
      }
      chat.users.forEach((user) => {
        console.log("this is user",user);
        if(user == newMessageStatus.sender._id) return;
        
        socket.in(user).emit("new message", newMessageStatus);
      });
      
    });
    //end
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// exports.sendNotification = async (req_id,userId, code) => {
//   try {
//     const io = exports.getIO();
//     const notification = await notifications.create({
//       user_id: req_id,
//       code,
//       read: false
//     });

//     const pushedIntoUser=await user_profile.findByIdAndUpdate(userId, { $push : {notification : notification._id}})


//     const populatedNotification = await user_profile.findById(userId).populate('notification')
      

//     io.to(userId.toString()).emit('newNotification', populatedNotification);

//     const unreadCount = await notifications.countDocuments({
//       user_id: userId,
//       read: false
//     });
//     io.to(userId.toString()).emit('updateUnreadCount', unreadCount);

//     return populatedNotification;
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     throw error;
//   }
// };





exports.sendNotification = async (req_id, userId, not_code) => {
  try {
    const io = exports.getIO();

    const notification = await notifications.create({
      user_id: req_id,
      not_code,
      read: false
    });

    console.log("notifications", notification)

    // Push new notification and get updated user with populated notifications
    const updatedUserProfile = await user_profile.findByIdAndUpdate(
      userId,
      { $push: { notification: notification._id } },
      { new: true }
    ).populate('notification');

    // Emit the new notification to the client
    io.to(userId.toString()).emit('newNotification', notification);

      
    // // ✅ Count total notifications stored in the user profile's array
    // const totalNotifications = updatedUserProfile.notification.length;
    // io.to(userId.toString()).emit('totalNotificationsCount', totalNotifications);

    return updatedUserProfile;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};
