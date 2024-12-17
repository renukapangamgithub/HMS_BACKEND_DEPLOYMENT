import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "First Name Contain At least 3 Charachters!"]
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3, "Last Name Contain At least 3 Charachters!"]
    },
    email: {
        type:String,
        required: true,
        validate: [validator.isEmail, "Please Provide A valid Email!"]
    },
    phone: {
        type:String,
        required: true,
        minLength: [11, "Phone Number must Contain Exact 11 Digits!"],
        maxLength:[11, "Phone Number Must contain Exact 11 Digits!"]
    },
    message: {
        type: String,
        required: true,
        minLength: [10, "Message Must contain At least 10 Characters!"]
    },
});

export const Message = mongoose.model("Message", messageSchema);