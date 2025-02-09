import { generateVerificationToken, verifyToken } from "../utils/token";

describe("Token Utilities", () => {
  const email = "test@example.com";

  it("should generate a token for email verification", () => {
    const token = generateVerificationToken(email);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should verify a valid token", () => {
    const token = generateVerificationToken(email);
    const payload = verifyToken(token);
    expect(payload.email).toBe(email);
  });

  it("should throw an error for an invalid token", () => {
    expect(() => verifyToken("invalidToken")).toThrow();
  });
});
