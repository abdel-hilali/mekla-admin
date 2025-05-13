export enum PlatType {
  PLAT = "PLAT",
  DESSERT = "DESSERT",
  ENTREE = "ENTREE"
}

export interface Plat {
  id: number;
  nomPlat: string;
  description: string;
  photo: string;
  prix?: number;
  ingredient: string;
  calories?: number;
  typePlat: string;
  platCalories?: PlatCalories[];
  
}

export interface PlatCalories {
  typeUser: string;
  calories: number;
  prix: number;
}

export interface PlatData {
  nomPlat: string;
  description: string;
  ingredient: string;
  photo: string;
  typePlat: string;
  platCalories: PlatCalories[];
}

import { fetchImgWithAuth, fetchWithAuth } from "./api";

export async function getAllPlats(filter: string): Promise<Plat[]> {
  try {
    const response = await fetchWithAuth(`/api/plats/filter/${filter}`);

    if (!response.ok) {
      throw new Error("Failed to fetch plats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching plats:", error);
    return [];
  }
}

export async function createPlat(platData: PlatData): Promise<Plat> {
  try {
    const response = await fetchWithAuth(`/api/plats/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(platData),
    });

    if (!response.ok) {
      throw new Error("Failed to create plat");
    }

    const createdPlat = await response.json();
    return createdPlat;
  } catch (error) {
    console.error("Failed to create plat:", error);
    throw error;
  }
}

export async function updatePlat(id: number, platData: PlatData): Promise<Plat> {
  try {
    const response = await fetchWithAuth(`/api/plats/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(platData),
    });

    if (!response.ok) {
      throw new Error("Failed to update plat");
    }

    const updatedPlat = await response.json();
    return updatedPlat;
  } catch (error) {
    console.error("Failed to update plat:", error);
    throw error;
  }
}

export async function getPlatById(id: number): Promise<Plat | null> {
  try {
    const response = await fetchWithAuth(`/api/plats/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch plat");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching plat:", error);
    return null;
  }
}

export async function getPlat(platId: number, typeUser: string): Promise<Plat | null> {
  try {
      // 1. Récupérer les informations de base du plat
      const platResponse = await fetchWithAuth(`/api/plats/${platId}`);
      if (!platResponse.ok) {
          console.log(`Erreur lors de la récupération des informations du plat (ID: ${platId}): ${platResponse.status} - ${platResponse.statusText}`);
          return null; // Gérer l'erreur si la requête échoue (vous pouvez choisir de lancer une erreur plutôt que de retourner null)
      }

      // 2. Récupérer les informations de calories et prix spécifiques au type d'utilisateur
      const platCaloriesResponse = await fetchWithAuth(`/api/plat-calories/${platId}/${typeUser}`);
      if (!platCaloriesResponse.ok) {
          return null; // Gérer l'erreur (idem, vous pouvez lancer une erreur)
      }

      const platData = await platResponse.json();
      const platCalories = await platCaloriesResponse.json();
      const platComplet: Plat = {
          calories: platCalories.calories,
          description: platData.description,
          id: platData.id,
          ingredient: platData.ingredient,
          photo: platData.photo,
          nomPlat: platData.nomPlat, 
          prix: platCalories.prix,
          typePlat: platData.typePlat,
      }

      return platComplet;

  } catch (error) {
      console.log("Erreur inattendue lors de la récupération du plat:", error);
      return null; // Gérer les erreurs inattendues (vous pouvez choisir de lancer une erreur)
  }
}




export async function deletePlat(id: number): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`/api/plats/delete/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete plat");
    }

    return true;
  } catch (error) {
    console.error("Error deleting plat:", error);
    return false;
  }
}

export const uploadPlatImage = async (
  id: number,
  file: File,
): Promise<{ success: boolean; message?: string; imageUrl?: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    console.log(`Uploading plat image for plat ${id}`);
    
    const response = await fetchImgWithAuth(`/api/plats/${id}/upload-photo`, {
      method: "POST",
      body: formData,
    });

    // First check if response has body/text before trying to parse JSON
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = text ? { message: text } : {};
    }

    console.log("Upload response:", responseData);

    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || "Failed to update plat image.";
      console.error("Upload error:", errorMessage);
      return { success: false, message: errorMessage };
    }

    // Handle both JSON and plain text responses
    const imageUrl = responseData.fileName || responseData.imageUrl || 
                    (typeof responseData === 'string' ? responseData : null);
    
    return {
      success: true,
      message: "Photo de plat mise à jour avec succès!",
      imageUrl: imageUrl,
    };
  } catch (error) {
    console.error("Plat image update error:", error);
    return {
      success: false,
      message: "Une erreur s'est produite lors de la mise à jour de la photo du plat.",
    };
  }
};