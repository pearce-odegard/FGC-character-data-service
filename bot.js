import dotenv from 'dotenv';
dotenv.config();

import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
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




    // await browser.close();
})();