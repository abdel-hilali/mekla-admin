import { fetchWithAuth } from "./api";

export type Livreur = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  zone: string;
  commandes: any[]; // You might want to create a proper type for commandes
};

export type LivreurData = Omit<Livreur, 'id' | 'commandes'> & { id?: number };

export async function getAllLivreurs(): Promise<Livreur[]> {
  try {
    const response = await fetchWithAuth(`/api/livreurs`);

    if (!response.ok) {
      throw new Error("Failed to fetch livreurs");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching livreurs:", error);
    return [];
  }
}

export async function getLivreurById(id: number): Promise<Livreur | null> {
  try {
    const response = await fetchWithAuth(`/api/livreurs/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch livreur");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching livreur:", error);
    return null;
  }
}

export async function createLivreur(livreurData: LivreurData): Promise<Livreur> {
  const response = await fetchWithAuth(`/api/livreurs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(livreurData),
  });

  if (!response.ok) {
    throw new Error("Failed to create livreur");
  }

  return response.json();
}

export async function updateLivreur(livreurData: LivreurData): Promise<Livreur> {
  if (!livreurData.id) {
    throw new Error("Livreur ID is required for update");
  }
  
  const response = await fetchWithAuth(`/api/livreurs/${livreurData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(livreurData),
  });

  if (!response.ok) {
    throw new Error("Failed to update livreur");
  }

  return response.json();
}

export async function deleteLivreur(id: number): Promise<void> {
  const response = await fetchWithAuth(`/api/livreurs/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete livreur");
  }
}

export async function assignCommandes(livreurId: number, commandeIds: number[]): Promise<void> {
  const response = await fetchWithAuth(`/api/livreurs/affecter-commandes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ livreurId, commandeIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to assign commandes");
  }
}

export async function unassignCommandes(livreurId: number, commandeIds: number[]): Promise<void> {
  const response = await fetchWithAuth(`/api/livreurs/desaffecter-commandes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ livreurId, commandeIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to unassign commandes");
  }
}