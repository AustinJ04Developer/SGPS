import dotenv from "dotenv";
import { connectDB } from "./utils/db";
import app from "./app";
import { client as mqttClient } from "./utils/mqtt";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});

mqttClient.on("connect", () => {
  console.log("MQTT client connected ✅");
});

mqttClient.on("error", (err) => {
  console.error("MQTT connection error:", err);
});

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  mqttClient.end();
  process.exit();
});
