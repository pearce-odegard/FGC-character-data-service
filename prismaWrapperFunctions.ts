import { Character, PrismaClient } from "@prisma/client";
import { CharactersUsed, TeamUsed, TourneyData } from "./types";


export const getCharactersByGame = async (prisma: PrismaClient, gameId: number) => {

    let characters: Character[] = await prisma.character.findMany({
        where: {
            gameId: gameId
        }
    });

    return characters;
}

export const getCharacterById = async (prisma: PrismaClient, id: number) => {

    let character = await prisma.character.findUnique({
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

    // Does not have a null check because we want to check whether 

    return character;
}

export const getGameById = async (prisma: PrismaClient, id: number) => {

    let game = await prisma.game.findUnique({
        where: {
            id: id
        }
    });

    if (game == null) throw new Error(`INTERNAL SERVER ERROR: No game found with id ${id}`);

    return game;
}

export const getGameByName = async (prisma: PrismaClient, name: string) => {

    let game = await prisma.game.findFirst({
        where: {
            name: name
        }
    });

    if (game == null) throw new Error(`INTERNAL SERVER ERROR: No game found with name ${name}`);

    return game;
}

export const saveTournament = async (prisma: PrismaClient, tourneyData: TourneyData, charactersUsed: CharactersUsed, teamsUsed: TeamUsed[]) => {

    try {
        const tournament = await prisma.tournament.create({
            data: {
                date: tourneyData.date,
                title: tourneyData.title,
                gameId: tourneyData.gameId,
                url: tourneyData.url,
                // come back to this when we know what teamsUsed will be
                teamsUsed: {
                    createMany: {
                        data: teamsUsed
                    }
                },
                CharactersOnTournaments: {
                    createMany: {
                        data: Object.values(charactersUsed)
                    }
                }
            }
        })

        return tournament;

    } catch (e) {
        console.log("Tournament already exists in database");
    }

}

// export const connectTeams