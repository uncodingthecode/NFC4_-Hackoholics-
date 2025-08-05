import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail, Outlook, or other SMTP provider
  auth: {
    user: process.env.EMAIL_USER, // e.g., your-email@gmail.com
    pass: process.env.EMAIL_PASS, // App password or real password (use env)
  },
});

export const sendEmergencyEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
