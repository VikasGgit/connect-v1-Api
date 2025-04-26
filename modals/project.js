const mongoose = require("mongoose");
const project = new mongoose.Schema({
    
    projectName:{
        type:String,
    },
    durationFrom:{
        type:Date,
    },
    durationTo:{
      type:Date,
    },
    projectDescription:{
        type:String,
    },
    projectLink:{
        type:String,
    }
});
module.exports = mongoose.model('Project', project);