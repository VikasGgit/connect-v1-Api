const mongoose = require("mongoose");
const skills = new mongoose.Schema({
    skill:{
        type:String,
    }
});
module.exports = mongoose.model('Skills', skills);