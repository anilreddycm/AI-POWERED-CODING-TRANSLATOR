import nodemailer from "nodemailer";

// Retrieve email configurations from environment variables
const emailUser = process.env.EMAIL_USER;
// Strip any spaces from the App Password if present (Google presents them with spaces)
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : null;
const emailService = process.env.EMAIL_SERVICE || "gmail";

const isEmailConfigured = emailUser && emailPass;

/**
 * Sends a verification OTP to the user's email.
 * If SMTP credentials are not configured, it logs the OTP to the console.
 * 
 * @param {string} toEmail - The recipient's email address
 * @param {string} otpCode - The 6-digit verification code
 * @param {string} userName - The recipient's name
 * @returns {Promise<boolean>} Success status
 */
export const sendOTPEmail = async (toEmail, otpCode, userName) => {
  if (!isEmailConfigured) {
    // Beautiful ASCII output for local development fallback
    console.log("\n" + "=".repeat(60));
    console.log(`✉️  [LOCAL DEV EMAIL FALLBACK] Verification OTP for ${toEmail}`);
    console.log("-".repeat(60));
    console.log(`Hello ${userName || "User"},`);
    console.log(`Your verification code is:`);
    console.log(`\n       🔑  [ ${otpCode} ]  🔑\n`);
    console.log(`This code is valid for 10 minutes.`);
    console.log("-".repeat(60));
    console.log(`NOTE: Set EMAIL_USER & EMAIL_PASS in your server/.env to send real emails.`);
    console.log("=".repeat(60) + "\n");
    return true;
  }

  try {
    // Using direct SMTP connection configurations for Gmail is highly reliable
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL/TLS
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"CodeTranslator" <${emailUser}>`,
      to: toEmail,
      subject: "Verify Your Email Address - CodeTranslator",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">Verify Your Email</h2>
          <p>Hello ${userName || "there"},</p>
          <p>Thank you for registering on CodeTranslator! To complete your registration, please use the 6-digit verification code below:</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 24px 0; color: #111827;">
            ${otpCode}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">CodeTranslator Assistant</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Verification email sent successfully to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[EMAIL SERVICE ERROR] Failed to send email via SMTP:", error.message);
    // Fallback to console print even if configured SMTP fails
    console.warn(`[EMAIL SERVICE FALLBACK] Showing OTP here due to SMTP failure: ${otpCode}`);
    return false;
  }
};
