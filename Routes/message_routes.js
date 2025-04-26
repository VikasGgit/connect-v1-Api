const express = require('express');
const {
  allMessages,
  sendMessages,
} =require("../controllers/messageController");
const {auth, isProfessional, isAdmin} = require("../middlewares/auth");

const router = express.Router();

router.route("/:chatId").get(auth, allMessages);
router.route("/").post(auth, sendMessages);

module.exports = router;