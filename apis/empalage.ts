import { fetchWithAuth } from "./api";

export type Emballage = {
  id: number;
  nomEmballage: string;
  descriptionEmballage: string;
  prix: number;
  photoEmballage: string;
} | null;

export const getEmballage = async (
  emballageId: number,
): Promise<{ success: boolean; data?: Emballage; message?: string }> => {
  try {
    const response = await fetchWithAuth(`/api/emballage/${emballageId}`);

    if (!response.ok) {
      return {
        success: false,
        message: "Erreur lors du chargement des emballages.",
      };
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log("Emballage fetch error:", error);
    const message = error instanceof Error ? error.message : "Une erreur s&lsquo;est produite lors du chargement des emballages.";
    return {
      success: false,
      message,
    };
  }
};

export const getAllEmballages = async (): Promise<{
  success: boolean;
  data?: Emballage[];
  message?: string;
}> => {
  try {
    const response = await fetchWithAuth(`/api/emballage/all`);

    if (!response.ok) {
      return {
        success: false,
        message: "Erreur lors du chargement des emballages.",
      };
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log("All emballages fetch error:", error);
    const message = error instanceof Error ? error.message : "Une erreur s&lsquo;est produite lors du chargement des emballages.";
    return {
      success: false,
      message,
    };
  }
};