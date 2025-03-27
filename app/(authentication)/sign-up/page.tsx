// src/app/sign-up/page.tsx
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signUpFormSchema } from "@/formSchema/formSchema";
import { useState } from "react";
import { signUp } from "@/apis/auth"; // Import signUp function
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



export default function SignUp() {
    const form = useForm<z.infer<typeof signUpFormSchema>>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            prenom: "",
            nom: "",
            email: "",
            telephone: "",
            motDePasse: "",
            motDePasseConfirmation: "",
            acceptTerms: false,
            age : 0,
            sexe: "",
        },
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    

    const handleSubmit = async (values: z.infer<typeof signUpFormSchema>) => {
        setIsLoading(true);

        try {
            // Pass the store values as arguments to the signUp function
            const isSignedUp = await signUp(values,);// Call signUp function from auth.js

            if (isSignedUp) {
                form.reset();
                router.push('/sign-in'); // Redirect to login after successful registration
            }

        } catch (error: any) {
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false); // Set loading to false regardless of success/failure
        }
    };


  return (
<div className="flex justify-center w-full h-full"> {/* Key change: Outer div takes full width */}
    <div className="w-full "> {/* Key change: Inner div takes full width up to a max-width */}
      <div className="flex flex-col"> {/* Remove lg:flex-row, use flex-col for all screen sizes */}
          {/* Google Button with Logo */}
          <Button
            variant="outline"
            className="w-full mb-4 flex items-center mt-5 justify-center gap-2"
            style={{ borderColor: '#f15928' }}
          >
            <Image
              src="/logos/logoGoogle.png"
              alt="Google Logo"
              width={20}
              height={20}
            />
            Continuez avec Google
          </Button>
          

          {/* Horizontal Bars and "OU" */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-1 bg-gray-300"></div>
            <span className="text-gray-500">OU</span>
            <div className="flex-1 h-1 bg-gray-300"></div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Prénom et Nom */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="prenom"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Prénom :</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Nom :</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email et Téléphone */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email :</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Téléphone :</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro de téléphone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Age et sexe */}
              <div className="flex gap-4">
              <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Age :</FormLabel>
                      <FormControl>
                        <Input placeholder="Age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sexe"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Sexe :</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez votre sexe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Homme">Homme</SelectItem>
                            <SelectItem value="Femme">Femme</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Mot de passe */}
              <FormField
                control={form.control}
                name="motDePasse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe :</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Mot de passe" type={showPassword ? "text" : "password"} {...field} />
                        <button type="button" className="absolute right-3 top-2 text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirmer le mot de passe */}
              <FormField
                control={form.control}
                name="motDePasseConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe :</FormLabel>
                    <FormControl>
                    <div className="relative">
                      <Input placeholder="Confirmer le mot de passe" type={showConfirmPassword ? "text" : "password"} {...field} />
                      <button type="button" className="absolute right-3 top-2 text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Checkbox for terms and conditions */}
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox className="border-[#f15928]"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        style={{ color: "#f15928" }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm">
                      J'accepte les{" "}
                      <a
                        href="/terms"
                        className="text-[#f15928] hover:underline"
                      >
                        Conditions Générales d'Utilisation
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit button */}
              <Button
              type="submit"
              className="w-full rounded-xl"
              style={{ backgroundColor: "#f15928", color: "white" }}
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading ? (
                <div className="animate-spin mr-2"> {/* Add a spinner */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-white"
                  >
                    <path
                      className="opacity-25"
                      fill="currentColor"
                      d="M17.25 12a5.25 5.25 0 01-10.5 0 5.25 5.25 0 0110.5 0z"
                    ></path>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M17.25 12A5.25 5.25 0 0012 6.75v5.25a5.25 5.25 0 005.25 5.25z"
                    ></path>
                  </svg>
                </div>
              ) : (
                "Créez mon compte"
              )}
            </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-gray-600 mt-8">
                      Vous avez un compte ?{" "}
                      <a
                        href="/sign-in"
                        className="text-[#f15928] hover:underline"
                      >
                        connecte
                      </a>
                    </p>
        </div>
      </div>
      </div>
  );
}