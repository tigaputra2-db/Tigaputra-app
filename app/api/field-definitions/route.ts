// File: app/api/field-definitions/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fungsi untuk MEMBUAT Definisi Kolom BARU
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      label,
      name,
      type,
      options,
      placeholder,
      isRequired,
      order,
      productTypeId,
    } = data;

    if (!label || !name || !type || !productTypeId) {
      return NextResponse.json(
        { message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const newField = await prisma.fieldDefinition.create({
      data: {
        label,
        name,
        type: type,
        options: options || [],
        placeholder,
        isRequired: isRequired || false,
        order: Number(order) || 0,
        productTypeId,
      },
    });

    return NextResponse.json(newField, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat definisi kolom:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
