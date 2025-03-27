import { z } from "zod";

export const signInFormSchema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(4, "Le mot de passe doit contenir au moins 4 caractères"),
});

export const signUpFormSchema = z.object({
  prenom: z.string().min(3, "Le prénom est requis"),
  nom: z.string().min(3, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Le numéro de téléphone doit contenir 8 chiffres"),
  age: z.preprocess( // Use z.preprocess to transform the input first
    (val) => {
      const parsedAge = parseInt(String(val), 10); // Ensure val is treated as string for parseInt
      if (isNaN(parsedAge)) {
        return NaN;
      }
      return parsedAge;
    },
    z.number({ // Then, validate the *preprocessed* value as a number
      invalid_type_error: "L'âge doit être un nombre valide", // Custom error for invalid number type
    }).min(10, "Le Age > 18")
      .max(99, "Le Age < 99")
  ),
  sexe: z.string().min(1, "Le sexe est requis"),
  motDePasse: z.string().min(4, "Le mot de passe doit contenir au moins 4 caractères"),
  motDePasseConfirmation: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions générales d'utilisation",
  }),
}).refine((data) => data.motDePasse === data.motDePasseConfirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["motDePasseConfirmation"],
});

export const personelleInformationSchema = z.object({
  name: z.string().min(4, 'Le nom doit contenir au moins 4 caractères').regex(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/, 'Uniquement des lettres'),
  firstName: z.string().min(4, 'Le prénom doit contenir au moins 4 caractères').regex(/^[A-Za-zÀ-ÖØ-öø-ÿ]+$/, 'Uniquement des lettres'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().regex(/^\+216\s?\d{2}\s?\d{3}\s?\d{3}$/, 'Numéro de téléphone invalide'),
age: z.preprocess( // Use z.preprocess to transform the input first
  (val) => {
    const parsedAge = parseInt(String(val), 10); // Ensure val is treated as string for parseInt
    if (isNaN(parsedAge)) {
      return NaN;
    }
    return parsedAge;
  },
  z.number({ // Then, validate the *preprocessed* value as a number
    invalid_type_error: "L'âge doit être un nombre valide", // Custom error for invalid number type
  }).min(10, "Le Age > 18")
    .max(99, "Le Age < 99")
),
sexe: z.string().min(0, "Le sexe est requis"),
});