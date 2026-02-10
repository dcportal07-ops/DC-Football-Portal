
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.log("❌ Error: DATABASE_URL is missing in .env");
    process.exit(1);
}

console.log("Connecting to DB...");
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Fetching latest import log...");
    try {
        const log = await prisma.importLog.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });

        if (log) {
            console.log('--- LATEST IMPORT LOG ---');
            console.log(`ID: ${log.id}`);
            console.log(`Status: ${log.status}`);
            console.log(`Action: ${log.action}`);
            try {
                const parsedError = JSON.parse(log.errorMsg);
                console.log('ErrorMsg:', JSON.stringify(parsedError, null, 2));
            } catch (e) {
                console.log(`ErrorMsg (Raw): ${log.errorMsg}`);
            }
        } else {
            console.log('No import logs found.');
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
