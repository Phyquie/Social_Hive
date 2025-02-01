import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";
import SearchHistory from "../models/serachHistory.model.js";
import SavedPosts from "../models/savedPosts.model.js";
export const getUserProfile = async (req, res) => {
    const{username} = req.params;


    try{
        const user =await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).send({error: "User not found"});
        }
        res.status(200).json(user);
    }catch(error){
        res.status(500).send({error: "Internal server error"});
        console.log(error);}}

export const followUnfollowUser = async (req, res) => { 
    const{id}=req.params;  
    try{
      const userToModify=await User.findById(id);
      const currentUser=await User.findById(req.user._id);

      if(id==req.user._id.toString()){
          return res.status(400).send({error: "You can't follow/unfollow yourself"});
      }
        if(!userToModify){
            return res.status(404).send({error: "User not found"});
        }
        const isFollowing=currentUser.following.includes(id);
        if(isFollowing){
            await User.findByIdAndUpdate(currentUser._id,{$pull:{following:id}});
            await User.findByIdAndUpdate(id,{$pull:{followers:currentUser._id}});
            res.status(200).send({message: "Unfollowed successfully"});
           
        }else{
            await User.findByIdAndUpdate(currentUser._id,{$push:{following:id}});
            await User.findByIdAndUpdate(id,{$push:{followers:currentUser._id}});
            const newNotification =new Notification({
                type:"follow",
                from:currentUser._id,
                to:userToModify._id,});

                await newNotification.save();
            res.status(200).send({message: "Followed successfully"});
        }
    }
    catch(error){
        res.status(500).send({error: "Internal server error"});
        console.log("error in followUnfollowUser");
    }}

export const getSuggestedUsers = async (req, res) => { 
    try{

        const usersFollowedByMe = await User.findById(req.user._id).select("following");
        const usersToExclude = [req.user._id,...usersFollowedByMe.following];

        const users= await User.aggregate([{
            $match:{
                _id:{$nin:usersToExclude}
            }
        },{
            $sample:{
                size:5
            }
        }]);

        users.forEach(user=>{
            user.password=undefined;
        });
        res.status(200).send(users);
        }
    
        catch(error){
            res.status(500).send({error: "Internal server error"});
            console.log("error in getSuggestedUsers");

        }
    }    

export const updateUserProfile = async (req, res) => {  const{fullname,email,username,currentPassword,newPassword,bio,link}=req.body;
let{profileImg,coverImg
}=req.body;

    try{

        let user=await User.findById(req.user._id);
        if(!user){
            return res.status(404).send({error: "User not found"});
        }
        if((currentPassword && !newPassword) || (!currentPassword && newPassword)){
            return res.status(400).send({error: "Please provide both current and new password"});
        }
        if(currentPassword && newPassword){
            const isMatch=await bcrypt.compare(currentPassword,user.password);
            if(!isMatch){
                return res.status(400).send({error: "Incorrect password"});
            }
            if(newPassword.length<6){
                return res.status(400).send({error: "Password must be at least 6 characters long"});
            }
            const salt=await bcrypt.genSalt(10);
            user.password=await bcrypt.hash(newPassword,salt);
        }
        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
            const result=await cloudinary.uploader.upload(profileImg);
            profileImg=result.secure_url;
           
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const result=await cloudinary.uploader.upload(coverImg);
            coverImg=result.secure_url;
        }

        user.fullname=fullname || user.fullname;
        user.email=email || user.email;
        user.username=username || user.username;
        user.bio=bio || user.bio;
        user.link=link || user.link;
        user.profileImg=profileImg || user.profileImg;
        user.coverImg=coverImg || user.coverImg;

        user = await user.save();
        user.password=null;//pass should be null in response
          return res.status(200).send(user);
    }
catch(error){
    res.status(500).send({error: "Internal server error"});
    console.log(error.message);
}}

export const getUsersForSidebar = async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      console.log("loggedInUserId: ", loggedInUserId);
  
     
  
      // Query to find users who are followed by and follow the logged-in user
      const filteredUsers = await User.find({
        _id: { $ne: loggedInUserId }, // Exclude the logged-in user
        followers: { $in: [loggedInUserId] }, // Check if they follow the logged-in user
        following: { $in: [loggedInUserId] } // Check if the logged-in user follows them
      }).select("-password"); // Exclude the password field from the results
  
      res.status(200).json(filteredUsers);
    } catch (error) {
      console.error("Error in getUsersForSidebar: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

export const searchUsers = async (req, res) => {
    const { username } = req.params;
    try {
        const users = await User.find({

        

            $or: [
                { username: { $regex: username, $options: "i" } },
                { fullname: { $regex: username, $options: "i" } }
            ]
            
        })
        .select("-password")
        .limit(10);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).send({ error: "Internal server error" });
        console.log("Error in searchUsers:", error.message);
    }
}

const genAI = new GoogleGenerativeAI("AIzaSyAmYoFAc4_hkk2HOa1vSlLwEUTx-dXod5U");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Fetch career advice
export const getCareerAdvice = async (req, res) => {
    const { conversation, question } = req.body;

    console.log("Received conversation:", conversation);
    console.log("Received question:", question);

    try {
        // Ensure conversation is an array of strings
        if (!Array.isArray(conversation) || !conversation.every(item => typeof item === 'string')) {
            throw new Error("Invalid conversation format. Expected an array of strings.");
        }

        // Join the conversation array into a single string
        const conversationText = conversation.join('\n');

        // Assuming `model.generateContent` returns a Response-like object
        const result = await model.generateContent(`Question: ${question}\n\nConversation: ${conversationText}`);
        
        // Check if the result object and response exist
        if (!result || !result.response) {
            throw new Error("Invalid response from model");
        }

        // Await the response text
        const advice = await result.response.text();

        // Log and return the advice
        console.log("Generated advice:", advice);
        res.status(200).json({ advice });
    } catch (error) {
        console.error("Error fetching career advice:", error.message || error);
        res.status(500).json({ error: 'Error fetching career advice' });
    }
};


export const RequestMeet = async (req, res) => {
    try{
        
    const { email , senderEmail } = req.body;
    console.log("email: ", email);
    await sendOTPEmailAccepted(email,senderEmail);
    res.status(200).json({ message: 'Email sent' });
    }catch(error){
        res.status(500).json({ error: 'Error sending email' });
    }
    
}


const sendOTPEmailAccepted = async (email , senderEmail) => {
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
        subject: 'Meeting Request',
        text: `A new meeting request has been sent by ${senderEmail}.Please respond to the request`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed'); // Rethrow the error for further handling
    }
}



