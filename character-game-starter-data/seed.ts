import { PrismaClient } from "@prisma/client";
import { marvel, sf6 } from "./characterLists";

(async () => {

    const prisma = new PrismaClient();

    // // seed games
    // await prisma.game.createMany({
    //     data: [
    //         { name: 'sf6' },
    //         { name: 'marvel' }
    //     ]
    // });

    // // seed sf6 characters
    await prisma.game.update({
        where: {
            name: 'sf6'
        },
        data: {
            Character: {
                create: sf6.map(name => {
                    return { name }
                })
            }
        }
    });

    // seed marvel characters
    await prisma.game.update({
        where: {
            name: 'marvel'
        },
        data: {
            Character: {
                create: marvel.map(name => {
                    return { name }
                })
            }
        }
    });

    // seed alt character names
    const haggar = await prisma.character.findFirst({
        where: {
            name: "Haggar"
        }
    });

    if (haggar) {
        await prisma.characterAltName.create({
            data: {
                name: 'Hagggar',
                characterId: haggar.id
            }
        })
    }

    const deejay = await prisma.character.findFirst({
        where: {
            name: "Dee Jay"
        }
    })

    if (deejay) {
        await prisma.characterAltName.createMany({
            data: [
                { name: 'Deejay', characterId: deejay.id },
                { name: 'Deejjay', characterId: deejay.id }
            ]
        })
    }

})();