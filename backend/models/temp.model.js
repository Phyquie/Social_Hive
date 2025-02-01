import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    fullname : {
        type: String,
        required: true,
       
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
    },
},
    {timestamps: true});


const Temp = mongoose.model("Temp", userSchema);
export default Temp;
