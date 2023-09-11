const router = require('express').Router();

const userRoutes = require('../controllers/sendInBule')

const sendOTP = require('../controllers/emailVerifyOTP')

//user routes
router.post('/user-signup',userRoutes.SignUpUser);
router.post('/user-signupotp',sendOTP.verifyEmail);



module.exports = router;