
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
            console.log(`Filename: ${log.filename}`);
            console.log(`Row Count: ${log.rowCount}`);
            console.log(`User: ${log.user?.username || 'Unknown'}`);
            console.log(`Created At: ${log.createdAt}`);

            if (log.errorMsg) {
                console.log('--- ERROR MESSAGE ---');
                try {
                    // Keep it as string if it's not valid JSON, otherwise pretty print
                    const parsed = JSON.parse(log.errorMsg);
                    console.log(JSON.stringify(parsed, null, 2));
                } catch (e) {
                    console.log(log.errorMsg);
                }
            } else {
                console.log('No error message recorded.');
            }
        } else {
            console.log('No import logs found in the database.');
        }
    } catch (error) {
        console.error("Error fetching logs:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
