
const User= require("../modals/user_profile");
const Chat = require('../modals/chat');
const { sendNotification } = require("../socket");

// exports.AllUnconnectedUser = async (req, res) => {
//     try {
//       const currentUserId = req.user.id;
  
//       // Find current user's connections
//       const currentUser = await User.findById(currentUserId).select('connection');
  
//       const connectedIds = currentUser.connection.map(conn => conn.toString());
  
//       // Add the logged-in user id to exclusion list
//       connectedIds.push(currentUserId);
  
//       // Fetch users excluding self and already connected users
//       const users = await User.find({
//         _id: { $nin: connectedIds }
//       })
//       .select('firstName lastName picture')
//       .populate({
//         path: "education",
//         select: 'collegeName degree'
//       });
  
//       return res.status(200).json({ users });
  
//     } catch (err) {
//       console.error("Error fetching users:", err);
//       return res.status(400).json({ success: false, message: err.message });
//     }
//   };
  
exports.AllUnconnectedUser = async (req, res) => {
try {
  const currentUserId = req.user.id;

  // Fetch current user to get connections and sent requests
  const currentUser = await User.findById(currentUserId).select('connection connection_send');

  const connectedIds = currentUser.connection.map(id => id.toString());
  const sentRequestIds = currentUser.connection_send.map(id => id.toString());

  // Add current user to exclusion list
  const excludeIds = [...connectedIds, currentUserId];

  // Fetch all other users, excluding connected ones and self
  const users = await User.find({
    _id: { $nin: excludeIds }
  })
    .select('firstName lastName picture')
    .populate({
      path: 'education',
      select: 'collegeName degree'
    });

  // Add a flag `isPending: true` for those who are in connection_send
  const enrichedUsers = users.map(user => {
    const isPending = sentRequestIds.includes(user._id.toString());
    return {
      ...user.toObject(),
      isPending
    };
  });

  return res.status(200).json({ success: true, users: enrichedUsers });

} catch (err) {
  console.error("Error fetching users:", err);
  return res.status(400).json({ success: false, message: err.message });
}

}

exports.connect = async (currentUserId, targetUserId) => {
  try {
    console.log(`Connection request from ${currentUserId} to ${targetUserId}`);

    // Check if user already sent a request
    const currentUser = await User.findById(currentUserId).select('connection_send connection');

    if (!currentUser) {
      throw new Error('Current user not found');
    }

    // Prevent duplicate requests or if already connected
    if (
      currentUser.connection.includes(targetUserId) ||
      currentUser.connection_send.includes(targetUserId)
    ) {
      console.log('Already connected or request already sent');
      return { success: false, message: 'Already connected or request already sent' };
    }

    // Push the target user ID into connection_send array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { connection_send: targetUserId }
    });

    return { success: true, message: 'Connection request sent successfully' };

  } catch (err) {
    console.error('Error in connect function:', err);
    return { success: false, message: err.message };
  }
};


exports.acceptConnection = async (req, res) => {
  console.log("user", req.user, req.body);

  const { reqId } = req.body;
  const userId = req.user.id;

  if (!userId || !reqId) {
    return res.status(400).json({ success: false, message: "Missing userId or reqId" });
  }

  try {
    const user = await User.findById(userId);
    const requester = await User.findById(reqId);

    if (!user || !requester) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const alreadyConnected = user.connection.includes(reqId);
    if (alreadyConnected) {
      return res.status(400).json({ success: false, message: "Users already connected" });
    }

    // Update both users' connection arrays
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connection: reqId }
    });

    await User.findByIdAndUpdate(reqId, {
      $addToSet: { connection: userId }
    });
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [reqId, userId] }
    })
    .populate("users", "-password")
    .populate("latestMessage");

    if (!chat) {
      // If chat doesn't exist, create a new one
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [reqId, userId],
        latestMessage:null,
      };

      chat = await Chat.create(chatData);
      // Populate users and latestMessage in the newly created chat
      await chat.populate("users", "-password");
      await chat.populate("latestMessage");
    } else {
      // Populate sender information in latestMessage
      chat = await chat.populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email",
        }
      });
    }

    
    const msg = "You are now connected with each other";
    await sendNotification(userId, reqId, 2);

    return res.status(200).json({ success: true, chat, message: "Connection accepted successfully" });
  } catch (error) {
    console.error("Error accepting connection:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};







// creating notification

