const mongoose = require("mongoose");
const sendMail = require("../utills/sendMail");
const accountverification = require("../mailTemplate/accountverification");
const OtpSchema = new mongoose.Schema({
    email:{
        type: String,
        required:true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now,
        expires: 600*5,
    },
});

async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await sendMail(
            email,
            "Verification Email",
            accountverification(otp)
        );
        console.log("Email sent successfully :", mailResponse.response);
    }catch(error){
        console.log("Error occurred while sending email: ", error);
        throw error;
    }
    
}

//here i am defining a pre-save hook besically a feature of mongoDb that send mail before the doc has been saved
OtpSchema.pre("save", async function (next){
    console.log("New document saved to database");

    //send mail when a new doc has been created
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});
module.exports = mongoose.model("OTP", OtpSchema);