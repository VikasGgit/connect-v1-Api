const asyncHandler = require('express-async-handler');
const Chat = require('../modals/chat');
const User = require('../modals/user_profile');

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  try {
    // Find the chat where both users are participants
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] }
    })
    .populate("users", "-password")
    .populate("latestMessage");

    if (!chat) {
      // If chat doesn't exist, create a new one
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
        latestMessage:null,
      };

      chat = await Chat.create(chatData);
      // Populate users and latestMessage in the newly created chat
      chat = await chat.populate('users', '-password').populate('latestMessage').execPopulate();
    } else {
      // Populate sender information in latestMessage
      chat = await chat.populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name email",
        }
      }).execPopulate();
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(400).send(error.message);
  }
});


const fetchChats = asyncHandler(async (req,res) => {
  
  try{
    console.log("User ID making request:", req.user.id);

    Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        console.log("results", results);
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name email",
        });
        console.log("updated result", results)
        res.status(200).send(results);
      });
  }catch(error){
    res.status(400);
    throw new Error(error.message);
  }
});


module.exports = {accessChat, fetchChats};