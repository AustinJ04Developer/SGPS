import axios from "axios";
import type { Parking } from "../types/parking";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// GET ALL locations
export const getAllParking = async (): Promise<Parking[]> => {
  const res = await API.get("/");
  return res.data;
};