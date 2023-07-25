import { PrismaClient } from "@prisma/client";
import { characterLists } from "./characterLists";

(async () => {

    const prisma = new PrismaClient();

    // // seed games
    // await prisma.game.createMany({
    //     data: Object.keys(characterLists).map(name => {
    //         return {
    //             name: name,
    //             isTeamGame: name === 'umvc3'
    //         }
    //     }),
    //     skipDuplicates: true
    // });

    // // seed characters
    // for (const [name, arr] of Object.entries(characterLists)) {
    //     await prisma.game.update({
    //         where: {
    //             name: name
    //         },
    //         data: {
    //             Characters: {
    //                 createMany: {
    //                     data: arr.map(name => {
    //                         return { name }
    //                     })
    //                 }
    //             }
    //         }
    //     });
    // }

    // // seed alt character names
    // const haggar = await prisma.character.findFirst({
    //     where: {
    //         name: "Haggar"
    //     }
    // });

    // if (haggar) {
    //     await prisma.characterAltName.create({
    //         data: {
    //             name: 'Hagggar',
    //             characterId: haggar.id
    //         }
    //     })
    // }

    // const deejay = await prisma.character.findFirst({
    //     where: {
    //         name: "Dee Jay"
    //     }
    // })

    // if (deejay) {
    //     await prisma.characterAltName.createMany({
    //         data: [
    //             { name: 'Deejay', characterId: deejay.id },
    //             { name: 'Deejjay', characterId: deejay.id }
    //         ]
    //     })
    // }

    // const jackO = await prisma.character.findFirst({
    //     where: {
    //         name: "Jack-O'"
    //     }
    // })

    // if (jackO) {
    //     await prisma.characterAltName.createMany({
    //         data: [
    //             { name: 'Jack-O', characterId: jackO.id }
    //         ]
    //     })
    // }

    // const bedman = await prisma.character.findFirst({
    //     where: {
    //         name: "Bedman?"
    //     }
    // })

    // if (bedman) {
    //     await prisma.characterAltName.createMany({
    //         data: [
    //             { name: 'Bedman', characterId: bedman.id }
    //         ]
    //     })
    // }

    const zato = await prisma.character.findFirst({
        where: {
            name: "Zato"
        }
    })

    if (zato) {
        await prisma.characterAltName.createMany({
            data: [
                { name: 'Zato-1', characterId: zato.id }
            ]
        })
    }


})();