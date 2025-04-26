const mongoose = require("mongoose");
const education = new mongoose.Schema({
    degree:{
        type:String,
    },
    collegeName:{
        type:String,
    },
    majors:{
        type:String,
    },
    from:{
        type:Date,
    },
    to:{
        type:Date,
    },
    grade:{
        type:Number
    }

});
module.exports = mongoose.model('Education', education);