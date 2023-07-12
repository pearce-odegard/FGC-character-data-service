import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
import { Browser, Page } from "puppeteer";
import { CharacterLists, CharactersUsed, Team, TourneyData } from "./types";
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());


export const scrapeCharactersUsed = async (
    videoUrlList: string[],
    tallyFunction: (a: string[], b: string[], c: string) => [CharactersUsed, Team[]],
    characterLists: CharacterLists,
    determineGameTitleFunction: (x: string) => string,
    browser: Browser
) => {


    const tourneyDataList = [];

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

        const [charactersInTop8, teamsUsedTop8] = tallyFunction(descriptionArray, characterLists[gameTitle], gameTitle);

        // example object for storing data about a given tournament top 8

        const currentTourneyData: TourneyData = {
            title: titleString,
            game: gameTitle,
            dateString: dateString,
            date: new Date(dateString).getTime(),
            url: videoUrl,
            charactersUsed: charactersInTop8
        }

        if (teamsUsedTop8.length > 0) {
            currentTourneyData.teamsUsed = teamsUsedTop8;
        }

        console.log(currentTourneyData);

        tourneyDataList.push(currentTourneyData);

        await page.close();
    }

    // await browser.close();

    return tourneyDataList;
};

export const getVideoURLs = async (searchURL: string, browser: Browser) => {

    const page = await browser.newPage();
    await page.goto(searchURL);

    let shouldKeepScrolling = true;

    while (shouldKeepScrolling) {
        // attempt to find a random video that is far down the list
        try {
            await page.waitForSelector('a[href="/watch?v=j4Ffaf-4vUs"]', { timeout: 50 });
            // set shouldKeepScrolling to false once it is found
            shouldKeepScrolling = false;
        } catch (e) {
            // if error thrown, scroll again
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
    let normalizedTitle = videoTitle.toLowerCase();
    if (!normalizedTitle.includes('top 8')) {
        return 'Video not applicable!';
    } else if (normalizedTitle.includes('umvc3')) {
        return 'marvel';
    } else if (normalizedTitle.includes('sf6')) {
        return 'sf6';
    } else if (normalizedTitle.includes('ssbu') || normalizedTitle.includes('smash') && normalizedTitle.includes('ultimate')) {
        return 'ssbu';
    } else {
        return 'Video not applicable!';
    }

    //     DBFZ is annoying because of variations of goku, gohan, etc. Will look at potential solution later
    //     else if (normalizedTitle.includes('dbfz') || normalizedTitle.includes('fighter') && normalizedTitle.includes('z')) {
    //          return 'dbfz';
    //     }
    //     Strive is also causing issues because entire tournaments are being posted as single videos, rather being split into waves
}

const waitThenClick = async (selector: string, page: Page, clicks = 1) => {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    if (element !== null) await element.click({ clickCount: clicks });
    return element;
}