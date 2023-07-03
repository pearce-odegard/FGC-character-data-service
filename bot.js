import dotenv from 'dotenv';
dotenv.config();

import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());

import { characters } from './charactersUMVC3';

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
        return matchups.map(matchup => matchup.textContent);
    })

    const filteredMatchups = matchups.filter((element, index) => {
        return element.includes('vs') && index < 20 || element.includes('vs.') && index < 20;
    });

    // await browser.close();
})();