import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not set in .env");

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");

    mongoose.connection.on("disconnected", () =>
      console.warn("⚠️  MongoDB disconnected")
    );
    mongoose.connection.on("reconnected", () =>
      console.log("✅ MongoDB reconnected")
    );
  } catch (err: any) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};
