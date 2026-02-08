
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const log = await prisma.importLog.findFirst({
        orderBy: { createdAt: 'desc' },
    });

    if (log) {
        console.log('Latest Import Log:');
        console.log(JSON.stringify(log, null, 2));
        if (log.errorMsg) {
            console.log('Error Details:');
            try {
                const errors = JSON.parse(log.errorMsg);
                console.log(JSON.stringify(errors, null, 2));
            } catch (e) {
                console.log("Could not parse errorMsg JSON:", log.errorMsg);
            }
        }
    } else {
        console.log('No import logs found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
