import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();
const authController = new AuthController();

// Validation schemas
const registerSchema = {
    name: { type: 'string', required: true, minLength: 2 },
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: 'string', required: true, minLength: 6 }
};

const loginSchema = {
    email: { type: 'string', required: true },
    password: { type: 'string', required: true }
};

// Helper function to wrap async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Routes
router.post(
    "/register",
    validateRequest(registerSchema),
    asyncHandler(async (req, res) => {
        await authController.register(req, res);
    })
);

router.post(
    "/login",
    validateRequest(loginSchema),
    asyncHandler(async (req, res) => {
        await authController.login(req, res);
    })
);

router.post(
    "/refresh-token",
    asyncHandler(async (req, res) => {
        await authController.refreshToken(req, res);
    })
);

router.get(
    "/profile",
    authMiddleware,
    asyncHandler(async (req, res) => {
        await authController.getProfile(req, res);
    })
);

export default router;