const mongoose = require("mongoose");
const volunteer = new mongoose.Schema({
    role:{
        type:String,
    },
    organization:{
        type:String,
    },
    durationFrom:{
        type:Date,
    },
    durationTo:{
        type:Date,
    },
    field:{
        type:String,
    }
});
module.exports = mongoose.model('Volunteer', volunteer);