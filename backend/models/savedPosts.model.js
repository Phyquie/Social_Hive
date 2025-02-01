import mongoose from "mongoose";

const savedPostsSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" },{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
});

const SavedPosts = mongoose.model("SavedPosts", savedPostsSchema);
export default SavedPosts;


