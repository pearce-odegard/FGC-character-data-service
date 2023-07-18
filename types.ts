import { Character, Game, PrismaClient, Team, Tournament } from "@prisma/client"

export type TourneyData = {
    title: string,
    gameId: number,
    date: Date,
    url: string,
}

export type CharactersUsed = {
    [key: string]: {
        characterId: number,
        characterUses: number
    }
}

export type TeamUsed = {
    [key: string]: number
}

// export type TallyFunctionMarvelResult = {
//     charactersUsed: CharactersUsed,
//     teamsUsed: TeamUsed[]
// }

export type TallyFunctions = {
    marvel: (
        prisma: PrismaClient,
        game: Game,
        htmlElementArray: string[],
        characterFunction: (prisma: PrismaClient, id: number, name: string) => Promise<Character | null>
    ) => Promise<[CharactersUsed, TeamUsed[]]>,
    sf6: (htmlElementArray: string[], characters: Character[]) => CharactersUsed
}

export type PrismaWrapperFunctions = {
    getCharactersByGame: (prisma: PrismaClient, gameId: number) => Promise<Character[]>,
    getCharacterByGameIdAndNameOrNull: (prisma: PrismaClient, id: number, name: string) => Promise<Character | null>,
    getCharacterById: (prisma: PrismaClient, id: number) => Promise<Character>,
    getGameById: (prisma: PrismaClient, id: number) => Promise<Game>,
    getGameByName: (prisma: PrismaClient, name: string) => Promise<Game>,
    saveTournament: (prisma: PrismaClient, tourneyData: TourneyData, charactersUsed: CharactersUsed, teamsUsed: TeamUsed[]) => Promise<Tournament>
}