const nodemailer = {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: "12345" }),
    }),
  };
  
  export default nodemailer;
  