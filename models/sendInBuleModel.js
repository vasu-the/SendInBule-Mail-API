const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true
  },
  lastName: {
    type: String
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String
  },
 
 

}, { timestamps: true });

module.exports = mongoose.model("user", UserSchema);