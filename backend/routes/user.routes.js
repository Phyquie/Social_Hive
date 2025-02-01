import express from "express";
import {protectRoute} from '../middleware/protectRoute.js';
import {getUserProfile,followUnfollowUser,getSuggestedUsers,updateUserProfile,getUsersForSidebar,searchUsers,getCareerAdvice,RequestMeet,addSearchHistory,getsearchHistory,deleteSearchHistory,savePost,getSavedPosts,deleteSavedPost} from '../controllers/user.controller.js';

const router = express.Router();
 
router.get("/profile/:username",protectRoute,getUserProfile);
router.get("/suggested",protectRoute,getSuggestedUsers);
router.post("/follow/:id",protectRoute,followUnfollowUser);
router.post("/update",protectRoute,updateUserProfile);
router.get("/getSidebarUsers",protectRoute,getUsersForSidebar);
router.get("/search/:username",protectRoute,searchUsers);
router.post("/getCareerAdvice",protectRoute,getCareerAdvice);
router.post("/requestMeet",protectRoute,RequestMeet);
router.post("/addSearchHistory",protectRoute,addSearchHistory);
router.get("/getSearchHistory",protectRoute,getsearchHistory);
router.get("/deleteSearchHistory/:searchUserId",protectRoute,deleteSearchHistory); 
router.post("/savePost/:postId",protectRoute,savePost);
router.get("/getSavedPosts",protectRoute,getSavedPosts);
router.delete("/deleteSavedPost/:postId",protectRoute,deleteSavedPost);

export default router;