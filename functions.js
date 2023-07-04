import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());



export const tallyCharactersUsedMarvel = (htmlElementArray) => {
    const characters = [
        "Akuma",
        "Amaterasu",
        "Arthur",
        "C.Viper",
        "Chris",
        "Chun-Li",
        "Dante",
        "Felicia",
        "Firebrand",
        "Frank",
        "Haggar",
        "Hsien-Ko",
        "Jill",
        "Morrigan",
        "Nemesis",
        "Wright",
        "Ryu",
        "Spencer",
        "Strider",
        "Trish",
        "Tron",
        "Vergil",
        "Viewtiful",
        "Wesker",
        "Zero",
        "Captain",
        "Deadpool",
        "Doom",
        "Strange",
        "Dormammu",
        "Ghost",
        "Hawkeye",
        "Hulk",
        "Fist",
        "Man",
        "Magneto",
        "MODOK",
        "Nova",
        "Phoenix",
        "Rocket",
        "Sentinel",
        "She-Hulk",
        "Shuma-Gorath",
        "Spider",
        "Storm",
        "Skrull",
        "Taskmaster",
        "Thor",
        "Wolverine",
        "X-23"
    ]

    const filteredMatchups = htmlElementArray.filter((element, index) => {
        return element.includes('vs') || element.includes('vs.');
    });

    // const charactersInTop8 = {};




    // solution using a split up array of each word in each of the top 8 player matchups
    // const wordArray = filteredMatchups.slice(0, 4).join("").toString().replace(/(\(|\)|\,|\.|\-)/gm, '').split(" ");


    // for (const word of wordArray) {
    //     if (characters.includes(word) && charactersInTop8.hasOwnProperty(word)) {
    //         charactersInTop8[word] += 1;
    //     } else if (characters.includes(word)) {
    //         charactersInTop8[word] = 1;
    //     }
    // }

    return charactersInTop8;
}

export const scrapeCharactersUsed = async (videoUrl) => {

    const browser = await puppeteer.launch({ headless: 'new' });

    const page = await browser.newPage();
    await page.goto(videoUrl);

    const waitThenClick = async (selector, clicks = 1) => {
        await page.waitForSelector(selector);
        const element = await page.$(selector);
        await element.click({ clickCount: clicks });
        return element;
    }

    await waitThenClick('tp-yt-paper-button#expand');

    const descriptionArray = await page.$$eval('span.yt-core-attributed-string--link-inherit-color', spans => {
        // the slice method eliminates pesky line breaks
        return spans.map(span => span.textContent.slice(0, -2));
    })

    // extracting this code to an external function
    // tallyCharactersUsedMarvel

    const charactersInTop8 = tallyCharactersUsedMarvel(descriptionArray);

    // example object for storing data about a given tournament top 8

    const dateString = await page.$eval('yt-formatted-string#info', info => info.children[2].textContent)
    const currentEvent = {
        title: await page.$eval('#title > h1 > yt-formatted-string', title => title.textContent),
        dateString: dateString,
        date: new Date(dateString).getTime(),
        url: videoUrl,
        charactersUsed: charactersInTop8
    }

    // console.log(currentEvent);

    // We now have a list of each character that was used in this particular event's Top 8. Nice!

    await browser.close();

    return currentEvent;
};

