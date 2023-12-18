import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async(url) => {
    try {
        await mongoose.connect(url);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error occured while connecting", error);
    }
}

export default connectDB;
