import {
    getCharacterByGameIdAndNameOrNull,
    getCharacterById,
    getCharactersByGame,
    getGameById,
    getGameByName,
    saveTournament
} from "./prismaWrapperFunctions";

export const prismaWrapperFunctions = {
    getCharactersByGame,
    getCharacterByGameIdAndNameOrNull,
    getCharacterById,
    getGameById,
    getGameByName,
    saveTournament
}

export * from './tallyFunctions';
export * from './scrapeHelpers';
export * from './types';
export * from './scraper'