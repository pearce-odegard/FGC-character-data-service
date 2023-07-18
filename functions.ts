import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
import { Browser, Page } from "puppeteer";
import { CharactersUsed, TallyFunctions, TeamUsed, TourneyData } from "./types";
import { PrismaClient, Tournament } from "@prisma/client";
import { getCharactersByGame, getGameByName, saveTournament } from "./prismaWrapperFunctions";
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());


export const scrapeCharactersUsed = async (
    videoUrlList: string[],
    tallyFunctions: TallyFunctions,
    determineGameTitleFunction: (x: string) => string,
    browser: Browser,
    prisma: PrismaClient
) => {

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

        let charactersUsed: CharactersUsed = {};
        let teamsUsed: TeamUsed[] = [];

        const currentGame = await getGameByName(prisma, gameTitle);

        const characters = await getCharactersByGame(prisma, currentGame.id);

        if (gameTitle === 'marvel') {
            const marvelTallyResult = await tallyFunctions.marvel(prisma, currentGame, descriptionArray);
            charactersUsed = marvelTallyResult.charactersUsed;
            teamsUsed = marvelTallyResult.teamsUsed;
        } else if (gameTitle === 'sf6') {
            charactersUsed = tallyFunctions.sf6(descriptionArray, characters);
        }

        const tourneyData: TourneyData = {
            title: titleString,
            gameId: currentGame.id,
            url: videoUrl,
            date: new Date(dateString),
        };

        const tournament = await saveTournament(prisma, tourneyData, charactersUsed, teamsUsed);

        await page.close();
    }

    await browser.close();

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
        case !normalizedTitle.includes('top 8'):
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

const waitThenClick = async (selector: string, page: Page, clicks = 1) => {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    if (element !== null) await element.click({ clickCount: clicks });
    return element;
}