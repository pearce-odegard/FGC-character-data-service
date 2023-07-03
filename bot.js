import dotenv from 'dotenv';
dotenv.config();

import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
import { characters } from './charactersUMVC3.js';
puppeteer.use(StealthPlugin());

(async () => {

    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    await page.goto(process.env.TESTURL);

    const waitThenClick = async (selector, clicks = 1) => {
        await page.waitForSelector(selector);
        const element = await page.$(selector);
        await element.click({ clickCount: clicks });
        return element;
    }

    await waitThenClick('tp-yt-paper-button#expand');

    const matchups = await page.$$eval('span.yt-core-attributed-string--link-inherit-color', matchups => {
        return matchups.map(matchup => matchup.textContent.slice(0, -2));
    })

    const filteredMatchups = matchups.filter((element, index) => {
        return element.includes('vs') && index < 20 || element.includes('vs.') && index < 20;
    });

    // At this point we have successfully scraped data from a single youtube page and acquired raw text that
    // includes the characters used in the Top 8

    // join the array (removing any commas and parentheses) and search for names?
    console.log(filteredMatchups.join("").toString())
    const wordArray = filteredMatchups.join("").toString().replace(/(\(|\)|\,|\.|\\n)/gm, '').split(" ");
    // console.log(wordArray);

    const charactersInTop8 = [];

    for (const word of wordArray) {
        if (characters.includes(word) && !charactersInTop8.includes(word)) {
            charactersInTop8.push(word);
        }
    }

    console.log(charactersInTop8);

    // example object for storing data about a given TNS UMvC3 weekly
    const currentEvent = {
        title: await page.$eval('a[spellcheck=false]', title => title.textContent),
        // date: await page.$eval('#info', date => date.textContent),
        charactersUsed: charactersInTop8
    }

    console.log(currentEvent);

    // We now have a list of each character that was used in this particular event's Top 8. Nice!

    // await browser.close();
})();