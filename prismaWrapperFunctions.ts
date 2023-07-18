import { Character, PrismaClient } from "@prisma/client";
import { CharactersUsed, TeamUsed, TourneyData } from "./types";


const getCharactersByGame = async (prisma: PrismaClient, gameId: number) => {

    const characters: Character[] = await prisma.character.findMany({
        where: {
            gameId: gameId
        }
    });

    return characters;
}

const getCharacterById = async (prisma: PrismaClient, id: number) => {

    const character = await prisma.character.findUnique({
        where: {
            id: id
        }
    });

    if (character == null) throw new Error(`INTERNAL SERVER ERROR: No character found with id ${id}`);

    return character;
}

const getCharacterByGameIdAndNameOrNull = async (prisma: PrismaClient, id: number, name: string) => {

    const character = await prisma.character.findFirst({
        where: {
            gameId: id,
            name: name
        }
    });

    // Does not have a null check like others because we want can use the null value elsewhere

    return character;
}

const getGameById = async (prisma: PrismaClient, id: number) => {

    const game = await prisma.game.findUnique({
        where: {
            id: id
        }
    });

    if (game == null) throw new Error(`INTERNAL SERVER ERROR: No game found with id ${id}`);

    return game;
}

const getGameByName = async (prisma: PrismaClient, name: string) => {

    const game = await prisma.game.findFirst({
        where: {
            name: name
        }
    });

    if (game == null) throw new Error(`INTERNAL SERVER ERROR: No game found with name ${name}`);

    return game;
}

const saveTournament = async (prisma: PrismaClient, tourneyData: TourneyData, charactersUsed: CharactersUsed, teamsUsed: TeamUsed[]) => {

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
    } finally {
        const tournament = await prisma.tournament.findFirst({
            where: tourneyData
        });

        if (tournament == null) throw new Error(`INTERNAL SERVER ERROR: No tournament found with url ${tourneyData.url}`);

        return tournament;
    }

}

export const prismaWrapperFunctions = {
    getCharactersByGame,
    getCharacterByGameIdAndNameOrNull,
    getCharacterById,
    getGameById,
    getGameByName,
    saveTournament
}