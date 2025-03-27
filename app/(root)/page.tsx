"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {  getProfileDetails } from "@/apis/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const user = await getProfileDetails();
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/sign-in");
      }
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) return null; // Prevents flickering while checking auth

  return null;
}
