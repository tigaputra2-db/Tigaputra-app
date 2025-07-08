// File: app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Di App Router, kita menggunakan nama method HTTP (POST, GET, dll) sebagai nama fungsi
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // 1. Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 2. Bandingkan password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 3. Buat Token Sesi (JWT)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // 4. Kirim token kembali sebagai respons sukses
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
