import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./connectMongoDB/connectMongoDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import { v2 } from "cloudinary";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
dotenv.config();
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const Port = process.env.Port;
app.use(express.json({limit:"500kb"}));
app.use(express.json());//to parse req.body
app.use(express.urlencoded({extended:true}));//to parse form data'
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/notifications",notificationRoutes);

app.listen(Port, () => {
  console.log(`Server started at http://localhost:${Port}`);
  connectMongoDB();
});