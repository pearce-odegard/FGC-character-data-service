import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
import { Browser, ElementHandle, Page } from "puppeteer";
import { CharactersUsed, PrismaWrapperFunctions, TallyFunctions, TeamUsed, TourneyData } from "./types";
import { Character, Game, PrismaClient, Tournament } from "@prisma/client";
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());


export const scrapeCharactersUsed = async (
    videoUrlList: string[],
    tallyFunctions: TallyFunctions,
    prismaWrapperFunctions: PrismaWrapperFunctions,
    tallyCharactersUsed: (
        prisma: PrismaClient,
        htmlElementArray: string[],
        tallyFunctions: TallyFunctions,
        game: Game,
        characters: Character[],
        characterFunction: (a: PrismaClient, b: number, c: string) => Promise<Character | null>
    ) => Promise<[CharactersUsed, TeamUsed[]]>,
    determineGameTitleFunction: (x: string) => string,
    waitThenClick: (x: string, y: Page, z?: number) => Promise<ElementHandle<Element> | null>,
    browser: Browser,
    prisma: PrismaClient
) => {

    const tournaments: Tournament[] = [];

    for (const videoUrl of videoUrlList) {
        const page = await browser.newPage();

        await page.goto(videoUrl);

        await page.waitForSelector('#title > h1 > yt-formatted-string');

        const titleString = await page.$eval('#title > h1 > yt-formatted-string', title => title.textContent) ?? "";

        const gameTitle: string = determineGameTitleFunction(titleString);

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

        const currentGame = await prismaWrapperFunctions.getGameByName(prisma, gameTitle);

        const characters = await prismaWrapperFunctions.getCharactersByGame(prisma, currentGame.id);

        const tourneyData: TourneyData = {
            title: titleString,
            gameId: currentGame.id,
            url: videoUrl,
            date: new Date(dateString)
        };

        const [charactersUsed, teamsUsed] = await tallyCharactersUsed(
            prisma,
            descriptionArray,
            tallyFunctions,
            currentGame,
            characters,
            prismaWrapperFunctions.getCharacterByGameIdAndNameOrNull
        );

        const tournament: Tournament = await prismaWrapperFunctions.saveTournament(prisma, tourneyData, charactersUsed, teamsUsed);

        console.log(tournament);
        tournaments.push(tournament);

        await page.close();
    }

    await browser.close();

    return tournaments;
};

export const getVideoURLs = async (searchURL: string, browser: Browser) => {

    const page = await browser.newPage();
    await page.goto(searchURL);

    let shouldKeepScrolling = true;

    while (shouldKeepScrolling) {
        // attempt to find a random video that is at the very end of the page
        try {
            await page.waitForSelector('a[href="/watch?v=j4Ffaf-4vUs"]', { timeout: 50 });
            // set shouldKeepScrolling to false once it is found
            shouldKeepScrolling = false;
        } catch (e) {
            // if error thrown, scroll
            await autoScroll(page);
        }
    }

    const videoThumbnails = await page.$$('a#thumbnail.ytd-thumbnail');
    const propertyJsHandles = await Promise.all(
        videoThumbnails.map(handle => handle.getProperty('href'))
    );
    const hrefs = await Promise.all(
        propertyJsHandles.map(handle => handle.jsonValue())
    );

    await page.close();

    return hrefs;
}

const autoScroll = async (page: Page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let distance = 1000000;
            let totalHeight = 0;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve(true);
                }
            }, 50);
        });
    });
}

export const determineGameInVideo = (videoTitle: string) => {
    const normalizedTitle = videoTitle.toLowerCase();
    switch (true) {
        case !normalizedTitle.includes('top 8')
            || normalizedTitle.includes("palette")
            || normalizedTitle.includes("swap"):
            return 'Video not applicable!';
        case normalizedTitle.includes('umvc3'):
            return 'marvel';
        case normalizedTitle.includes('sf6'):
            return 'sf6';
        default:
            return 'Video not applicable!';
    }

    // } else if (normalizedTitle.includes('ssbu') || normalizedTitle.includes('smash') && normalizedTitle.includes('ultimate')) {
    //     return 'ssbu';
    //     DBFZ is annoying because of variations of goku, gohan, etc. Will look at potential solution later
    //     else if (normalizedTitle.includes('dbfz') || normalizedTitle.includes('fighter') && normalizedTitle.includes('z')) {
    //          return 'dbfz';
    //     }
    //     Strive is also causing issues because entire tournaments are being posted as single videos, rather than being split into waves
}

export const waitThenClick = async (selector: string, page: Page, clicks = 1) => {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    if (element !== null) await element.click({ clickCount: clicks });
    return element;
}

export const tallyCharactersUsed = async (
    prisma: PrismaClient,
    htmlElementArray: string[],
    tallyFunctions: TallyFunctions,
    game: Game,
    characters: Character[],
    characterFunction: (a: PrismaClient, b: number, c: string) => Promise<Character | null>
): Promise<[CharactersUsed, TeamUsed[]]> => {

    let charactersUsed: CharactersUsed = {};
    let teamsUsed: TeamUsed[] = [];

    if (game.name === 'marvel') {
        [charactersUsed, teamsUsed] = await tallyFunctions.marvel(prisma, game, htmlElementArray, characterFunction);
    } else if (game.name === 'sf6') {
        charactersUsed = tallyFunctions.sf6(htmlElementArray, characters);
    }

    return [charactersUsed, teamsUsed];
}