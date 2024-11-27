import express from 'express';
import {
    forgotPassswordController,
    loginController,
    registerUserController,
    resetTokenController,
    verifyEmailValidationTokenController
} from '../controllers/auth.controller.js';
import { verifyApikeyMiddleware } from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', registerUserController);

authRouter.get('/verify/:verificationToken', verifyEmailValidationTokenController)

authRouter.post('/login', loginController)

authRouter.post('/forgot-password', forgotPassswordController)

authRouter.put('/reset-password/:reset_token', resetTokenController)

export default authRouter