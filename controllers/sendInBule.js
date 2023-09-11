const nodemailer = require('nodemailer')
require('dotenv').config()
const User = require('../models/sendInBuleModel')

const validator = require('validator')




const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  };
  
  const sendOTP = async (email, user) => {
    const otp = generateOTP();
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com',
      port: 587,
      auth: {
        user: process.env.USER_NAME,
        pass: process.env.PASS_WORD
      }
    });
    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'OTP Verification',
      html: `<p>Your OTP for verification is ${otp}</p>`
    };
  
    const resendDelay = 2 * 60 * 1000; // 2 minutes in milliseconds
    // Check if the OTP was resent within the last 2 minutes
    const currentTime = new Date().getTime();
    if (user.lastOTPSent && currentTime - user.lastOTPSent < resendDelay) {
      const remainingTime = resendDelay - (currentTime - user.lastOTPSent);
      return { success: false, message: `Please wait ${remainingTime / 1000} seconds before resending the OTP` };
    }
  
    try {
      let info = await transporter.sendMail(mailOption);
      console.log(`Message Sent:${info.messageId}`);
      await User.updateOne({ email: email }, { otp: otp });
  
      // Set a timer for OTP expiration (e.g., 2 minutes)
      const OTP_EXPIRATION_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds
      setTimeout(async () => {
        // Clear OTP after expiration
        await User.updateOne({ email: email }, { otp: '', lastOTPSent: null });
      }, OTP_EXPIRATION_TIME);
      return { success: true, message: 'OTP sent successfully' };
    } catch (err) {
      console.log(err);
      return { success: false, message: 'Error sending OTP' };
    }
  };
  const SignUpUser = async (req, res) => {
    const getUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    };
    try {
      const { email } = req.body;
      if (!validator.isEmail(email)) {
        return res.status(400).send({ error: 'Invalid Email' });
      }
      const userExists = await User.findOne({ email: email });
      if (userExists) {
        return res.status(400).json({ error: 'Email Already Exists' });
      }
      getUser["password"] = await bcrypt.hash(getUser.password, 12);
 
      const user = await new User(getUser).save();
      const otpResult = await sendOTP(email, user);
      if (otpResult.success) {
        return res.status(200).send({ data: user, message: 'User Added Successfully and OTP sent successfully' });
      } else {
        return res.status(500).send({ message: otpResult.message });
      }
    } catch (err) {
      console.log("err", err);
      return res.status(500).send({ msg: 'Something went wrong' });
    }
  };


  module.exports = { SignUpUser }