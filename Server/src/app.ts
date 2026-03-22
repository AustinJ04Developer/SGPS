import express from "express";
import cors from "cors";
import parkingRoutes from "./routes/parkingRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/ping", (_req, res) => {
  res.json({ status: "awake", time: new Date().toISOString() });
});

app.use("/api/parkings", parkingRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

export default app;
