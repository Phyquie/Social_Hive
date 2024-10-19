import express from "express";
import {protectRoute} from '../middleware/protectRoute.js';
import {getUserProfile,followUnfollowUser,getSuggestedUsers,updateUserProfile,getUsersForSidebar,searchUsers} from '../controllers/user.controller.js';

const router = express.Router();
 
router.get("/profile/:username",protectRoute,getUserProfile);
router.get("/suggested",protectRoute,getSuggestedUsers);
router.post("/follow/:id",protectRoute,followUnfollowUser);
router.post("/update",protectRoute,updateUserProfile);
router.get("/getSidebarUsers",protectRoute,getUsersForSidebar);
router.get("/search/:username",protectRoute,searchUsers);


export default router;