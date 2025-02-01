import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary";
export const createPost = async (req, res) => {
    try{
        const text = req.body.text;
        let img = req.body.img;
        const userId= req.user._id.toString();
        const user= await User.findById(userId);
        if(!user) return res.status(400).json({message: "User not found"});
    
        if(!text && !img){
            return res.status(400).json({message: "Text or Image is required"});
        }
       
        if(img){
            const upload = await cloudinary.uploader.upload(img);
            img = upload.secure_url;
        }
        const newPost = new Post({
            user:userId,
            text,
            img,
        });
        await newPost.save();
        res.status(201).json({message: "Post Created", post: newPost});
    
    }catch(error){
        console.error(error.message);
        res.status(500).json({message: "Server Error"});
      
    
    }};
export const deletePost = async (req, res) => { try{
 const post = await Post.findById(req.params.id);
 if(!post){
     return res.status(404).json({message: "Post not found"});
 }

 if(post.user.toString() !== req.user._id.toString()){
     return res.status(401).json({message: "You are not authorized"});
 }
 if(post.img){
     const publicId = post.img.split("/").pop().split(".")[0];
     await cloudinary.uploader.destroy(publicId);
 }
 await Post.findByIdAndDelete(req.params.id);
 res.status(200).json({message: "Post Deleted"});

}
catch(error){
    console.error(error.message);
    res.status(500).json({message: "Server Error"});
}


};
export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id.toString();
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        const userLikedPost = post.likes.includes(userId);
        if(userLikedPost){
            await post.updateOne({$pull: {likes: userId}});
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});
            res.status(200).json({message: "Post Unliked"});
        }
    else{
        await post.updateOne({$push: {likes: userId}});
        await User.updateOne({_id: userId}, {$push: {likedPosts: postId}});
        const notification = new Notification({
            from: userId,
            to: post.user,
            type: "like",
        });
        await notification.save();
        
    res.status(200).json({message: "Post Liked"});}
       
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: "Server Error"});
        
    }


};
export const commentPost = async (req, res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id.toString();
        if(!text){
            return res.status(400).json({message: "Text is required"});
        }
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        const comment = {
            text,
            user: userId,
        };
        post.comments.push(comment);
        await post.save();
        res.status(200).json({message: "Comment Added", post});

    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: "Server Error"});
        
    }
};


export const getAllPost = async (req, res) => {
    try {
      const posts =await Post.find().sort({createdAt: -1}).populate({
        path: "user",
        select: "-password",
      }).
      populate({
        path: "comments.user",
        select: "-password",});
      
      if(!posts){
          return res.status(200).json({message: "No Posts Found"});
      }
      res.status(200).json(posts);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: "Server Error"});
        
    }
}


export const getLikedPost = async (req, res) => {
try {
     const userId = req.params.id;
     const user = await User.findById(userId);
     if(!user){
         return res.status(404).json({message: "User not found"});
     }
        const posts = await Post.find({_id: {$in: user.likedPosts}}).sort({createdAt: -1}).populate({path: "user",
            select: "-password",
          }).
          populate({
            path: "comments.user",
            select: "-password",});

        res.status(200).json(posts);    

} catch (error) {
    console.error(error.message);
    res.status(500).json({message: "Server Error"});
    
}

}


export const getFollowingPost = async (req, res) => {

    try {
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const posts = await Post.find({user: {$in: user.following}}).sort({createdAt: -1}).populate({path: "user",
            select: "-password",
          }).
          populate({path: "comments.user",
            select: "-password",});

           res.status(200).json(posts); 

    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: "Server Error"});
        
    }
}

export const getUserPost = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({username});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({path: "user",
            select: "-password",
          }).
          populate({path: "comments.user",
            select: "-password",});

            res.status(200).json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: "Server Error"});
        
    }


}
