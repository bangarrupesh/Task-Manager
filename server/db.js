import mongoose from "mongoose";
import dns from "dns";

// Fix querySrv ECONNREFUSED issue on Windows / ISP DNS by setting public DNS servers
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Failed to set custom DNS servers:", e.message);
}

export const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow";
  try {
    await mongoose.connect(connStr);
    console.log(`MongoDB Connected successfully`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (connStr.includes("mongodb+srv://") || connStr.includes("cluster0")) {
      console.log("Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/taskflow)...");
      try {
        const localUri = "mongodb://127.0.0.1:27017/taskflow";
        await mongoose.connect(localUri);
        console.log(`MongoDB Connected successfully to local fallback: ${localUri}`);
        return;
      } catch (fallbackErr) {
        console.error(`Local MongoDB fallback also failed: ${fallbackErr.message}`);
      }
    }
    process.exit(1);
  }
};

