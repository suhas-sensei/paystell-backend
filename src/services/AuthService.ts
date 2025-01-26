import { Repository } from "typeorm";
import { User } from "../entities/User";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import AppDataSource from "../config/db";

export class AuthService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    async register(userData: Partial<User>) {
        const userExists = await this.userRepository.findOne({
            where: { email: userData.email }
        });

        if (userExists) {
            throw new Error("Email already registered");
        }

        const user = this.userRepository.create(userData);
        await user.hashPassword();
        await this.userRepository.save(user);

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findOne({
            where: { email }
        });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }

        const token = sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "1d" }
        );

        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
}