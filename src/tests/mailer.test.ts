import { sendEmail } from "../utils/mailer";

jest.mock("nodemailer");

describe("Mailer Utility", () => {
  it("should send an email successfully", async () => {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Email",
      html: "<p>Hello, World!</p>",
    });

    expect(result).toHaveProperty("messageId");
    expect(result.messageId).toBe("12345");
  });

  it("should throw an error if email fails to send", async () => {
    jest.spyOn(require("nodemailer").createTransport(), "sendMail").mockRejectedValueOnce(new Error("Send failed"));

    await expect(
      sendEmail({
        to: "test@example.com",
        subject: "Test Email",
        html: "<p>Hello, World!</p>",
      })
    ).rejects.toThrow("Send failed");
  });
});
