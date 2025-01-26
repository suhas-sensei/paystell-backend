import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    register = async (req: Request, res: Response) => {
        try {
            const user = await this.authService.register(req.body);
            return res.status(201).json(user);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            return res.json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({ message: error.message });
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}