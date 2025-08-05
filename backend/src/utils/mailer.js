import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Or replace with your email service like "smtp.ethereal.email"
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an emergency email.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body content
 */
export const sendEmergencyEmail = async (to, subject, text) => {
  if (!to || !to.includes("@")) {
    throw new Error(`Invalid recipient email: ${to}`);
  }

  const mailOptions = {
    from: `"Health Emergency Bot" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};
