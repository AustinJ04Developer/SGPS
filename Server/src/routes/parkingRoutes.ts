import { Router } from "express";
import {
  getParkings,
  getParkingById,
  updateParking,
  deleteParking,
} from "../controllers/parkingController";

const router = Router();

router.get("/",                    getParkings);       // GET  /api/parkings
router.get("/:deviceId",           getParkingById);    // GET  /api/parkings/ESP32_01
router.post("/update",             updateParking);     // POST /api/parkings/update
router.delete("/:deviceId",        deleteParking);     // DELETE /api/parkings/ESP32_01

export default router;
