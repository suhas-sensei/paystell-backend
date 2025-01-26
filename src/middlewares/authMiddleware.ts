import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: { id: number; email: string };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const [, token] = authHeader.split(" ");

    try {
        const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = decoded as { id: number; email: string };
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};