import { fetchWithAuth } from "./api";

// clients-api.ts
export interface Client {
    id: string;
    username: string;
    prenom: string | null;
    numTel: string;
    typeUser: string;
    verified: boolean;
    adresseMail?: string;
    adresse?: {
      rue: string;
      ville: string;
      codePostal: string;
      region: string;
    };
    hasAllergy?: boolean;
    allergyDetails?: string;
    image?: string;
    sexe?: string;
    age?: number;
  }
  
  export interface ClientDetails extends Client {
    commandes?: Array<{
      id: number;
      dateCreation: string;
      prixTotal: number;
      status: string;
    }>;
  }
  
  export interface PaginatedClients {
    content: Client[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }
  
  export const getAllClients = async (page: number = 0, size: number = 10): Promise<PaginatedClients> => {
    const response = await fetchWithAuth(`/api/client/clients-light?page=${page}&size=${size}`);
    if (!response.ok) {
      throw new Error('Failed to fetch clients');
    }
    return response.json();
  };
  
  export const getClientById = async (id: string): Promise<ClientDetails> => {
    const response = await fetchWithAuth(`/api/client/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch client details');
    }
    return response.json();
  };
  
  
  export const updateClient = async (id: number, clientData: any): Promise<ClientDetails> => {
    const response = await fetchWithAuth(`/api/client/${id}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    if (!response.ok) {
      throw new Error('Failed to update client');
    }
    return response.json();
  };