// File: prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Hapus semua data lama (opsional, bagus untuk testing ulang)
  await prisma.user.deleteMany({});

  // Enkripsi password sebelum disimpan
  const hashedPassword = await hash("admin123", 12);

  // Buat pengguna Admin baru
  const adminUser = await prisma.user.create({
    data: {
      email: "tigaputrakids@gmail.com",
      name: "Admin Tiga Putra",
      hashedPassword: hashedPassword,
      role: "ADMIN", // Pastikan sesuai dengan enum di schema.prisma
    },
  });

  console.log({ adminUser });
}

// Jalankan fungsi main dan tangani error
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Tutup koneksi prisma
    await prisma.$disconnect();
  });
