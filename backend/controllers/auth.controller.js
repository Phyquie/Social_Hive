import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie}  from "../lib/utlis/generateToken.js";
import nodemailer from "nodemailer";

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, 
        auth: {
            user: '79ac62002@smtp-brevo.com', 
            pass: process.env.BREVEO_PASS
        }
    });

    const mailOptions = {
        from: 'Phyquie <ayushking6395@gmail.com>',
        to: email,
        subject: 'Your OTP Code for Social Hive',
        text: `Your OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
        console.log('Message sent: %s', info.messageId);
    });
    


};

export const signup = async (req, res) => {
 try{
    const{fullname, username, email, password} = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!emailRegex.test(email)){
        return res.status(400).send({message: "Invalid email Format"});
    }

    const existingUser =await User.findOne({username});
    if(existingUser){
        return res.status(400).send({message: "Username already taken"});
    }
    const existingEmail=await User.findOne({email});
    if(existingEmail){
        return res.status(400).send({message: "Email already taken"});
    }
    if(password.length < 6){
        return res.status(400).send({message: "Password must be atleast 6 characters long"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const otp = generateOTP();
    await sendOTPEmail(email, otp);

    const TempUser = new Temp({
        fullname,
        username,
        email,
        otp,
        password: hashedPassword,
    });

    if(TempUser){
        await TempUser.save();
        res.status(201).send({message: "OTP sent to email"});
    }else{
        res.status(500).send({message: "Something went wrong"});
    }


 }catch(error){
    console.log(error);
 }};


export const login = async (req, res) => {
    try{

        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordValid = user && await bcrypt.compare(password, user.password);
if(!user || !isPasswordValid){
    return res.status(400).send({message: "Username or Password is worng"});}
    generateTokenAndSetCookie(user._id, res);
    res.status(200).json({_id:user._id,
        username:user.username, email:user.email, 
       fullname:user.fullname,
       profileImg:user.profileImg,
       coverImg:user.coverImg,
       bio:user.bio,
       link:user.link,
       followers:user.followers,
       following:user.following,});

    }
    catch(error){
        console.log("error in login controller", error);
        res.status(500).send({message: "Something went wrong"});
    }};

export const logout = async (req, res) => {  
      try {res.cookie("jwt", "", {maxAge:0})
      res.status(200).send({message: "Logged out successfully"});}
      catch (error) {
        console.log("error in logout controller", error);}  };

export const getMe = async (req, res) => {
    try{const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }
    catch (error) {
        console.log("error in getMe controller", error);
        res.status(500).send({message: "Something went wrong"});}
};        