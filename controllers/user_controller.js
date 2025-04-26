const bcrypt = require("bcrypt");
const User = require("../modals/user_profile");
const jwt = require("jsonwebtoken");
const OTP = require("../modals/otp");
const Status = require("../modals/user_status");
const Education = require("../modals/education");
const Project = require("../modals/project");
const Volunteer = require("../modals/volunteering");
const otpGenerator = require("otp-generator");

const otpMailTemp = require("../mailTemplate/accountverification");
const welcomeMailTemp = require("../mailTemplate/welcomeMailTemp");
const sendMail = require("../utills/sendMail");

require("dotenv").config();

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      role,
      otp,
    } = req.body;

    console.log("User email is", email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Validate OTP
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log("OTP response:", response);

    if (!response.length || otp !== response[0].otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    // Hash the password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("Password hashed successfully:", hashedPassword);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing password",
      });
    }

    // Assign default role
    const userRole = "professional";

    // Create the user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Use correct field name
      phone,
      gender,
      role: userRole,
    });
    console.log("User created:", user);
    const payLoad = {
      email: user.email,
      id: user._id,
      role: user.role
    }
    let token = jwt.sign(payLoad, process.env.JWT_SECRET, {
      expiresIn: "60d",
    });
    const option = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }
    

    // Send welcome email
    try {
      const title = "Welcome to Connect";
      const welcomeMail = await sendMail(email, title, welcomeMailTemp(firstName));
      console.log("Welcome email sent successfully:", welcomeMail);
    } catch (error) {
      console.log("Error in sending welcome email:", error);
      return res.status(500).json({
        success: false,
        message: "Error in sending welcome email",
        error: error.message,
      });
    }
    return res.cookie("token", token, option).status(200).json({ //cookie(#name , #data , #option)
      success: true,
      token,
      user,
      message: "User registred successfully",
    });


  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "User can't be registered, please try again later",
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { role, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        messsage: "please fill all details carefully",
      });

    }
    //check for registered user 
    let user = await User.findOne({ email }).populate("connection status education", "-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not Registered",
      });
    }
    if (role != user.role) {
      return res.status(400).json({
        success: false,
        message: "Invalid authorization",

      });
    }
    const payLoad = {
      email: user.email,
      id: user._id,
      role: user.role,
    };
    //verify password & genrate a jwt token
    if (await bcrypt.compare(password, user.password)) {
      //password match 
      let token = jwt.sign(payLoad, process.env.JWT_SECRET, {
        expiresIn: "60d",
      });
      user = user.toObject();
      user.token = token;
      user.password = undefined;
      const option = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }

      return res.cookie("token", token, option).status(200).json({ //cookie(#name , #data , #option)
        success: true,
        token, user,
        message: "User Logged in successfully",

      });

    } else {
      return res.status(403).json({
        success: false,
        message: "Password Incorrect"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Login failure",
    });
  }
};



exports.otpsend = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      })
    }
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const result = await OTP.findOne({ otp: otp });
    console.log("otp", otp);
    console.log("result", result);
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }
    const otpbody = await OTP.create({ email, otp });
    console.log("OTP Body", otpbody);

    // //send notification 
    // try{
    //     const title = `Email verification OTP`
    //     const sendEmail = await sendMail(email, title ,   otpMailTemp(firstName, otp));
    //     console.log("Email Send Successfully", sendEmail.response);
    // }
    // catch(error){
    //      console.log("Error in sending email", error);
    //      return res.status(500).json({
    //         success:false,
    //         message:"Error in sending mail",
    //         error:error.message
    //      });
    // }
    res.status(200).json({
      success: true,
      message: "Otp has been send to your mail",
    })
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
exports.userDetails = async (req, res) => {
  try {
    const { position, organization, city, state, zip } = req.body;
    const userId = req.user.id;
    console.log("organization ", organization);
    let user = await User.findById(userId).populate("status");
    if (user.status) {
      const updatedStatus = await Status.findByIdAndUpdate(user.status._id, { position, organization, city, state, zip }, { new: true });
      res.status(200).json({
        sucess: true,
        details: { ...user.toObject(), status: updatedStatus },
        message: "status updated successfuly"
      })
    } else {

      const currstatus = await Status.create({
        userId,
        position,
        organization,
        city,
        state,
        zip,

      });
      const details = await User.findByIdAndUpdate(userId, { status: currstatus._id }, { new: true }).populate("status");
      console.log("details", details);
      console.log("current Status", currstatus);
      res.status(200).json({
        success: true,
        details,
        message: "status has been update"
      })
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "status has not updated yet"
    })
  }
}
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID not found in request" });
    }

    let userDetails = await User.findById(userId).lean(); // Convert Mongoose document to plain object we can also use toObject() that can convert mongoose document into plain object

    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    const fieldsToPopulate = [];
    if (userDetails.education?.length) fieldsToPopulate.push("education");
    if (userDetails.volunteering?.length) fieldsToPopulate.push("volunteering");
    if (userDetails.connection?.length) fieldsToPopulate.push("connection");
    if (userDetails.projects?.length) fieldsToPopulate.push("projects");
    if (userDetails.skills?.length) fieldsToPopulate.push("skills");
    if (userDetails.status) fieldsToPopulate.push("status");

    if (fieldsToPopulate.length) {
      userDetails = await User.findById(userId).populate(fieldsToPopulate);
    }

    console.log("current Status", userDetails);
    res.status(200).json({ success: true, userDetails, message: "User fetched successfully" });

  } catch (error) {
    console.error("Error fetching user details:", error.message);
    res.status(500).json({ success: false, message: "Error in fetching Users" });
  }
};

