import { Router } from 'express';
import { sendVerificationEmail, verifyEmail, resendVerificationEmail } from '../controller/emailVerification';

const router = Router();

router.post('/send', sendVerificationEmail);

router.get('/verify', verifyEmail);

router.post('/resend', resendVerificationEmail);

export default router;
