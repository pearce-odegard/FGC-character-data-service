import { Character, PrismaClient } from "@prisma/client";
import { CharactersUsed, TeamUsed, TourneyData } from "./types";


export const getCharacters = async (prisma: PrismaClient, gameId: number) => {

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

export const getGameById = async (prisma: PrismaClient, id: number) => {

    let game = await prisma.game.findUnique({
        where: {
            id: id
        }
    });

    if (game == null) throw new Error(`INTERNAL SERVER ERROR: No game found with id ${id}`);

    return game;
}

export const saveTournament = async (prisma: PrismaClient, tourneyData: TourneyData, charactersUsed: CharactersUsed, teamsUsed: TeamUsed[] | null) => {
    const tournament = await prisma.tournament.create({
        data: {
            date: tourneyData.date,
            title: tourneyData.title,
            gameId: tourneyData.gameId,
            url: tourneyData.url,
            // come back to this when we know what teamsUsed will be
            teamsUsed: teamsUsed == null ? undefined : {
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
}

// export const connectTeams