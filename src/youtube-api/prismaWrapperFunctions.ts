import { Character, PrismaClient } from "@prisma/client";
// import { CharactersUsed, TeamUsed, TourneyData } from "../types";

export const getCharactersByGame = async (prisma: PrismaClient, gameId: number) => {

    const characters: Character[] = await prisma.character.findMany({
        where: {
            gameId: gameId
        }
    });

    return characters;
}

export const getCharacterById = async (prisma: PrismaClient, id: number) => {

    const character = await prisma.character.findUnique({
        where: {
            id: id
        }
    });

    if (character == null) throw new Error(`INTERNAL SERVER ERROR: No character found with id ${id}`);

    return character;
}

export const getCharacterByGameIdAndNameOrNull = async (prisma: PrismaClient, id: number, name: string) => {

    let character = await prisma.character.findFirst({
        where: {
            gameId: id,
            name: name
        }
    });

    if (character) return character;

    const characterAltName = await prisma.characterAltName.findFirst({
        where: { name }
    });

    if (characterAltName) {
        return await prisma.character.findUnique({
            where: {
                id: characterAltName.characterId
            }
        });
    }

    // Still can return null for use when checking if a character exists in the db

    return null;
}

export const getGameById = async (prisma: PrismaClient, id: number) => {

    const game = await prisma.game.findUnique({
        where: {
            id: id
        }
    });

    if (game == null) throw new Error(`INTERNAL SERVER ERROR: No game found with id ${id}`);

    return game;
}

export const getGameByName = async (prisma: PrismaClient, name: string) => {

    const game = await prisma.game.findFirst({
        where: {
            name: name
        }
    });

    if (game == null) throw new Error(`INTERNAL SERVER ERROR: No game found with name ${name}`);

    return game;
}

// export const saveTournament = async (prisma: PrismaClient, tourneyData: TourneyData, charactersUsed: CharactersUsed, teamsUsed: TeamUsed[]) => {

//     const tournament = await prisma.tournament.findFirst({
//         where: tourneyData
//     });

//     if (tournament) {
//         console.log(`Tournament ${tournament.url} already exists in db`)
//         return tournament;
//     }

//     const newTournament = await prisma.tournament.create({
//         data: {
//             date: tourneyData.date,
//             title: tourneyData.title,
//             gameId: tourneyData.gameId,
//             url: tourneyData.url,
//             CharactersOnTournaments: {
//                 createMany: {
//                     data: Object.values(charactersUsed)
//                 }
//             }
//         }
//     });

//     for (const team of teamsUsed) {
//         await prisma.tournament.update({
//             where: {
//                 id: newTournament.id,
//             },
//             data: {
//                 teamsUsed: {
//                     create: {
//                         characters: {
//                             connect: [
//                                 { id: team.character1 },
//                                 { id: team.character2 },
//                                 { id: team.character3 },
//                             ]
//                         }
//                     }
//                 }
//             }
//         });
//     }

//     return newTournament;
// }

