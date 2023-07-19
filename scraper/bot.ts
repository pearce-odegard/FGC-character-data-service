import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());

import { PrismaClient } from '@prisma/client';
import { scrapeCharactersUsed, tallyFunctions, prismaWrapperFunctions, executeTallyFunction, determineGameInVideo, waitThenClick } from "./functions";

const prisma = new PrismaClient();

(async () => {
    const browser = await puppeteer.launch({ headless: false });

    const videoList = (await prisma.videoURL.findMany()).map(obj => obj.url);

    const tournaments = await scrapeCharactersUsed(
        videoList,
        tallyFunctions,
        prismaWrapperFunctions,
        executeTallyFunction,
        determineGameInVideo,
        waitThenClick,
        browser,
        prisma
    );

    console.log(tournaments.length);

    await browser.close();
})();