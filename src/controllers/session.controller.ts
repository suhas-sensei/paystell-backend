import { Request, Response } from "express";
import SessionService from "../services/session.service";

export const createSession = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const session = await SessionService.createSession(userId);
    res.status(201).json(session);
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Token missing") // check if token is in the headers

    await SessionService.deleteSession(token);
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
