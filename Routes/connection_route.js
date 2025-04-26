const express = require("express");
const { auth } = require("../middlewares/auth");
const { AllUnconnectedUser, acceptConnection } = require("../controllers/connection_controller");
const router = express.Router();

router.get("/allUsers", auth, AllUnconnectedUser);


router.post("/accept-connection", auth, acceptConnection);

module.exports = router;

