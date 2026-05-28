import mongoose from "mongoose";
import dns from "dns";

let isDBConnected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    // Fallback DNS logic for restricted/corporate networks blocking SRV records
    if (uri && uri.startsWith("mongodb+srv://")) {
      try {
        const host = uri.split("@")[1].split("/")[0].split("?")[0];
        await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
      } catch (dnsErr) {
        console.warn(`\n[DATABASE] Default DNS server failed to resolve MongoDB host: ${dnsErr.message}`);
        console.warn(`[DATABASE] Switching process DNS resolvers to Google DNS (8.8.8.8, 8.8.4.4) as fallback...`);
        try {
          dns.setServers(["8.8.8.8", "8.8.4.4"]);
        } catch (setErr) {
          console.error(`[DATABASE] Failed to set fallback DNS servers: ${setErr.message}`);
        }
      }
    }

    // Quick timeout (2 seconds) so server starts up instantly if local DB is offline
    const conn = await mongoose.connect(uri || "mongodb://127.0.0.1:27017/code-translator", {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isDBConnected = true;
  } catch (error) {
    console.warn(`\n[DATABASE WARNING] MongoDB connection failed: ${error.message}`);
    console.warn(`[DATABASE WARNING] Continuing server execution using file-based JSON database fallback.\n`);
    isDBConnected = false;
  }
};

export const getDBStatus = () => isDBConnected;
export default connectDB;
