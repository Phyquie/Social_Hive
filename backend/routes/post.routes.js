import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createPost, deletePost, likeUnlikePost, commentPost,getAllPost ,getLikedPost,getFollowingPost,getUserPost } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all",protectRoute,getAllPost)
router.get("/following",protectRoute,getFollowingPost)
router.get("/user/:username",protectRoute,getUserPost)
router.get("/following",protectRoute,getFollowingPost)
router.get("/likes/:id",protectRoute,getLikedPost)//user ki id pass karni hai
router.post("/create",protectRoute,createPost)
router.post("/like/:id",protectRoute,likeUnlikePost)
router.post("/comment/:id",protectRoute,commentPost)
router.delete("/:id",protectRoute,deletePost)



export default router;