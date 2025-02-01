import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    searchUsername: [{ username: { type: String }, profileImage: { type: String },
        fullname: { type: String }, searchTime: { type: Date }, searchUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
}, { timestamps: true });

export default mongoose.model("SearchHistory", searchHistorySchema);