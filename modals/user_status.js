const mongoose = require("mongoose");
const statusSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'

    },
    position:{
        type:String,
    },
    organization:{
        type:String,
    },
    city:{
        type:String,
    },
    state:{
        type:String,
    },
    zip:{
        type:Number,
    }
});
module.exports = mongoose.model('Status', statusSchema);