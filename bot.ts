import dotenv from 'dotenv';
dotenv.config();

import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());

import { scrapeCharactersUsed, determineGameInVideo, tallyCharactersUsed, waitThenClick } from "./functions";
import { PrismaClient } from '@prisma/client';
import { tallyFunctions } from './tallyFunctions';
import { prismaWrapperFunctions } from './prismaWrapperFunctions';

const prisma = new PrismaClient();

(async () => {
    const browser = await puppeteer.launch({ headless: false });

    // the slice removes the first and last items, which for some reason are showing up as empty strings
    // const videoList = (await getVideoURLs(process.env.SEARCHURL ?? "", browser)).slice(1, -1);

    // await prisma.videoURL.createMany({
    //     data: videoList.map(url => {
    //         return { url };
    //     })
    // })

    const videoList = (await prisma.videoURL.findMany()).map(obj => obj.url);

    const tournaments = await scrapeCharactersUsed(
        videoList,
        tallyFunctions,
        prismaWrapperFunctions,
        tallyCharactersUsed,
        determineGameInVideo,
        waitThenClick,
        browser,
        prisma
    );

    console.log(tournaments.length);

    await browser.close();
})();