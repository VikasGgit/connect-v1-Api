const express = require("express");
const router = express.Router();
const {auth, isProfessional, isAdmin} = require("../middlewares/auth");
const {signup, login, otpsend ,userDetails, getUserDetails, userEducation, deleteUserEducation, userProjects,deleteProject, volunteer,deleteVolunteer, userSkills, userImageUpload} = require("../controllers/user_controller");
const User = require("../modals/user_profile");
const { uploadProfileImage } = require("../middlewares/upload");

router.post("/user_login", login);
// router.post("/admin_login", login);
router.post("/user_signup", signup);
router.post("/sendOTP", otpsend )
router.put("/details/:id", auth, isProfessional, userDetails);
router.put("/education/:id", auth, isProfessional, userEducation);
router.put("/project/:id", auth,isProfessional, userProjects);
router.put("/volunteer/:id", auth, isProfessional, volunteer);
router.put("/skills/:id", auth,isProfessional, userSkills);
router.get("/getuser/:id", auth, getUserDetails);
router.post('/profile/picture',auth, uploadProfileImage.single('picture'), userImageUpload);

router.delete("/education/:id", auth, deleteUserEducation);
router.delete("/project/:id", auth, deleteProject);
router.delete("/volunteer/:id", auth, deleteVolunteer);
module.exports = router;