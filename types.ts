import { Character, Game, PrismaClient, Team } from "@prisma/client"

export type TourneyData = {
    title: string,
    game: string,
    dateString: string,
    date: number,
    url: string,
    charactersUsed: CharactersUsed,
    teamsUsed?: Team[]
}

// export type CharactersUsed = {
//     [key: string]: number
// }

export type CharactersUsed = {
    [key: string]: {
        characterId: number,
        numOfUses: number
    }
}

// export type CharacterUsed = {
//     name: string
//     characterId: number,
//     numOfUses: number
// }

export type CharacterLists = {
    [key: string]: string[]
}

export type TeamUsed = {
    [key: string]: number
}

export type CharacterPartial = {
    id: number,
    name: string
}

export type TallyFunctionMarvelResult = {
    charactersUsed: CharactersUsed,
    teamsUsed: TeamUsed[]
}

export type TallyFunctions = {
    marvel: (prisma: PrismaClient, game: Game, htmlElementArray: string[]) => Promise<TallyFunctionMarvelResult>,
    sf6: (htmlElementArray: string[], characters: Character[]) => CharactersUsed
}