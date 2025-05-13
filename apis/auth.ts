// src/apis/auth.js
import { z } from "zod";
import { signInFormSchema } from "@/formSchema/formSchema";
import { Profile } from "@/types/types";
import { fetchWithAuth } from "./api";


export async function getConnectedUserId(): Promise<number | null> {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
        try {
            const response = await fetchWithAuth(`/api/auth/me`, {
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                return userData.id; // Return the user ID
            } else {
                console.error('Failed to fetch profile data:', response.status);
                localStorage.removeItem('isLoggedIn'); // if /auth/me fails, session is likely invalid
                return null; // Return null indicating no connected user
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
            localStorage.removeItem('isLoggedIn'); // if fetch fails, session is likely invalid
            return null; // Return null in case of error
        }
    } else {
        return null; // Return null if not logged in
    }
}

export async function getProfileDetails(): Promise<Profile | null> {
    try {
        const user = await getConnectedUserId();
        if (!user) return null;
        
        const response = await fetchWithAuth(`/api/auth/client/${user}`, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();

            // Map the response data to your Profile type
            const profile: Profile = {
                picture: "/testx/t3.png", // You might need to adjust this based on your API response
                name: data.username,
                firstName: data.prenom,
                email: data.adresseMail,
                phone: data.numTel,
                address: data.adresse,
                allergies: data.allergyDetails,
                code: 'abdel1SZD', // You might need to adjust this based on your API response
                type: data.typeUser,
                age:data.age,
                sexe: data.sexe,
                hasAllergies: data.hasAllergy
            };

            return profile;
        } else {
            console.error('Failed to fetch profile details:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching profile details:', error);
        return null;
    }
}


export const signIn = async (
    formData: FormData,
    formValues: z.infer<typeof signInFormSchema>
): Promise<boolean> => {
    try {
        const response = await fetch(`/api/auth/login`, {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.log(errorData || "Invalid credentials.");
            return false; // ⛔ Return false if login fails
        }

        console.log("Login successful!");
        localStorage.setItem("isLoggedIn", "true");

        return true; // ✅ Return true on success
    } catch (error) {
        console.error("Login error:", error);
        return false; // ⛔ Return false on error
    }
};

// auth.js (or your data fetching file - you might need to adjust the file path)

export const savePersonalInformations = async (userId: number, updatedProfile: Profile): Promise<boolean> => {
    try {
        const response = await fetch(`/api/auth/client/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: updatedProfile.name,
                prenom: updatedProfile.firstName,
                adresseMail: updatedProfile.email,// Assuming password is part of the profile
                role: "ADMIN",
                "adresse": {
                    "rue": updatedProfile.address.rue,
                    "ville": updatedProfile.address.ville,
                    "codePostal":updatedProfile.address.codePostal,
                    "region": updatedProfile.address.region
                },
                hasAllergy: updatedProfile.hasAllergies,
                allergyDetails: updatedProfile.allergies,
                typeUser: updatedProfile.type,
                sexe: updatedProfile.sexe,
                age: updatedProfile.age,
                numTel: updatedProfile.phone,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || "Failed to update profile.";
            console.log(errorMessage); // Display error message
            return false; // Indicate failure
        }

        const data = await response.json();
        console.log("Profile update successful:", data);
        console.log("Profile updated successfully!");
        return true; // Indicate success

    } catch (error: any) {
        console.error("Profile update error:", error);
        console.log("An error occurred during profile update.");
        return false; // Indicate failure
    }
};
  

export async function getProfileDetailsById(userId: number): Promise<Profile | null> {
    try {
        const response = await fetchWithAuth(`/api/auth/client/${userId}`, {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();

            // Map the response data to your Profile type
            const profile: Profile = {
                picture: data.image, // You might need to adjust this based on your API response
                name: data.username,
                firstName: data.prenom,
                email: data.adresseMail,
                phone: data.numTel,
                address: data.adresse,
                allergies: data.allergyDetails,
                code: 'abdel1SZD', // You might need to adjust this based on your API response
                type: data.typeUser,
                age:data.age,
                sexe: data.sexe,
                hasAllergies: data.hasAllergy
            };

            return profile;
        } else {
            console.error('Failed to fetch profile details:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching profile details:', error);
        return null;
    }
}