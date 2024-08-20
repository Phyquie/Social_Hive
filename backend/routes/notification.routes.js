import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { deleteNotification, getNotications } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/",protectRoute,getNotications)
router.delete("/",protectRoute,deleteNotification)

export default router;