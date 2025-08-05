import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g., your-email@gmail.com
    pass: process.env.EMAIL_PASS, // App password, NOT your Gmail password
  },
});

export const sendEmergencyEmail = async (to, subject, text) => {
  // 🛑 Safety check: Ensure recipient is valid
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    console.error("❌ Invalid or missing recipient email for emergency email:", to);
    return; // Exit to avoid crash
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
  }
};
