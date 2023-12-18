import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  threadId: [
    String
  ],
});

const User = mongoose.model('User', userSchema);

export default User;