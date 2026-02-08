
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const user = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' },
            where: { role: 'PLAYER' },
            select: {
                username: true,
                forcePasswordReset: true,
                createdAt: true
            }
        });

        if (user) {
            console.log(`User: ${user.username}`);
            console.log(`ForceReset: ${user.forcePasswordReset}`);
            console.log(`Time: ${user.createdAt}`);
        } else {
            console.log('No player found.');
        }
    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
