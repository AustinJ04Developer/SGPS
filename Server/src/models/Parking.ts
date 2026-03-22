import mongoose, { Schema, Document } from "mongoose";

export interface IParking extends Document {
  deviceId: string;
  name: string;
  location: { lat: number; lng: number };
  gpsFixed: boolean;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  slot1: string;
  slot2: string;
  lastUpdated: Date;
}

const ParkingSchema: Schema = new Schema({
  deviceId:      { type: String, required: true, unique: true },
  name:          { type: String, default: "Smart Parking" },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  gpsFixed:      { type: Boolean, default: false },
  totalSlots:    { type: Number, required: true, default: 2 },
  occupiedSlots: { type: Number, default: 0 },
  availableSlots:{ type: Number, default: 0 },
  slot1:         { type: String, enum: ["OCCUPIED", "FREE"], default: "FREE" },
  slot2:         { type: String, enum: ["OCCUPIED", "FREE"], default: "FREE" },
  lastUpdated:   { type: Date, default: Date.now },
});

// Auto-calculate availableSlots before every save
ParkingSchema.pre<IParking>("save", function (next) {
  this.availableSlots = this.totalSlots - this.occupiedSlots;
  next();
});

export default mongoose.model<IParking>("Parking", ParkingSchema);
