// File: app/hooks/useAuth.ts

"use client";

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function useAuth() {
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    // Pastikan kode ini hanya berjalan di browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          setUser(decodedToken);
        } catch (error) {
          console.error("Gagal mendekode token:", error);
          setUser(null);
        }
      }
    }
  }, []);

  return { user };
}
