const express = require('express');
const router = express.Router();
const {auth, isProfessional, isAdmin} = require("../middlewares/auth");
const {accessChat, fetchChats} = require("../controllers/chatController");

router.route("/").post(auth, accessChat);
router.route("/").get( auth, fetchChats);

module.exports = router;

