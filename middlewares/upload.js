const multer = require('multer');
const { storage, profileStorage } = require('../config/cloudinary');

const upload = multer({ storage });

const uploadProfileImage=multer({storage:profileStorage})


module.exports = {upload, uploadProfileImage};

