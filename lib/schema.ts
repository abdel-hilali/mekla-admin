import { z } from "zod";

export const step1Schema = z.object({
  name: z.string().min(4, "Champ requis"),
  type: z.string().min(4, "Champ requis"),
  description: z.string().min(4, "Champ requis"),
  image: z.any().refine((file) => file instanceof File, "Image requise"),
})