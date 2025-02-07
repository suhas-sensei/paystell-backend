import { Request, Response, NextFunction } from "express";
import { sessionMiddleware } from "../middlewares/session.middleware";
import SessionService from "../services/session.service";

jest.mock("../services/session.service.ts");

describe("sessionMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    req = { headers: { authorization: "Bearer valid_token" } };
    res = {
      status: jest.fn().mockReturnValue({ json: jsonMock }),
    } as Partial<Response>;
    next = jest.fn();
  });

  it("should call next() if session is valid", async () => {
    (SessionService.getSessionByToken as jest.Mock).mockResolvedValue({
      user: { id: "095374d4-aea5-41e6-b57c-a00689495477" },
      expiresAt: new Date(Date.now() + 10000),
    });

    await sessionMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if session is expired", async () => {
    (SessionService.getSessionByToken as jest.Mock).mockResolvedValue({
      expiresAt: new Date(Date.now() - 10000),
    });

    await sessionMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Unauthorized: Invalid or expired session",
    });
  });

  it("should delete the session if it is expired", async () => {
    (SessionService.getSessionByToken as jest.Mock).mockResolvedValue({
      token: "expired_token",
      expiresAt: new Date(Date.now() - 10000),
    });
    const deleteSessionMock = jest
      .spyOn(SessionService, "deleteSession")
      .mockResolvedValue();

    await sessionMiddleware(req as Request, res as Response, next);

    expect(deleteSessionMock).toHaveBeenCalledWith("valid_token");
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
