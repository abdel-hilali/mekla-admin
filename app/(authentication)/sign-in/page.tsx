"use client"
import type * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { signIn } from "@/apis/auth"
import { signInFormSchema } from "@/formSchema/formSchema"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function SignIn() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      motDePasse: "",
    },
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (values: z.infer<typeof signInFormSchema>) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("username", values.email)
      formData.append("password", values.motDePasse)

      const isAuthenticated = await signIn(formData, values) // 🔥 Call signIn function

      if (isAuthenticated) {
        router.push("/menu") // ✅ Redirect if login is successful
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center w-full md:max-w-[70%]  h-full">
      {" "}
      {/* Key change: Outer div takes full width */}
      <div className="w-full ">
        {" "}
        {/* Key change: Inner div takes full width up to a max-width */}
        <div className="flex flex-col">
  
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Email */}
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
                        <button
                          type="button"
                          className="absolute right-3 top-2 text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full rounded-xl "
                style={{ backgroundColor: "#f15928", color: "white" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin mr-2">
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
                  "Se connecter"
                )}
              </Button>
            </form>
          </Form>
        
        </div>
      </div>
    </div>
  )
}

