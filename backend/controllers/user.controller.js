import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { v2 as cloudinary } from "cloudinary";
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
                size:10
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