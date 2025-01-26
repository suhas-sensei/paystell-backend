import { baseEmailLayout } from './layout';

export const welcomeTemplate = (logoUrl: string, verifyUrl: string): string => {
  const header = `
    <div class="header">
      <img src="${logoUrl}" alt="PayStell Logo" style="max-height: 50px;">
      <h1>Welcome to PayStell!</h1>
    </div>
  `;

  const content = `
    <p>Thank you for signing up for PayStell! We're excited to have you on board.</p>
    <p>Please verify your email address to get started:</p>
    <a href="${verifyUrl}" style="
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #079eff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    ">Verify Email</a>
    <p>If you didn't sign up for PayStell, you can safely ignore this email.</p>
  `;

  return baseEmailLayout(header, content);
};