export const getsearchHistory = async (req, res) => {
    try{const userId = req.user._id;
    const history = await SearchHistory.find({ userId })
    if(!history){
        return res.status(404).json({error:"No search history found"});
    }
    res.status(200).json(history);}
    catch(error){
        console.error("error found in getSearch Controller", error)
    }
} 
export const addSearchHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const {username, profileImage, fullname , searchUserId} = req.body;
        console.log("username: ", username, "profileImage: ", profileImage, "fullname:" ,fullname, "searchUserId: ", searchUserId);
        console.log("data received");

        if (!username) {
            return res.status(400).json({ error: "Search username is required" });
        }
      if(!profileImage){
        console.log("profileImage not found");
      }
      if(!fullname){
        console.log("fullname not found");
      }
      if(!searchUserId){
        console.log("searchUserId not found");
      }

        // Find if a search history record already exists for the user
        let existingHistory = await SearchHistory.findOne({ userId });

        if (existingHistory) {
            // Ensure searchObjectArray is initialized
            existingHistory.searchUsername = existingHistory.searchUsername || [];

            // Remove the existing entry if it matches the searchUsername
            existingHistory.searchUsername = existingHistory.searchUsername.filter(
                (entry) => entry.username !== username
            );

                        // Add the new search object at the end
            existingHistory.searchUsername.push({
                username: username,
                profileImage: profileImage,
                fullname: fullname,
                searchTime: new Date(),
                searchUserId: searchUserId,
            });

            // Limit the array to a fixed size (e.g., last 10 entries)
            const maxHistorySize = 10;
            if (existingHistory.searchUsername.length > maxHistorySize) {
                existingHistory.searchUsername.shift(); // Remove the oldest entry
            }

            // Save the updated search history
            await existingHistory.save();   
        } else {
            // If no search history exists, create a new record
            const searchHistory = new SearchHistory({
                userId,
                searchUsername: [{ username, profileImage, fullname, searchTime: new Date(), searchUserId: searchUserId }],
            });

            await searchHistory.save();
        }

        res.status(200).json({ message: "Search history added" });
    } catch (error) {
        console.error("Error adding search history:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteSearchHistory = async (req, res) => {    
    try{
        const userId = req.user._id;
        const {searchUserId} = req.params;
        const history = await SearchHistory.findOne({userId});
        if(!history){
            return res.status(404).json({error:"No search history found"});
        }
        history.searchUsername = history.searchUsername.filter((entry) => entry.searchUserId.toString() !== searchUserId);
        await history.save();
        res.status(200).json({message:"Search history deleted"});
    }catch(error){
        console.error("error found in deleteSearchHistory controller", error);
        res.status(500).json({error:"Server error"});
    }
}

export const savePost = async (req, res) => {
    try{
        const userId = req.user._id;
        const {postId} = req.params;
        const savedPost = await SavedPosts.findOne({userId});
        if(!savedPost){
            const newSavedPost = new SavedPosts({userId, posts:[postId]});
            await newSavedPost.save();
            return res.status(200).json({message:"Post saved"});
        }
        if(savedPost.posts.includes(postId)){
            //post already saved
            return res.status(200).json({message:"Post already saved"});
        }
        savedPost.posts.push(postId);
        await savedPost.save();
        res.status(200).json({message:"Post saved"});
    }catch(error){
        console.error("error found in savePost controller", error);
        res.status(500).json({error:"Server error"});
    }
}
export const deleteSavedPost = async (req, res) => {
    try{
        const userId = req.user._id;
        const {postId} = req.params;
        const savedPost = await SavedPosts.findOne({userId});
        if(!savedPost){
            return res.status(404).json({error:"No saved posts found"});
        }
        savedPost.posts = savedPost.posts.filter((id) => id.toString() !== postId);
        await savedPost.save();
        res.status(200).json({message:"Post removed from saved"});
    }catch(error){
        console.error("error found in deleteSavedPost controller", error);
        res.status(500).json({error:"Server error"});
    }
}
export const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        // Populate both posts and user details
        const savedPosts = await SavedPosts.findOne({ userId })
            .populate({
                path: "posts",
                populate: {
                    path: "user", // Assuming each post has a 'user' field referencing the user
                    select: "-password" // Exclude password from user details
                }
            });

        if (!savedPosts) {
            return res.status(404).json({ error: "No saved posts found" });
        }
        res.status(200).json(savedPosts);
    } catch (error) {
        console.error("error found in getSavedPosts controller", error);
        res.status(500).json({ error: "Server error" });
    }
}