import { Character, Game, PrismaClient, Team } from "@prisma/client"

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

export type TallyFunctionMarvelResult = {
    charactersUsed: CharactersUsed,
    teamsUsed: TeamUsed[]
}

export type TallyFunctions = {
    marvel: (prisma: PrismaClient, game: Game, htmlElementArray: string[]) => Promise<TallyFunctionMarvelResult>,
    sf6: (htmlElementArray: string[], characters: Character[]) => CharactersUsed
}