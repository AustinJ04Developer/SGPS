import { Request, Response } from "express";
import Parking from "../models/Parking";

// ─── GET all parkings ────────────────────────────────────────────────────────
export const getParkings = async (_req: Request, res: Response) => {
  try {
    const parkings = await Parking.find().sort({ lastUpdated: -1 });
    res.status(200).json(parkings);
  } catch (err: any) {
    console.error("❌ Error fetching parking data:", err.message);
    res.status(500).json({ error: "Failed to fetch parking data" });
  }
};

// ─── GET single parking by deviceId ─────────────────────────────────────────
export const getParkingById = async (req: Request, res: Response) => {
  try {
    const parking = await Parking.findOne({ deviceId: req.params.deviceId });
    if (!parking) {
      return res.status(404).json({ error: "Parking not found" });
    }
    res.status(200).json(parking);
  } catch (err: any) {
    console.error("❌ Error fetching parking:", err.message);
    res.status(500).json({ error: "Failed to fetch parking" });
  }
};

// ─── POST/PUT — manual HTTP update (admin / testing) ────────────────────────
export const updateParking = async (req: Request, res: Response) => {
  try {
    const { deviceId, totalSlots, occupiedSlots, slot1, slot2, name, lat, lng, gpsFixed } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: "deviceId is required" });
    }
    if (typeof occupiedSlots !== "number") {
      return res.status(400).json({ error: "occupiedSlots must be a number" });
    }

    // Validate GPS only when provided
    const hasGPS =
      typeof lat === "number" &&
      typeof lng === "number" &&
      !(Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001);

    let parking = await Parking.findOne({ deviceId });

    if (!parking) {
      parking = await Parking.create({
        deviceId,
        name:          name || "Smart Parking",
        totalSlots:    totalSlots || 2,
        occupiedSlots,
        slot1:         slot1 || "FREE",
        slot2:         slot2 || "FREE",
        gpsFixed:      hasGPS ? (gpsFixed ?? true) : false,
        location: {
          lat: hasGPS ? lat : 0,
          lng: hasGPS ? lng : 0,
        },
      });
      console.log(`✅ Created parking via HTTP: ${deviceId}`);
    } else {
      parking.name          = name          || parking.name;
      parking.totalSlots    = totalSlots    ?? parking.totalSlots;
      parking.occupiedSlots = occupiedSlots;
      parking.slot1         = slot1         || parking.slot1;
      parking.slot2         = slot2         || parking.slot2;
      parking.lastUpdated   = new Date();

      if (hasGPS) {
        parking.location = { lat, lng };
        parking.gpsFixed = gpsFixed ?? true;
      }

      await parking.save();
      console.log(`✅ Updated parking via HTTP: ${deviceId}`);
    }

    res.status(200).json(parking);
  } catch (err: any) {
    console.error("❌ Error updating parking:", err.message);
    res.status(500).json({ error: "Failed to update parking data" });
  }
};

// ─── DELETE parking by deviceId ──────────────────────────────────────────────
export const deleteParking = async (req: Request, res: Response) => {
  try {
    const deleted = await Parking.findOneAndDelete({ deviceId: req.params.deviceId });
    if (!deleted) {
      return res.status(404).json({ error: "Parking not found" });
    }
    res.status(200).json({ message: `Deleted parking: ${req.params.deviceId}` });
  } catch (err: any) {
    console.error("❌ Error deleting parking:", err.message);
    res.status(500).json({ error: "Failed to delete parking" });
  }
};
