import express from 'express';
import { login, register, forgotpassword, adminlogin, resetpassword, getname, toggleSavedProperty, getSavedProperties, updateProfile } from '../controller/Usercontroller.js';
import { googleAuth } from '../controller/googleAuthController.js';
import authMiddleware from '../middleware/authmiddleware.js';


const userrouter = express.Router();

userrouter.post('/login', login);
userrouter.post('/register', register);
userrouter.post('/google-auth', googleAuth);
userrouter.post('/forgot', forgotpassword);
userrouter.post('/reset/:token', resetpassword);
userrouter.post('/admin', adminlogin);
userrouter.get('/me', authMiddleware, getname);
userrouter.post('/saved-properties/toggle', authMiddleware, toggleSavedProperty);
userrouter.get('/saved-properties', authMiddleware, getSavedProperties);
userrouter.put('/profile', authMiddleware, updateProfile);

export default userrouter;