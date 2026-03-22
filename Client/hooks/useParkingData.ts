import { useEffect, useState } from "react";
import { getAllParking } from "../api/parkingApi";
import { Parking } from "../types/parking";

export default function useParkingData() {
  const [data, setData] = useState<Parking[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllParking();
      setData(res);
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return data;
}