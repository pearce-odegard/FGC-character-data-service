import { PrismaClient, Game, Character, Tournament } from "@prisma/client";
import { CharactersUsed, TeamUsed, TourneyData } from "../types";
import { getCharacterByGameIdAndNameOrNull, getCharacterById, getCharactersByGame, getGameById, getGameByName, saveTournament } from "./prismaWrapperFunctions";
import { checkUniqueCharNamingMarvel, tallyFunctionMarvel, tallyFunctionSF6, tallyFunctionStrive } from "./tallyFunctions";
import { Page, Browser } from "puppeteer";
import { TallyFunctions, PrismaWrapperFunctions, DetermineGameTitleFunction, WaitThenClick, ExecuteTallyFunction } from "./types";

export const prismaWrapperFunctions = {
    getCharactersByGame,
    getCharacterByGameIdAndNameOrNull,
    getCharacterById,
    getGameById,
    getGameByName,
    saveTournament
}

export const tallyFunctions = {
    marvel: tallyFunctionMarvel,
    sf6: tallyFunctionSF6,
    strive: tallyFunctionStrive,
    checkUniqueCharNamingMarvel
}

export const executeTallyFunction = async (
    prisma: PrismaClient,
    htmlElementArray: string[],
    tallyFunctions: TallyFunctions,
    game: Game,
    characters: Character[],
    characterFunction: PrismaWrapperFunctions['getCharacterByGameIdAndNameOrNull']
): Promise<[CharactersUsed, TeamUsed[]]> => {

    let charactersUsed: CharactersUsed = {};
    let teamsUsed: TeamUsed[] = [];

    if (game.name === 'umvc3') {
        [charactersUsed, teamsUsed] = await tallyFunctions.marvel(
            prisma,
            game,
            htmlElementArray,
            characterFunction,
            tallyFunctions.checkUniqueCharNamingMarvel
        );
    } else if (game.name === 'sf6') {
        charactersUsed = await tallyFunctions.sf6(prisma, htmlElementArray, characters);
    } else if (game.name === 'strive') {
        charactersUsed = await tallyFunctions.strive(prisma, htmlElementArray, characters);
    }

    return [charactersUsed, teamsUsed];
}

export const scrapeCharactersUsed = async (
    videoUrlList: string[],
    tallyFunctions: TallyFunctions,
    prismaWrapperFunctions: PrismaWrapperFunctions,
    executeTallyFunction: ExecuteTallyFunction,
    determineGameTitleFunction: DetermineGameTitleFunction,
    waitThenClick: WaitThenClick,
    browser: Browser,
    prisma: PrismaClient
) => {

    const tournaments: Tournament[] = [];

    for (const videoUrl of videoUrlList) {
        const page = await browser.newPage();

        await page.goto(videoUrl);

        await page.waitForSelector('#title > h1 > yt-formatted-string');

        const titleString = await page.$eval('#title > h1 > yt-formatted-string', title => title.textContent) ?? "";

        const allGames = await prisma.game.findMany();

        const gameTitle = determineGameTitleFunction(titleString, allGames);

        if (gameTitle === 'Video not applicable!') {
            await page.close();
            continue;
        }

        await waitThenClick('tp-yt-paper-button#expand', page);

        const dateString = await page.$eval('yt-formatted-string#info', info => info.children[2].textContent) ?? "";

        const descriptionArray = await page.$$eval('span.yt-core-attributed-string--link-inherit-color', spans => {
            // the slice method eliminates pesky line breaks
            return spans.map(span => (span.textContent ?? "").slice(0, -2));
        })

        const currentGame = allGames.filter(game => game.name === gameTitle)[0];

        const characters = await prismaWrapperFunctions.getCharactersByGame(prisma, currentGame.id);

        const [charactersUsed, teamsUsed] = await executeTallyFunction(
            prisma,
            descriptionArray,
            tallyFunctions,
            currentGame,
            characters,
            prismaWrapperFunctions.getCharacterByGameIdAndNameOrNull
        );

        if (Object.keys(charactersUsed).length === 0) {
            await page.close();
            continue;
        }

        const tourneyData: TourneyData = {
            title: titleString,
            gameId: currentGame.id,
            url: videoUrl,
            date: new Date(dateString)
        };

        const tournament: Tournament = await prismaWrapperFunctions.saveTournament(prisma, tourneyData, charactersUsed, teamsUsed);

        console.log(tournament);
        tournaments.push(tournament);

        await page.close();
    }

    await browser.close();

    return tournaments;
};

export const determineGameInVideo = (videoTitle: string, games: Game[]) => {
    const normalizedTitle = videoTitle.toLowerCase();
    const gameNames = games.map(game => game.name);

    if (!normalizedTitle.includes('top 8') || normalizedTitle.includes("palette") || normalizedTitle.includes("swap")) {
        return 'Video not applicable!';
    }

    for (const name of gameNames) {
        if (normalizedTitle.includes(name)) {
            return name;
        }
    }

    return 'Video not applicable!';
}

// } else if (normalizedTitle.includes('ssbu') || normalizedTitle.includes('smash') && normalizedTitle.includes('ultimate')) {
//     return 'ssbu';
//     DBFZ is annoying because of variations of goku, gohan, etc. Will look at potential solution later
//     else if (normalizedTitle.includes('dbfz') || normalizedTitle.includes('fighter') && normalizedTitle.includes('z')) {
//          return 'dbfz';
//     }
//     Strive is also causing issues because entire tournaments are being posted as single videos, rather than being split into waves

export const waitThenClick = async (selector: string, page: Page, clicks = 1) => {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    if (element !== null) await element.click({ clickCount: clicks });
    return element;
}