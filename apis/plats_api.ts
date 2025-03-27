import { Plat, PlatData } from "@/types/types";
import { fetchWithAuth } from "./api";

export async function getAllPlats( filter :string): Promise<Plat[]> {
  try {
    const response = await fetchWithAuth(`http://localhost:8080/plats/${filter}`);

    if (!response.ok) {
      throw new Error("Failed to fetch plats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching plats:", error);
    return [];
  }
}


export async function createPlat(platData: PlatData) {
  const response = await fetchWithAuth("http://localhost:8080/plats/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(platData),
  });

  if (!response.ok) {
    throw new Error("Failed to create plat");
  }

  return response.json();
}

export async function getPlatById( id :number): Promise<Plat|null> {
  try {
    const response = await fetchWithAuth(`http://localhost:8080/plats/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch plats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching plats:", error);
    return null;
  }
}