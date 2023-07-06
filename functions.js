import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());



export const tallyCharactersUsed = (htmlElementArray, characters) => {


    const filteredMatchups = htmlElementArray.filter((element, index) => {
        return element.includes('vs');
    });

    const charactersInTop8 = {};

    // RegEx string matching solution

    // Starting by slicing the first 4 elements so as not to include anything other matchups
    // than winners and losers round 1 of top 8, then mashing it all into one big string (excluding any parentheses, commas, periods, etc)
    // to be searched
    const matchupsString = filteredMatchups.slice(0, 4).join("").replace(/(\(|\)|\,|\.|\-)/gm, '');

    for (const character of characters) {
        const numberOfUses = (matchupsString.match(new RegExp(`${character}`, 'g')) || []).length;
        if (numberOfUses > 0) {
            charactersInTop8[character] = numberOfUses;
        }
    }

    return charactersInTop8;
}


export const scrapeCharactersUsed = async (videoUrlList, tallyFunction, characterLists, determineGameTitleFunction) => {

    const browser = await puppeteer.launch({ headless: false });

    const tourneyDataList = [];

    for (const videoUrl of videoUrlList) {
        const page = await browser.newPage();

        await page.goto(videoUrl);

        const waitThenClick = async (selector, clicks = 1) => {
            await page.waitForSelector(selector);
            const element = await page.$(selector);
            await element.click({ clickCount: clicks });
            return element;
        }

        await page.waitForSelector('#title > h1 > yt-formatted-string');

        const titleString = await page.$eval('#title > h1 > yt-formatted-string', title => title.textContent);

        const gameTitle = determineGameTitleFunction(titleString);

        if (gameTitle === 'Video not applicable!') {
            await page.close();
            continue;
        }

        await waitThenClick('tp-yt-paper-button#expand');

        const dateString = await page.$eval('yt-formatted-string#info', info => info.children[2].textContent);

        // example object for storing data about a given tournament top 8

        const currentTourneyData = {
            title: titleString,
            game: gameTitle,
            dateString: dateString,
            date: new Date(dateString).getTime(),
            url: videoUrl
        }

        const descriptionArray = await page.$$eval('span.yt-core-attributed-string--link-inherit-color', spans => {
            // the slice method eliminates pesky line breaks
            return spans.map(span => span.textContent.slice(0, -2));
        })

        // extracting this code to an external function
        // tallyCharactersUsedMarvel

        let charactersInTop8 = tallyFunction(descriptionArray, characterLists[gameTitle]);

        currentTourneyData.charactersUsed = charactersInTop8;

        console.log(currentTourneyData);

        tourneyDataList.push(currentTourneyData);

        await page.close();
    }

    await browser.close();

    return tourneyDataList;
};

export const getVideoURLs = async (searchURL) => {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    await page.goto(searchURL);

    let shouldKeepScrolling = true;

    while (shouldKeepScrolling) {
        // attempt to find a random video that is far down the list
        try {
            await page.waitForSelector('a[href="/watch?v=IlAHAqIW_iE"]', { timeout: 100 });
            // set shouldKeepScrolling to false once it is found
            shouldKeepScrolling = false;
        } catch (e) {
            // if error thrown, scroll again
            await autoScroll(page);
        }
    }

    const videoThumbnails = await page.$$('a#thumbnail');
    const propertyJsHandles = await Promise.all(
        videoThumbnails.map(handle => handle.getProperty('href'))
    );
    const hrefs = await Promise.all(
        propertyJsHandles.map(handle => handle.jsonValue())
    );

    await browser.close();

    return hrefs;
}

const autoScroll = async (page) => {
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
                    resolve();
                }
            }, 100);
        });
    });
}

export const determineGameInVideo = (videoTitle) => {
    let normalizedTitle = videoTitle.toLowerCase();
    if (!normalizedTitle.includes('top 8')) {
        return 'Video not applicable!';
    } else if (normalizedTitle.includes('umvc3')) {
        return 'marvel';
    } else if (normalizedTitle.includes('sf6')) {
        return 'sf6';
    } else if (normalizedTitle.includes('strive')) {
        return 'strive';
    } else if (normalizedTitle.includes('ssbu') || normalizedTitle.includes('smash') && normalizedTitle.includes('ultimate')) {
        return 'ssbu';
    } else {
        return 'Video not applicable!';
    }

    //     DBFZ is annoying because of variations of goku, gohan, etc. Will look at potential solution later
    //     else if (normalizedTitle.includes('dbfz') || normalizedTitle.includes('fighter') && normalizedTitle.includes('z')) {
    //          return 'dbfz';
    //     }
}

