"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/home"); // ✅ Go to dashboard
    } else {
      router.push("/login"); // 🚪 Go to login page
    }
  }, [router]);

  return null; // No content needed, just redirects
}