//TO add education 
exports.userEducation = async (req, res) => {
  try {
    const { degree,
      collegeName,
      majors,
      durationFrom,
      durationTo,
      grade } = req.body;
    const userId = req.user.id;
    const EducationID = req?.params?.id;
    
    if (EducationID != "null") {
      const newEducation = await Education.findByIdAndUpdate(EducationID, {
        degree,
        collegeName,
        majors,
        from: durationFrom,
        to: durationTo,
        grade
      }, { new: true });
      if (!newEducation) {
        return res.status(404).json({ message: 'updation faild' });
      }
      res.status(200).json({ message: 'Education updated successfully', updateEducation: newEducation });
    } else {

      const newEducation = await Education.create({
        degree,
        collegeName,
        majors,
        from: durationFrom,
        to: durationTo,
        grade
      });
      const updatedUserEducation = await User.findByIdAndUpdate(userId, { $push: { education: newEducation._id } }, { new: true });
      if (!updatedUserEducation) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'Education created successfully', user: updatedUserEducation });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
//To update existing User 
//update aur delete ka bhi likhna hai...to be continue

//delete education 
exports.deleteUserEducation = async (req, res) => {
  try {
    const userId = req.user.id;
    const EducationID = req.params;
    console.log("Delete", EducationID);
    const newEducation = await Education.findByIdAndDelete(EducationID.id);
    const updatedUserEducation = await User.findByIdAndUpdate(userId, { $pull: { education: EducationID.id } }, { new: true });
    if (!updatedUserEducation) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Education deleted successfully', user: updatedUserEducation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.userProjects = async (req, res) => {
  try {
    const { projectName,
      durationFrom,
      durationTo,
      projectDescription,
      projectLink } = req.body;
    const userId = req.user.id;
    const projectId = req.params.id;
    if(projectId != "null"){
      const updateProject = await Project.findByIdAndUpdate(projectId, {projectName,
        durationFrom,
        durationTo,
        projectDescription,
        projectLink}, {new:true});
        if(!updateProject){
          return res.status(400).json({
            success:false,
            message:"ProjectId Invalid"
          })

        }
        res.status(200).json({
          success:true,
          updatedProject:updateProject,

        })
    }else{

      const newProject = await Project.create({
        projectName,
        durationFrom,
        durationTo,
        projectDescription,
        projectLink
      });
      const updatedUserProject = await User.findByIdAndUpdate(userId, { $push: { projects: newProject._id } }, { new: true });
      if (!updatedUserProject) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'Project submitted successfully', user: updatedUserProject });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
exports.deleteProject = async (req, res) => {
  try{
      const projectId = req.params.id;
      const userId = req.user.id;
      console.log(projectId);
      console.log(userId);
      const deleteResponse = await Project.findByIdAndDelete(projectId);
      const updatedUser = await User.findByIdAndUpdate(userId, {$pull : {projects:projectId}}, {new:true});
      if(!updatedUser){
       return res.status(400).json({
          success:false,
          message:"User not found"
        })
      }
      res.status(200).json({
         success:true,
         message:"Project Deleted successfully"
      })


  }catch(error){
        console.log(error);
        res.status(500).json({
          success:false,
          messsage:"Internal server error",
        })
  }
}
exports.volunteer = async (req, res) => {
  try {

    const {
      role,
      organization,
      durationFrom,
      durationTo,
      field,
    } = req.body;
    const userId = req.user.id;
    const volunteerId = req.params.id;
    if(volunteerId != "null"){
      const updateVolunteer = await Volunteer.findByIdAndUpdate(volunteerId, {role,
        organization,
        durationFrom,
        durationTo,
        field}, {new:true});
       if(!volunteerId){
        res.status(400).json({
          success:false,
          message:"volunteer id is invalid",
        })
       } 
       res.status(200).json({
         success:true,
         updatedVolunteer:updateVolunteer,
       })
        
    }else{
      const newVolunteer = await Volunteer.create({
        role,
        organization,
        durationFrom,
        durationTo,
        field,
      });
      const volunteer = await User.findByIdAndUpdate(userId, { $push: { volunteering: newVolunteer._id } }, { new: true });
      if (!volunteer) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'volunteer stored successfully', user: volunteer });

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
    
}
exports.deleteVolunteer = async (req, res) =>{
  try{
    const userId = req.user.id;
    const volunteerId = req.params.id;
    const deletevol = await Volunteer.findByIdAndDelete(volunteerId);
    const updatedUser = await User.findByIdAndUpdate(userId, {$pull: {volunteering:volunteerId}}, {new:true});
    if(!updatedUser){
      return res.status(400).json({
        success:false,
        message:"User Id is Invalid"
      })
    }
    res.status(200).json({
      success:true,
      message:"volunteer deleted Successfully"
    })
  }catch(error){
     console.log(error);
     res.status(500).json({
      success:false,
      message:"Internal server Error",
     })
  }
}
exports.userSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills should be an array" });
    }

    // Update the user's skills field
    const updatedSkills = await User.findByIdAndUpdate(
      userId,
      { $set: { skills: skills } }, // Directly set the skills array
      { new: true, runValidators: true } // Return updated document
    );

    if (!updatedSkills) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Skills updated successfully", user: updatedSkills });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}


exports.userImageUpload = async (req, res) => {
  try {
    
    const picture = req.file?.path;
    console.log("req",req)
    console.log("req-file", req.file)
    const userId = req.user.id;
    console.log("calling picture url  ", picture)
    // Update the user's skills field

    const updatedProfileImage = await User.findByIdAndUpdate(
      userId,
      { $set: { picture: picture } }, 
      { new: true, runValidators: true } 
    ).populate("connection status education", "-password");



    if (!updatedProfileImage) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile Image updated successfully", user: updatedProfileImage });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

