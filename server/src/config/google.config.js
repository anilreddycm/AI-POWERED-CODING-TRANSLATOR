import { OAuth2Client } from "google-auth-library";
import "./env.config.js";

const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn("WARNING: GOOGLE_CLIENT_ID is not set in environment variables!");
}

const oauth2Client = new OAuth2Client(googleClientId);

export default oauth2Client;
