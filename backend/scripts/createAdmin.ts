import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

async function main() {
    const email = "admin@gmail.com";
    const password = await hashPassword("admin12345");

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        await prisma.user.update({
            where: { email },
            data: { password, role: UserRole.ADMIN }
        });
        console.log(`Updated existing user: ${email} to be ADMIN with password 'admin123'`);
    } else {
        await prisma.user.create({
            data: {
                email,
                password,
                role: UserRole.ADMIN
            }
        });
        console.log(`Created new ADMIN user: ${email} with password 'admin123'`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
