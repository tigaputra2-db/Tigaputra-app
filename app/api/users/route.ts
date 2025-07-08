// File: app/api/users/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/app/lib/prisma'
import { Role } from "@prisma/client"; // Pastikan Role sesuai dengan enum yang ada
import { hash } from "bcryptjs";


// Fungsi untuk MENGAMBIL SEMUA data karyawan
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      // Kita tidak ingin mengirim hash password ke frontend
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Gagal mengambil data karyawan:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// Fungsi untuk MEMBUAT karyawan BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password, role } = data;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Enkripsi password sebelum disimpan
    const hashedPassword = await hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: role as Role, // Pastikan role sesuai dengan enum
      },
    });

    // Hapus hash password dari objek yang dikembalikan
    const { hashedPassword: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat karyawan baru:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { message: "Karyawan dengan email tersebut sudah ada." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
