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

    // Simplify the email and supply both plain-text and HTML fallback to improve deliverability to Primary inbox
    const mailOptions = {
      from: `"CodeTranslator" <${emailUser}>`,
      to: toEmail,
      subject: `Your Verification Code: ${otpCode}`,
      text: `Hello ${userName || "User"},\n\nYour verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nCodeTranslator Support`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; color: #111827; line-height: 1.6; max-width: 480px; margin: 0 auto; padding: 10px;">
          <p>Hello ${userName || "User"},</p>
          <p>Your CodeTranslator verification code is:</p>
          <div style="font-size: 26px; font-weight: bold; color: #4f46e5; margin: 15px 0; font-family: monospace;">
            ${otpCode}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <br>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Best regards,<br>
            <strong>CodeTranslator Support</strong>
          </p>
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
