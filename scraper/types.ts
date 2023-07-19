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
