export interface Parking {
  _id:            string;
  deviceId:       string;
  name:           string;
  location: {
    lat:  number;
    lng:  number;
  };
  gpsFixed:       boolean;
  totalSlots:     number;
  occupiedSlots:  number;
  availableSlots: number;
  slot1:          "OCCUPIED" | "FREE";
  slot2:          "OCCUPIED" | "FREE";
  lastUpdated:    string;
}
