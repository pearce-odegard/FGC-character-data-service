export type TourneyData = {
    title: string,
    game: string,
    dateString: string,
    date: number,
    url: string,
    charactersUsed: CharactersUsed,
    teamsUsed?: Team[]
}

export type CharactersUsed = {
    [key: string]: number
}

export type CharacterLists = {
    [key: string]: string[]
}

export type Team = {
    [key: string]: string
}

