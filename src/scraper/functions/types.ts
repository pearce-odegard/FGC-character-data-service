import { Game, PrismaClient } from "@prisma/client";
import { Browser } from "puppeteer";
import { tallyCharactersUsed } from "./tallyFunctions";
import { determineGameInVideo, waitThenClick } from "./scrapeHelpers";
import { prismaWrapperFunctions } from ".";

export type PrismaWrapperFunctions = typeof prismaWrapperFunctions;

export type DetermineGameTitleFunction = typeof determineGameInVideo;

export type WaitThenClick = typeof waitThenClick;

export interface NextPrevious {
    [key: string]: string
}

export interface ScrapeCharactersUsedParams {
    videoUrlList: string[];
    determineGameTitleFunction: DetermineGameTitleFunction;
    waitThenClick: WaitThenClick;
    browser: Browser;
    prisma: PrismaClient;
}

export interface TallyCharactersUsedParams {
    prisma: PrismaClient,
    tourneyData: TourneyData,
    getCharacterFunction: PrismaWrapperFunctions['getCharacterByGameIdAndNameOrNull']
}

export interface TourneyData {
    title: string;
    gameId: number;
    date: Date;
    url: string;
    descriptionSpanArray: string[];
}

export interface CharactersUsed {
    [key: string]: {
        characterId: number,
        characterUses: number
    }
}

export interface TeamUsed {
    [key: string]: number
}
