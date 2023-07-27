import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());

import { PrismaClient } from '@prisma/client';
import { scrapeCharactersUsed, prismaWrapperFunctions, determineGameInVideo, waitThenClick } from "./functions";
import { tallyCharactersUsed } from "./functions/tallyFunctions";

const prisma = new PrismaClient();

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });

    const videoList = (await prisma.videoURL.findMany()).map(obj => obj.url);

    const tournaments = await scrapeCharactersUsed(
        videoList,
        tallyCharactersUsed,
        prismaWrapperFunctions,
        determineGameInVideo,
        waitThenClick,
        browser,
        prisma
    );

    console.log(tournaments.length);

    await browser.close();
})();